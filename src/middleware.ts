import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Platform domains - these are YOUR main domains where the landing page lives
const PLATFORM_DOMAINS = [
  "localhost:3000",
  "localhost",
  "127.0.0.1:3000",
  "127.0.0.1",
  // Production domains loaded from env at runtime
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")]
    : []),
];

// ─── In-memory domain → slug cache (TTL: 24 hours) ───
const DOMAIN_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (domain mappings are stable)
const domainCache = new Map<string, { slug: string | null; expires: number }>();

function getCachedSlug(domain: string): string | null | undefined {
  const entry = domainCache.get(domain);
  if (!entry) return undefined; // cache miss
  if (Date.now() > entry.expires) {
    domainCache.delete(domain);
    return undefined; // expired
  }
  return entry.slug;
}

function setCachedSlug(domain: string, slug: string | null) {
  domainCache.set(domain, { slug, expires: Date.now() + DOMAIN_CACHE_TTL });
  // Evict stale entries periodically (keep cache small)
  if (domainCache.size > 200) {
    const now = Date.now();
    for (const [key, val] of domainCache) {
      if (now > val.expires) domainCache.delete(key);
    }
  }
}

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

// Lookup store by custom domain — fetch internal API with in-memory cache
async function getStoreByDomain(domain: string, request: NextRequest): Promise<string | null> {
  try {
    const normalizedDomain = normalizeDomainForLookup(domain);

    // Check in-memory cache first
    const cached = getCachedSlug(normalizedDomain);
    if (cached !== undefined) {
      return cached;
    }

    // Build absolute URL pointed at the same origin
    const apiUrl = new URL(`/api/domain-lookup?hostname=${encodeURIComponent(domain)}`, request.url);
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      console.error("[Domain Lookup] API returned", res.status);
      return null;
    }

    const data = await res.json();
    const slug: string | null = data.slug ?? null;
    setCachedSlug(normalizedDomain, slug);
    return slug;
  } catch (error) {
    console.error("[Domain Lookup] Error:", error);
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

  const storeSlug = await getStoreByDomain(hostname, request);

  if (storeSlug) {
    // Build the rewrite path
    // If user visits example.com/about, rewrite to /stores/username/about
    // If user visits example.com/, rewrite to /stores/username
    let rewritePath = `/stores/${storeSlug}`;
    
    // Append the current path (but not if it's just "/")
    if (pathname && pathname !== "/") {
      rewritePath += pathname;
    }

    // Append query string if present
    if (url.search) {
      rewritePath += url.search;
    }

    console.log(`[Custom Domain] Rewriting ${hostname}${pathname} to ${rewritePath}`);

    // Rewrite the request (keeps original domain in browser, serves from /stores/[username] path)
    return NextResponse.rewrite(new URL(rewritePath, request.url));
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
