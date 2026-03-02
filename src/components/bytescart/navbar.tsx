"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Track viewport size for responsive rendering
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (isMobile === false) setMobileOpen(false);
  }, [isMobile]);

  // During SSR/initial render, show nothing in the conditional slots to prevent hydration mismatch
  const showMobileNav = isMobile === true;
  const showDesktopNav = isMobile === false;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/asset1.svg"
              alt="Bytescart"
              width={130}
              height={34}
              className="object-contain"
            />
          </Link>

          {/* Desktop nav links - JS conditional for reliability */}
          {showDesktopNav && (
            <div className="flex items-center gap-6 lg:gap-8 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium tracking-wide uppercase text-gray-500 hover:text-gray-900 transition-colors duration-300 relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>
          )}

          {/* Desktop CTA buttons - JS conditional for reliability */}
          {showDesktopNav && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 transition-all duration-200 shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle - JS conditional for reliability */}
          {showMobileNav && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </motion.nav>

      {/* Mobile dropdown menu - rendered outside nav to avoid clipping */}
      <AnimatePresence>
        {showMobileNav && mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-gray-700 py-3 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 flex flex-col gap-3 border-t border-gray-200">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-gray-700 py-2.5 text-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold py-2.5 rounded-full text-center bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
