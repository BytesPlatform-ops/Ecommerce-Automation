import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import ProductsPageContent from "./products-content";

export default async function ProductsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with layout
  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    take: 100, // cap at 100 for performance — add pagination if needed
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      imageUrl: true,
      sku: true,
      createdAt: true,
      updatedAt: true,
      storeId: true,
      deletedAt: true,
      variants: {
        select: {
          id: true,
          sizeType: true,
          value: true,
          unit: true,
          stock: true,
          price: true,
        },
      },
    },
  });

  // Convert Decimal to string for client component serialization
  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price ? variant.price.toString() : null,
    })),
  }));

  return <ProductsPageContent products={serializedProducts} />;
}
