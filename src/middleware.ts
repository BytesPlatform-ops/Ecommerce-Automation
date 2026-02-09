import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";

// Platform domains - these are YOUR main domains where the landing page lives
const PLATFORM_DOMAINS = [
  "localhost:3000",
  "localhost",
  "127.0.0.1:3000",
  "127.0.0.1",
  "ecommerce-automation-wt2l.onrender.com", // Your Render domain
  // Add your main production domain here when you have one
  // "mystorefactory.com",
  // "www.mystorefactory.com",
];

// Check if this is a platform domain
function isPlatformDomain(hostname: string): boolean {
  // Remove port for comparison if needed
  const hostWithoutPort = hostname.split(":")[0];
  
  return PLATFORM_DOMAINS.some((domain) => {
    const domainWithoutPort = domain.split(":")[0];
    // Match exact hostname or hostname without port
    return hostname === domain || hostWithoutPort === domainWithoutPort;
  });
}

// Normalize domain for database lookup
function normalizeDomainForLookup(domain: string): string {
  let normalized = domain.trim().toLowerCase();
  // Remove www. prefix for lookup
  normalized = normalized.replace(/^www\./, "");
  // Remove port if present
  normalized = normalized.split(":")[0];
  return normalized;
}

// Lookup store by custom domain using Supabase (Edge compatible)
async function getStoreByDomain(domain: string): Promise<string | null> {
  try {
    // Create a Supabase client for Edge runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const normalizedDomain = normalizeDomainForLookup(domain);
    console.log(`[Domain Lookup] Looking up domain: "${normalizedDomain}" (original: "${domain}")`);

    // First, query WITHOUT status filter to check if domain exists at all
    const { data: anyStore, error: anyError } = await supabase
      .from("stores")
      .select("subdomainSlug, domain, domainStatus")
      .eq("domain", normalizedDomain)
      .maybeSingle();

    if (anyError) {
      console.log(`[Domain Lookup] Error querying store: ${anyError.message}`, anyError);
      return null;
    }

    if (!anyStore) {
      console.log(`[Domain Lookup] No store found with domain: "${normalizedDomain}"`);
      return null;
    }

    console.log(`[Domain Lookup] Found store with domain "${anyStore.domain}", status: "${anyStore.domainStatus}"`);

    // Check if domain status is Live
    if (anyStore.domainStatus !== "Live") {
      console.log(`[Domain Lookup] Store found but status is "${anyStore.domainStatus}", not "Live"`);
      return null;
    }

    return anyStore.subdomainSlug;
  } catch (error) {
    console.error("[Domain Lookup] Exception looking up store by domain:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Check if this is a platform domain
  if (isPlatformDomain(hostname)) {
    // This is the main platform (landing page, dashboard, etc.)
    // Let it proceed through the normal Supabase session handling
    return await updateSession(request);
  }

  // ============================================
  // CUSTOM DOMAIN HANDLING
  // ============================================
  // If we get here, this is a custom domain (e.g., www.example.com)
  // We need to find which store it belongs to and rewrite to /stores/[username]

  const storeSlug = await getStoreByDomain(hostname);

  if (storeSlug) {
    // Build the redirect path
    // If user visits example.com/about, redirect to platform/stores/username/about
    // If user visits example.com/, redirect to platform/stores/username
    let redirectPath = `/stores/${storeSlug}`;
    
    // Append the current path (but not if it's just "/")
    if (pathname && pathname !== "/") {
      redirectPath += pathname;
    }

    // Append query string if present
    if (url.search) {
      redirectPath += url.search;
    }

    // Determine the platform domain to redirect to
    // Check if we're in production (Render sets RENDER=true, or check NODE_ENV)
    const isProduction = process.env.RENDER === "true" || 
                         process.env.NODE_ENV === "production" ||
                         !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("localhost");
    
    let platformDomain = "localhost:3000"; // Default for development
    if (isProduction) {
      platformDomain = process.env.NEXT_PUBLIC_PLATFORM_URL || "ecommerce-automation-wt2l.onrender.com";
    }
    
    console.log(`[Custom Domain] Redirecting ${hostname}${pathname} to ${platformDomain}${redirectPath}`);

    // Redirect to platform domain with the store path
    const protocol = platformDomain.includes("localhost") ? "http" : "https";
    const redirectUrl = new URL(`${protocol}://${platformDomain}${redirectPath}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Store not found for this domain - show a 404 page
  console.log(`[Custom Domain] No store found for hostname: ${hostname} - showing 404`);
  
  // Redirect to main platform with an error, or show 404
  // For now, just let it continue (will likely show 404)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: We removed 'stores' and 'api' from exclusion to handle them properly
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
