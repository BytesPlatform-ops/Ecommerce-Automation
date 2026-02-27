import { redirect } from "next/navigation";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, Palette, Settings, LogOut, Store as StoreIcon, ExternalLink, Sparkles, CreditCard, Tag } from "lucide-react";
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deduplicated via React cache() — shared with page components
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with page components
  const store = await getOwnerStore(user.id);

  // If no store and not on onboarding page, redirect to onboarding
  // This will be handled by individual pages

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 flex">
      {/* Sidebar with Mobile Toggle */}
      <MobileSidebarToggle>
        {/* Logo & Store Info */}
        <div className="p-6 border-b border-gray-100/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 flex items-center justify-center">
              <Image src="/logo.jpeg" alt="Bytescart" width={48} height={48} className="object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Bytescart
              </h1>
              <p className="text-xs text-gray-400">Store Dashboard</p>
            </div>
          </div>
          {store && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mt-4">
              <p className="text-sm font-semibold text-gray-900 truncate">{store.storeName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <span 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: store.theme?.primaryHex || '#3b82f6' }}
                />
                {store.theme?.name || 'Default'} theme
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto min-h-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Menu</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-blue-100 group-hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors">
              <LayoutDashboard className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-green-100 group-hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors">
              <Package className="h-5 w-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Products</span>
          </Link>
          <Link
            href="/dashboard/categories"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-amber-100 group-hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors">
              <Tag className="h-5 w-5 text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Categories</span>
          </Link>
          <Link
            href="/dashboard/themes"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-purple-100 group-hover:bg-purple-500 rounded-lg flex items-center justify-center transition-colors">
              <Palette className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Themes</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-emerald-100 group-hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
              <CreditCard className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Payments</span>
            {store && !store.stripeConnectId && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                Setup
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 rounded-xl transition-all group"
          >
            <div className="h-9 w-9 bg-gray-100 group-hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors">
              <Settings className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2 shrink-0">
          {store && (
            <Link
              href={`/stores/${store.subdomainSlug}`}
              target="_blank"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center gap-2">
                <StoreIcon className="h-4 w-4" />
                View Live Store
              </div>
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </MobileSidebarToggle>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
