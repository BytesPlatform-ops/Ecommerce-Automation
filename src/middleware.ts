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

// Get the platform URL for internal API calls
function getPlatformUrl(): string {
  // Check for explicit platform URL first
  if (process.env.NEXT_PUBLIC_PLATFORM_URL) {
    const url = process.env.NEXT_PUBLIC_PLATFORM_URL;
    return url.startsWith("http") ? url : `https://${url}`;
  }
  
  // Check if we're in production (Render environment)
  if (process.env.RENDER === "true" || process.env.NODE_ENV === "production") {
    // Use the configured app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      return appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
    }
  }
  
  // Default to localhost for development
  return "http://localhost:3000";
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

// ==================== IN-MEMORY DOMAIN CACHE ====================
// Avoids hitting the internal API on every single request for custom domains.
// Entries expire after 60 seconds. The cache lives in middleware's edge runtime.
const domainCache = new Map<string, { slug: string | null; expiresAt: number }>();
const DOMAIN_CACHE_TTL_MS = 60_000; // 60 seconds

// Lookup store by custom domain using internal API (Prisma - bypasses RLS)
async function getStoreByDomain(domain: string): Promise<string | null> {
  try {
    const normalizedDomain = normalizeDomainForLookup(domain);

    // Check in-memory cache first
    const cached = domainCache.get(normalizedDomain);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.slug;
    }

    // Call the internal API endpoint which uses Prisma (bypasses RLS issues)
    const platformUrl = getPlatformUrl();
    const apiUrl = `${platformUrl}/api/stores/by-domain?domain=${encodeURIComponent(normalizedDomain)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Short timeout to avoid blocking
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      domainCache.set(normalizedDomain, { slug: null, expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS });
      return null;
    }

    const data = await response.json();
    
    if (!data.store) {
      domainCache.set(normalizedDomain, { slug: null, expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS });
      return null;
    }

    const slug = data.store.subdomainSlug;
    domainCache.set(normalizedDomain, { slug, expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS });
    return slug;
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
