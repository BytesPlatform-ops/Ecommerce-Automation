import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    // Fetch products and variants with stock information
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        stock: true,
        variants: {
          select: {
            id: true,
            stock: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const stockMap: Record<string, any> = {};
    products.forEach((product) => {
      stockMap[product.id] = {
        baseStock: product.stock,
        variants: product.variants.reduce(
          (acc, variant) => {
            acc[variant.id] = variant.stock;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    });

    return NextResponse.json({ stock: stockMap });
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch product stock" },
      { status: 500 }
    );
  }
}
