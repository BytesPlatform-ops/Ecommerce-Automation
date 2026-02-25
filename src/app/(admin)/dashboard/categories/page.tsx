import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { CategorySettings } from "@/components/dashboard/category-settings";
import { Tag } from "lucide-react";

export default async function CategoriesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } },
      },
    },
  });

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    storeId: cat.storeId,
    name: cat.name,
    sortOrder: cat.sortOrder,
    isPublished: cat.isPublished,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    productCount: cat._count.products,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dash-animate-in">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-gray-500 mt-1">
              Organize your products into categories for your storefront
            </p>
          </div>
        </div>
      </div>

      <CategorySettings storeId={store.id} categories={serializedCategories} />
    </div>
  );
}
