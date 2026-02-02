import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Palette, Eye, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has a store
  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { theme: true },
  });

  if (!store) {
    redirect("/onboarding");
  }

  // Get product count
  const productCount = await prisma.product.count({
    where: { storeId: store.id },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-1">
          Manage your store: <span className="font-medium">{store.storeName}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{productCount || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Theme</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {store.theme?.name || "None"}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Store URL</p>
              <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                /stores/{store.subdomainSlug}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Add Product</span>
          </Link>
          <Link
            href="/dashboard/themes"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Palette className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Change Theme</span>
          </Link>
          <Link
            href={`/stores/${store.subdomainSlug}`}
            target="_blank"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-green-600" />
            <span className="font-medium">View Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
