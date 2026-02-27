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
          ? "md:bg-white/50 md:backdrop-blur-lg bg-white border-b border-gray-200/50 shadow-sm shadow-gray-200/30 md:border-b-0 md:shadow-none"
          : "md:bg-white/50 md:backdrop-blur-lg bg-white"
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
            <Image src="/logo.jpeg" alt="Bytescart" width={44} height={44} className="object-contain" />
          </motion.div>
          <span className="text-gray-900 font-semibold text-lg tracking-tight">
            Bytescart
          </span>
        </Link>

        {/* Desktop nav links - centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 relative group whitespace-nowrap"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full group-hover:w-full transition-all duration-300" />
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
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 px-4 py-2 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900 flex-shrink-0"
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
          className="md:hidden bg-white/90 backdrop-blur-2xl border-b border-gray-200/50"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-center shadow-lg shadow-violet-500/25"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
