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

    // Look up the store by domain
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { domain: normalizedDomain },
          { domain: `www.${normalizedDomain}` },
          { domain: domain }, // Also try exact match
        ],
        domainStatus: "Live", // Only return stores with verified domains
      },
      select: {
        id: true,
        subdomainSlug: true,
        storeName: true,
        domain: true,
        domainStatus: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found for this domain" },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error looking up store by domain:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
