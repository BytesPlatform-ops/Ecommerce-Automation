"use client";

import Link from "next/link";
import { Store, Menu, Search, Heart, User, Info } from "lucide-react";
import { useState } from "react";
import { CartButton } from "./cart-button";
import { NavbarSearch } from "./navbar-search";

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface StorefrontNavbarProps {
  storeName: string;
  slug: string;
  storeId: string;
  aboutPath: string;
  homePath: string;
  products: Product[];
  productPath: string;
}

export function StorefrontNavbar({ storeName, slug, storeId, aboutPath, homePath, products, productPath }: StorefrontNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          {/* Logo */}
          <Link
            href={homePath}
            className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-xl md:text-2xl group flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div 
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg shadow-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:inline">
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 ml-8">
            <Link
              href={homePath}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
              style={{ ["--tw-after-bg" as string]: "var(--primary)" }}
            >
              Home
            </Link>
            <Link
              href={aboutPath}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
              style={{ ["--tw-after-bg" as string]: "var(--primary)" }}
            >
              About
            </Link>
          </div>

          {/* Spacer to push actions to the right */}
          <div className="flex-1" />

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Search - Desktop only */}
            <div className="hidden md:block">
              <NavbarSearch 
                products={products}
                productPath={productPath}
              />
            </div>

            {/* Wishlist */}
            <button 
              onClick={() => alert("Wishlist feature coming soon!")}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-red-500 transition-colors" />
            </button>

            {/* Cart Button */}
            <CartButton />

            {/* Account Button */}
            <button 
              onClick={() => alert("Account feature coming soon!")}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Account"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>

            {/* About Button */}
            <Link
              href={aboutPath}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="About"
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Link>

            {/* Mobile Menu */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3 sm:pb-4">
          <div className="flex items-center bg-gray-100 rounded-full px-3 sm:px-4 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 text-xs sm:text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
