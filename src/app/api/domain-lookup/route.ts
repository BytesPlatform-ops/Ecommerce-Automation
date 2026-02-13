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
    // Query with timeout to prevent hanging
    const store = await Promise.race([
      prisma.store.findFirst({
        where: {
          domainStatus: "Live",
          OR: [
            { domain: normalized },
            { domain: `www.${normalized}` },
            { domain: hostname },
          ],
        },
        select: { subdomainSlug: true },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)), // 4s timeout
    ]);

    return NextResponse.json({ slug: store?.subdomainSlug ?? null });
  } catch (error) {
    console.error("[Domain Lookup API] Error:", error);
    // Return null instead of 500 so middleware can gracefully fail over
    return NextResponse.json({ slug: null }, { status: 200 });
  }
}
