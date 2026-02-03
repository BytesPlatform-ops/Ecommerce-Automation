import Link from "next/link";
import { Store, ShoppingBag, Menu, Search, Heart } from "lucide-react";

interface StorefrontNavbarProps {
  storeName: string;
  slug: string;
}

export function StorefrontNavbar({ storeName, slug }: StorefrontNavbarProps) {
  return (
    <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href={`/stores/${slug}`}
            className="flex items-center gap-3 font-bold text-xl md:text-2xl group flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg shadow-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:inline">
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 ml-12">
            <Link
              href={`/stores/${slug}`}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
              style={{ ["--tw-after-bg" as string]: "var(--primary)" }}
            >
              Home
            </Link>
            <Link
              href={`/stores/${slug}/about`}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
              style={{ ["--tw-after-bg" as string]: "var(--primary)" }}
            >
              About
            </Link>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-3">
            {/* Search - Hidden on mobile, visible on md+ */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2.5 hover:bg-gray-200 transition-colors">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent ml-2 text-sm outline-none w-32 placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Wishlist */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:flex items-center justify-center"
              title="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
            </button>

            {/* Cart Button */}
            <button 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95 shadow-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4 sm:hidden">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
