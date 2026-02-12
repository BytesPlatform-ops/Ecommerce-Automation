import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDomain } from "@/lib/domain-utils";
import { checkRateLimit } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP: max 30 lookups per minute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimit = checkRateLimit(`store-lookup:${ip}`, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

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
        subdomainSlug: true,
        storeName: true,
        domain: true,
        domainStatus: true,
      },
    });

    if (!anyStore) {
      return NextResponse.json(
        { error: "Store not found for this domain" },
        { status: 404 }
      );
    }

    // Check if domain is live
    if (anyStore.domainStatus !== "Live") {
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
