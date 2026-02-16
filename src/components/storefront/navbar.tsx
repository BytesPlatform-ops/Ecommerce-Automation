"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide navbar on mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      // If scrolling down more than 10px, hide navbar
      if (scrollDifference > 10) {
        setIsNavbarVisible(false);
      }
      // If scrolling up, show navbar
      else if (scrollDifference < -10 || currentScrollY === 0) {
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close search when clicking outside
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const searchContainer = document.getElementById('mobile-search-container');
      const searchButton = document.getElementById('mobile-search-button');
      if (searchContainer && !searchContainer.contains(e.target as Node) && 
          searchButton && !searchButton.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen]);

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-[72px]" />
      
      <div className="relative">
        <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full" style={{ overflowAnchor: "none", transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px] min-h-16 sm:min-h-[72px]">
            {/* Logo */}
            <Link
              href={homePath}
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 flex-shrink-0 group"
              style={{ color: "var(--primary)" }}
            >
              {storeLogoUrl && (
                <span className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={storeLogoUrl}
                    alt={`${storeName} logo`}
                    fill
                    className="object-contain"
                  />
                </span>
              )}
              <span className="font-serif text-lg sm:text-xl tracking-tight font-medium">
                {storeName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href={homePath}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                Shop
              </Link>
              <Link
                href={aboutPath}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                About
              </Link>
              <Link
                href={contactPath}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                Contact
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop Search */}
              <div className={styles.desktopSearch}>
                <NavbarSearch 
                  products={products}
                  productPath={productPath}
                />
              </div>

              {/* Mobile Search Toggle */}
              <button
                id="mobile-search-button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200 flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <CartButton />

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200"
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

        {/* Mobile Search - Fixed dropdown below navbar */}
        {isSearchOpen && (
          <div id="mobile-search-container" className="md:hidden fixed top-16 sm:top-[72px] left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 sm:px-6 py-4 z-40 shadow-lg transition-all" style={{ overflowAnchor: 'none', opacity: isNavbarVisible ? 1 : 0, pointerEvents: isNavbarVisible ? 'auto' : 'none' }}>
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
        <div className="md:hidden fixed inset-0 z-40 bg-background/98 backdrop-blur-sm" style={{ overflowAnchor: 'none' }}>
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <Link
              href={homePath}
              onClick={() => setIsMenuOpen(false)}
              className="text-3xl font-serif tracking-tight hover:opacity-70 transition-all duration-300"
            >
              Shop
            </Link>
            <Link
              href={aboutPath}
              onClick={() => setIsMenuOpen(false)}
              className="text-3xl font-serif tracking-tight hover:opacity-70 transition-all duration-300"
            >
              About
            </Link>
            <Link
              href={contactPath}
              onClick={() => setIsMenuOpen(false)}
              className="text-3xl font-serif tracking-tight hover:opacity-70 transition-all duration-300"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
