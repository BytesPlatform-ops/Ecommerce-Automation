"use client";

import { motion } from "framer-motion";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-11 h-11 flex items-center justify-center"
          >
            <Image src="/logo.jpeg" alt="Bytescart" width={44} height={44} className="object-contain rounded-lg" />
          </motion.div>
          <span className="text-[#F5F0E8] font-semibold text-lg tracking-tight">
            Bytescart
          </span>
        </Link>

        {/* Desktop nav links - centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
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
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Auth buttons - desktop only */}
          {!isMobile && (
            <>
              <Link
                href="/login"
                className="text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors duration-200 px-4 py-2 whitespace-nowrap border border-transparent hover:border-[#F5F0E8]/30 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-5 py-2.5 rounded-lg bg-[#D4873A] text-[#0D2B1F] font-semibold shadow-lg shadow-[#D4873A]/25 hover:bg-[#E8A04F] hover:shadow-xl hover:shadow-[#D4873A]/40 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#F5F0E8] hover:text-[#D4873A] flex-shrink-0 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#0D2B1F]/95 backdrop-blur-2xl border-b border-[#2E5C40]/50"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[#F5F0E8]/80 hover:text-[#D4873A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm text-[#F5F0E8]/80 hover:text-[#D4873A] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2.5 rounded-lg bg-[#D4873A] text-[#0D2B1F] font-semibold text-center shadow-lg shadow-[#D4873A]/25 hover:bg-[#E8A04F] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
