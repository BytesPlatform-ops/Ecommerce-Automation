import { redirect } from "next/navigation";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with layout
  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="text-gray-600 mt-1">Create a new product for your store</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
        <ProductForm storeId={store.id} />
      </div>
    </div>
  );
}
