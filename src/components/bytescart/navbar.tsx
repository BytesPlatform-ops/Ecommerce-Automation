"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const heroHeight = window.innerHeight * 0.6;
      setInverted(window.scrollY > heroHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgClass = inverted
    ? scrolled
      ? "bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm"
      : "bg-white/70 backdrop-blur-xl border-b border-gray-200/40"
    : scrolled
      ? "bg-[#0B0F14]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
      : "bg-transparent border-b border-transparent";

  const textClass = inverted ? "text-[#111827]" : "text-white";
  const textMutedClass = inverted ? "text-[#111827]/60" : "text-white/60";
  const textHoverClass = inverted ? "hover:text-[#111827]" : "hover:text-white";
  const logoClass = inverted ? "text-[#111827]" : "text-white";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#00FF88] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors duration-500 ${logoClass}`}>
              Bytescart
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 relative group ${textMutedClass} ${textHoverClass}`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#00FF88] rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors duration-300 px-4 py-2 ${textMutedClass} ${textHoverClass}`}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2 rounded-full bg-[#00FF88] text-[#0B0F14] font-semibold hover:shadow-lg hover:shadow-[#00FF88]/25 hover:scale-105 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden transition-colors duration-300 ${textClass}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${inverted ? "bg-white border-gray-200" : "bg-[#0B0F14] border-white/10"}`}
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 ${textMutedClass} ${textHoverClass} transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link href="/login" className={`text-sm font-medium py-2 ${textMutedClass}`}>
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm px-5 py-2.5 rounded-full bg-[#00FF88] text-[#0B0F14] font-semibold text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}
