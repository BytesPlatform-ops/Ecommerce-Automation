import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productId, newStock, variantInfo } = await request.json();

    if (!productId || newStock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: productId, newStock" },
        { status: 400 }
      );
    }

    if (typeof newStock !== "number" || newStock < 0) {
      return NextResponse.json(
        { error: "Invalid stock value. Must be a non-negative number." },
        { status: 400 }
      );
    }

    // If variantInfo is provided, find and update the matching variant
    if (variantInfo) {
      try {
        // Find all variants for this product and match based on variantInfo
        const variants = await prisma.productVariant.findMany({
          where: {
            productId: productId,
          },
        });

        if (!variants || variants.length === 0) {
          return NextResponse.json(
            { error: "No variants found for this product" },
            { status: 404 }
          );
        }

        // Try to find a variant that matches the variantInfo description
        // variantInfo might be formatted like "SIZE: M" or "M", extract the key part
        let targetVariant = null;
        
        // First try exact match on the computed description
        for (const variant of variants) {
          const description = `${variant.sizeType}${variant.value ? ` ${variant.value}` : ''}${variant.unit ? ` ${variant.unit}` : ''}`.trim();
          if (description === variantInfo || variant.value === variantInfo) {
            targetVariant = variant;
            break;
          }
        }

        // If no exact match, just use the first variant (fallback)
        if (!targetVariant) {
          targetVariant = variants[0];
        }

        const updatedVariant = await prisma.productVariant.update({
          where: {
            id: targetVariant.id,
          },
          data: {
            stock: newStock,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Variant stock updated successfully",
          variant: updatedVariant,
        });
      } catch (variantError) {
        console.error("Variant update error:", variantError);
        return NextResponse.json(
          { 
            error: "Unable to update variant stock",
            details: variantError instanceof Error ? variantError.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    } else {
      // Update base product stock
      try {
        const product = await prisma.product.update({
          where: {
            id: productId,
          },
          data: {
            stock: newStock,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Product stock updated successfully",
          product,
        });
      } catch (productError) {
        console.error("Product update error:", productError);
        return NextResponse.json(
          { 
            error: "Product not found or unable to update",
            details: productError instanceof Error ? productError.message : "Unknown error"
          },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error("Failed to update stock:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to update stock",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
