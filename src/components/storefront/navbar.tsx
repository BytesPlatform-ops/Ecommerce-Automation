"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { CartButton } from "./cart-button";
import { NavbarSearch } from "./navbar-search";
import styles from "./navbar.module.css";

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface StorefrontNavbarProps {
  storeName: string;
  storeLogoUrl?: string | null;
  slug: string;
  storeId: string;
  aboutPath: string;
  contactPath: string;
  homePath: string;
  products: Product[];
  productPath: string;
}

export function StorefrontNavbar({ storeName, storeLogoUrl, slug, storeId, aboutPath, contactPath, homePath, products, productPath }: StorefrontNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50" style={{ borderBottomColor: "var(--primary)", overflowAnchor: "none" }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px] min-h-16 sm:min-h-[72px]">
            {/* Logo */}
            <Link
              href={homePath}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity duration-300 flex-shrink-0"
              style={{ color: "var(--primary)" }}
            >
              {storeLogoUrl && (
                <span className="relative h-8 w-8 sm:h-9 sm:w-9">
                  <Image
                    src={storeLogoUrl}
                    alt={`${storeName} logo`}
                    fill
                    className="object-contain"
                  />
                </span>
              )}
              <span className="font-serif text-lg sm:text-xl tracking-tight">
                {storeName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href={homePath}
                className="text-overline link-underline text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Shop
              </Link>
              <Link
                href={aboutPath}
                className="text-overline link-underline text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                About
              </Link>
              <Link
                href={contactPath}
                className="text-overline link-underline text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Contact
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Desktop Search */}
              <div className={styles.desktopSearch}>
                <NavbarSearch 
                  products={products}
                  productPath={productPath}
                />
              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-sm transition-colors duration-200 flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px] text-foreground relative -top-[1px]" strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <CartButton />

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-sm transition-colors duration-200"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

        {/* Mobile Search - Positioned absolutely so it appears as part of navbar */}
        {isSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border px-4 sm:px-6 py-4 z-40" style={{ overflowAnchor: 'none' }}>
            <NavbarSearch 
              products={products}
              productPath={productPath}
              fullWidth={true}
            />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background" style={{ overflowAnchor: 'none' }}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <Link
              href={homePath}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-serif tracking-tight hover:opacity-70 transition-opacity"
            >
              Shop
            </Link>
            <Link
              href={aboutPath}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-serif tracking-tight hover:opacity-70 transition-opacity"
            >
              About
            </Link>
            <Link
              href={contactPath}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-serif tracking-tight hover:opacity-70 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
