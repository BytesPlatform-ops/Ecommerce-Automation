import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { RENDER_CONFIG, DOMAIN_STATUS } from "@/lib/domain-utils";
import { addDomainToRender, getDomainFromRender } from "@/lib/render-api";
import { DomainStatus } from "@prisma/client";
import dns from "dns";
import { promisify } from "util";

const dnsResolve4 = promisify(dns.resolve4);

/**
 * POST /api/domains/check-status
 * 
 * Checks DNS records for a store's custom domain and updates status accordingly.
 * If DNS is verified, triggers async Render API call to register domain.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Get store and verify ownership
    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!store.domain) {
      return NextResponse.json(
        { error: "No domain configured for this store" },
        { status: 400 }
      );
    }

    // If already live, verify it's actually accessible
    if (store.domainStatus === DomainStatus.Live) {
      const isAccessible = await verifyDomainAccessible(store.domain);
      
      if (isAccessible) {
        return NextResponse.json({
          status: DOMAIN_STATUS.LIVE,
          domain: store.domain,
          verified: true,
          message: "Your custom domain is live and secured with SSL!",
          certificateGeneratedAt: store.certificateGeneratedAt,
        });
      } else {
        // Domain was marked as live but is no longer accessible
        // Fall back to verifying DNS records
        console.log(`[Domain Check] Domain ${store.domain} marked as Live but not accessible. Checking DNS...`);
      }
    }

    // Check DNS records
    const dnsVerified = await checkDNSRecords(store.domain);

    if (!dnsVerified) {
      // DNS not propagated yet, set to Verifying if not already
      if (store.domainStatus !== DomainStatus.Verifying) {
        await prisma.store.update({
          where: { id: store.id },
          data: { domainStatus: DomainStatus.Verifying },
        });
      }

      return NextResponse.json({
        status: DOMAIN_STATUS.VERIFYING,
        domain: store.domain,
        verified: false,
        message: "DNS records not detected yet. This can take 15-60 minutes to propagate worldwide. Keep checking back!",
      });
    }

    // DNS is verified!
    // If status is still Pending or Verifying, trigger Render API and move to Securing
    if (store.domainStatus === DomainStatus.Pending || store.domainStatus === DomainStatus.Verifying) {
      // Update status to Securing immediately
      await prisma.store.update({
        where: { id: store.id },
        data: { domainStatus: DomainStatus.Securing },
      });

      // Fire async Render API call (don't await to return response quickly)
      // This registers the domain with Render and starts SSL certificate generation
      addDomainToRender(store.domain)
        .then(async (result) => {
          if (result.success) {
            console.log(`[Domain Check] Successfully registered domain ${store.domain} with Render`);
            // Update status to Live and set certificate timestamp
            await prisma.store.update({
              where: { id: store.id },
              data: {
                domainStatus: DomainStatus.Live,
                certificateGeneratedAt: new Date(),
              },
            });
          } else {
            console.error(`[Domain Check] Failed to register domain ${store.domain} with Render:`, result.error);
            // Keep status as Securing - user can retry via refresh
          }
        })
        .catch((error) => {
          console.error(`[Domain Check] Exception registering domain ${store.domain}:`, error);
        });

      return NextResponse.json({
        status: DOMAIN_STATUS.SECURING,
        domain: store.domain,
        verified: true,
        message: "DNS Verified! We're generating your SSL certificate. Your store will be live in 2-5 minutes.",
      });
    }

    // If already in Securing state, check if we should move to Live
    // (In case the async call completed but UI wasn't updated)
    if (store.domainStatus === DomainStatus.Securing) {
      // Check if domain is accessible now
      const isAccessible = await verifyDomainAccessible(store.domain);
      
      if (isAccessible) {
        // Domain is live! Update status
        await prisma.store.update({
          where: { id: store.id },
          data: {
            domainStatus: DomainStatus.Live,
            certificateGeneratedAt: new Date(),
          },
        });

        return NextResponse.json({
          status: DOMAIN_STATUS.LIVE,
          domain: store.domain,
          verified: true,
          message: "Your custom domain is live and secured with SSL!",
          certificateGeneratedAt: new Date().toISOString(),
        });
      }

      // Still securing - try registering again in case previous attempt failed
      addDomainToRender(store.domain)
        .then(async (result) => {
          if (result.success) {
            console.log(`[Domain Check] Domain ${store.domain} registered with Render`);
          }
        })
        .catch(console.error);

      return NextResponse.json({
        status: DOMAIN_STATUS.SECURING,
        domain: store.domain,
        verified: true,
        message: "DNS Verified! We're generating your SSL certificate. Your store will be live in 2-5 minutes.",
      });
    }

    // Default response
    return NextResponse.json({
      status: store.domainStatus,
      domain: store.domain,
      verified: dnsVerified,
    });

  } catch (error) {
    console.error("[Domain Check] Error:", error);
    return NextResponse.json(
      { error: "Failed to check domain status" },
      { status: 500 }
    );
  }
}

/**
 * Check if domain's DNS A record points to Render's IP
 */
async function checkDNSRecords(domain: string): Promise<boolean> {
  try {
    console.log(`[DNS Check] Checking A records for: ${domain}`);
    
    const addresses = await dnsResolve4(domain);
    console.log(`[DNS Check] Found A records:`, addresses);
    
    // Check if any A record points to Render's IP
    const hasRenderIP = addresses.includes(RENDER_CONFIG.IP_ADDRESS);
    
    if (hasRenderIP) {
      console.log(`[DNS Check] Domain ${domain} correctly points to Render IP ${RENDER_CONFIG.IP_ADDRESS}`);
    } else {
      console.log(`[DNS Check] Domain ${domain} does not point to Render IP. Expected: ${RENDER_CONFIG.IP_ADDRESS}, Got: ${addresses.join(", ")}`);
    }
    
    return hasRenderIP;
  } catch (error) {
    // DNS lookup failed - domain not configured yet
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(`[DNS Check] DNS lookup failed for ${domain}: ${errorMessage}`);
    return false;
  }
}

/**
 * Verify that a domain is actually accessible and responds to HTTP requests
 * This ensures the domain is truly live and not just marked as such
 */
async function verifyDomainAccessible(domain: string): Promise<boolean> {
  try {
    console.log(`[Domain Access Check] Verifying ${domain} is accessible...`);
    
    // Try to fetch from the domain with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    
    clearTimeout(timeout);
    
    // Consider 2xx, 3xx responses as accessible (200-399)
    const isAccessible = response.status >= 200 && response.status < 400;
    
    if (isAccessible) {
      console.log(`[Domain Access Check] Domain ${domain} is accessible (HTTP ${response.status})`);
    } else {
      console.log(`[Domain Access Check] Domain ${domain} returned HTTP ${response.status}`);
    }
    
    return isAccessible;
  } catch (error) {
    // Domain is not accessible
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(`[Domain Access Check] Failed to access ${domain}: ${errorMessage}`);
    return false;
  }
}
