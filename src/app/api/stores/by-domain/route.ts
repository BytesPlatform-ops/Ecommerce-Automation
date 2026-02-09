import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDomain } from "@/lib/domain-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter is required" },
        { status: 400 }
      );
    }

    // Normalize the domain (remove www., protocol, etc.)
    const normalizedDomain = normalizeDomain(domain);
    console.log(`[API by-domain] Looking up: "${normalizedDomain}" (original: "${domain}")`);

    // First, check if any store has this domain (regardless of status)
    const anyStore = await prisma.store.findFirst({
      where: {
        OR: [
          { domain: normalizedDomain },
          { domain: `www.${normalizedDomain}` },
          { domain: domain },
        ],
      },
      select: {
        id: true,
        subdomainSlug: true,
        storeName: true,
        domain: true,
        domainStatus: true,
      },
    });

    if (!anyStore) {
      console.log(`[API by-domain] No store found with domain: "${normalizedDomain}"`);
      return NextResponse.json(
        { error: "Store not found for this domain" },
        { status: 404 }
      );
    }

    console.log(`[API by-domain] Found store: slug="${anyStore.subdomainSlug}", domain="${anyStore.domain}", status="${anyStore.domainStatus}"`);

    // Check if domain is live
    if (anyStore.domainStatus !== "Live") {
      console.log(`[API by-domain] Store exists but status is "${anyStore.domainStatus}", not "Live"`);
      return NextResponse.json(
        { error: `Domain exists but status is ${anyStore.domainStatus}`, status: anyStore.domainStatus },
        { status: 404 }
      );
    }

    return NextResponse.json({ store: anyStore });
  } catch (error) {
    console.error("[API by-domain] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
