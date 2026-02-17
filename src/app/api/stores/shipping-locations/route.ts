import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { error: "Missing storeId" },
      { status: 400 }
    );
  }

  const locations = await prisma.storeShippingLocation.findMany({
    where: { storeId },
    orderBy: { sortOrder: "asc" },
    select: {
      country: true,
      cities: true,
    },
  });

  return NextResponse.json({ locations });
}
