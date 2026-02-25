import { redirect } from "next/navigation";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/product-form";
import { ArrowLeft, Package2 } from "lucide-react";
import Link from "next/link";

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

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Create New Product
                </h1>
                <p className="text-gray-600 mt-1">Add a new product to your {store.storeName} store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Form Container */}
          <div className="p-8 lg:p-10">
            <ProductForm storeId={store.id} categories={categories} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Product Details</p>
                <p className="text-xs text-gray-500">Name and description</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">$</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pricing & Stock</p>
                <p className="text-xs text-gray-500">Price and inventory</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">+</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Variants</p>
                <p className="text-xs text-gray-500">Sizes and options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
