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

  const productsData = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  const products = productsData.map((product) => ({
    ...product,
    price: product.price.toNumber(),
  }));

  return <ProductsPageContent products={products} />;
}
