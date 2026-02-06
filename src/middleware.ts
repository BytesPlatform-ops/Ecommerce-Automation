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

    // Query the stores table for this domain - use maybeSingle() instead of single()
    const { data, error } = await supabase
      .from("stores")
      .select("subdomainSlug")
      .eq("domain", normalizedDomain)
      .eq("domainStatus", "Live")
      .maybeSingle();

    if (error) {
      console.log(`Error querying store by domain: ${domain}`, error.message);
      return null;
    }

    if (!data) {
      console.log(`No store found for domain: ${domain}`);
      return null;
    }

    return data.subdomainSlug;
  } catch (error) {
    console.error("Error looking up store by domain:", error);
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
    // Build the rewrite path
    // If user visits www.example.com/about, rewrite to /stores/username/about
    // If user visits www.example.com/, rewrite to /stores/username
    let rewritePath = `/stores/${storeSlug}`;
    
    // Append the current path (but not if it's just "/")
    if (pathname && pathname !== "/") {
      rewritePath += pathname;
    }

    // Append query string if present
    if (url.search) {
      rewritePath += url.search;
    }

    // Rewrite internally - user still sees www.example.com in browser
    return NextResponse.rewrite(new URL(rewritePath, request.url));
  }

  // Store not found for this domain - show a 404 page
  console.log(`No store found for custom domain: ${hostname}`);
  
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
