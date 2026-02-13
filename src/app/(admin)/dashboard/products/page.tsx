import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ProductsPageContent from "./products-content";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  });

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
      imageUrl: true,
      sku: true,
      createdAt: true,
      updatedAt: true,
      storeId: true,
    },
  });

  // Convert Decimal to string for client component serialization
  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
  }));

  return <ProductsPageContent products={serializedProducts} />;
}
