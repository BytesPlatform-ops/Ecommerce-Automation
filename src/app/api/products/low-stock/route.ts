import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";

const LOW_STOCK_THRESHOLD = 10;

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await getOwnerStore(user.id);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Fetch products with low stock (stock <= 10)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
        deletedAt: null,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        imageUrl: true,
      },
      orderBy: { stock: "asc" },
    });

    // Fetch variants with low stock
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        product: {
          storeId: store.id,
          deletedAt: null,
        },
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
      select: {
        id: true,
        sizeType: true,
        value: true,
        unit: true,
        stock: true,
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { stock: "asc" },
    });

    // Format the response
    const items = [
      ...lowStockProducts.map((product) => ({
        id: product.id,
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        imageUrl: product.imageUrl,
        variantInfo: null,
        type: "product" as const,
      })),
      ...lowStockVariants.map((variant) => ({
        id: variant.id,
        productId: variant.product.id,
        productName: variant.product.name,
        currentStock: variant.stock,
        imageUrl: variant.product.imageUrl,
        variantInfo: `${variant.sizeType}${variant.value ? `: ${variant.value}` : ""}${variant.unit ? ` ${variant.unit}` : ""}`.trim(),
        type: "variant" as const,
      })),
    ].sort((a, b) => a.currentStock - b.currentStock);

    return NextResponse.json({
      items,
      totalCount: items.length,
      threshold: LOW_STOCK_THRESHOLD,
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock items" },
      { status: 500 }
    );
  }
}
