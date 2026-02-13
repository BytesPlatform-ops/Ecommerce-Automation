import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const hostname = request.nextUrl.searchParams.get("hostname");
  if (!hostname) {
    return NextResponse.json({ slug: null }, { status: 400 });
  }

  let normalized = hostname.trim().toLowerCase().replace(/^www\./, "").split(":")[0];

  try {
    const store = await prisma.store.findFirst({
      where: {
        domainStatus: "Live",
        OR: [
          { domain: normalized },
          { domain: `www.${normalized}` },
          { domain: hostname },
        ],
      },
      select: { subdomainSlug: true },
    });

    if (store) {
      console.log(`[Domain Lookup] Found: ${hostname} → ${store.subdomainSlug}`);
    } else {
      console.log(`[Domain Lookup] Not found: ${hostname} (normalized: ${normalized})`);
    }

    return NextResponse.json({ slug: store?.subdomainSlug ?? null });
  } catch (error) {
    console.error("[Domain Lookup API] Error:", error);
    return NextResponse.json({ slug: null }, { status: 500 });
  }
}
