import Link from "next/link";
import { Store, ShoppingBag, Menu } from "lucide-react";

interface StorefrontNavbarProps {
  storeName: string;
  slug: string;
}

export function StorefrontNavbar({ storeName, slug }: StorefrontNavbarProps) {
  return (
    <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href={`/stores/${slug}`}
            className="flex items-center gap-3 font-bold text-xl md:text-2xl group"
          >
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {storeName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href={`/stores/${slug}`}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
              style={{ ["--tw-after-bg" as string]: "var(--primary)" }}
            >
              Home
            </Link>
            <Link
              href={`/stores/${slug}/about`}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <button 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white text-sm transition-all hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <ShoppingBag className="h-4 w-4" />
              Cart
            </button>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
}
