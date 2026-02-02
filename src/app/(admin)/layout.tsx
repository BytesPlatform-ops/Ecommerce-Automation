import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, Package, Palette, Settings, LogOut, Store as StoreIcon } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has a store
  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  });

  // If no store and not on onboarding page, redirect to onboarding
  // This will be handled by individual pages

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <StoreIcon className="h-6 w-6" />
            Chameleon
          </h1>
          {store && (
            <p className="text-sm text-gray-500 mt-1">{store.storeName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Package className="h-5 w-5" />
            Products
          </Link>
          <Link
            href="/dashboard/themes"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Palette className="h-5 w-5" />
            Themes
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {store && (
            <Link
              href={`/stores/${store.subdomainSlug}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-2 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <StoreIcon className="h-4 w-4" />
              View Store
            </Link>
          )}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
