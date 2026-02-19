import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([
    params,
    getAuthUser(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with layout
  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const product = await prisma.product.findFirst({
    where: {
      id,
      storeId: store.id,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  // Convert Decimal prices to string for client component
  const serializedProduct = {
    ...product,
    price: product.price.toString(),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price ? variant.price.toString() : null,
    })),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update product details</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
        <ProductForm storeId={store.id} product={serializedProduct} />
      </div>
    </div>
  );
}
