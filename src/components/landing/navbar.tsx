"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0D2B1F] shadow-lg shadow-[#0D2B1F]/20 border-b border-[#2E5C40]/50"
            : "bg-[#0D2B1F]/80 backdrop-blur-xl border-b border-[#2E5C40]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image src="/asset2.svg" alt="Bytescart" width={140} height={36} className="object-contain" />
            </motion.div>
          </Link>

          {/* Desktop nav links - centered */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors duration-200 relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4873A] rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right side - buttons and toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Auth buttons - desktop only */}
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors duration-200 px-4 py-2 whitespace-nowrap border border-transparent hover:border-[#F5F0E8]/30 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hidden md:inline-flex text-sm px-5 py-2.5 rounded-lg bg-[#D4873A] text-[#0D2B1F] font-semibold shadow-lg shadow-[#D4873A]/25 hover:bg-[#E8A04F] hover:shadow-xl hover:shadow-[#D4873A]/40 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
            >
              Get Started
            </Link>

            {/* Mobile hamburger toggle - only shows on mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg text-[#F5F0E8] hover:text-[#D4873A] hover:bg-[#2E5C40]/30 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile dropdown - rendered outside nav to avoid clipping */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#0D2B1F] border-b border-[#2E5C40]/50 shadow-xl shadow-black/30"
          >
            <div className="px-6 py-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[#F5F0E8]/80 hover:text-[#D4873A] transition-colors py-3 border-b border-[#2E5C40]/20 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-[#2E5C40]/40">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[#F5F0E8]/80 hover:text-[#D4873A] transition-colors py-2.5 text-center border border-[#2E5C40]/60 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm px-5 py-2.5 rounded-lg bg-[#D4873A] text-[#0D2B1F] font-semibold text-center shadow-lg shadow-[#D4873A]/25 hover:bg-[#E8A04F] transition-colors"
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
