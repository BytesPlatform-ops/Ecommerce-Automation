"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
        className="fixed top-0 left-0 right-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/asset 1.svg"
              alt="Bytescart"
              width={150}
              height={38}
              className="object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="items-center gap-7" style={{ display: "flex" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "#6b7280" }}
                className="text-[13px] font-medium tracking-wide uppercase hover:text-gray-900 transition-colors duration-300 relative group"
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-[1.5px] rounded-full group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: "#10B981" }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="items-center gap-3" style={{ display: "flex" }}>
            <Link
              href="/login"
              style={{ color: "#374151" }}
              className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              style={{ backgroundColor: "#10B981", color: "#ffffff" }}
              className="text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "#374151", display: "none" }}
            className="p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb" }}
            className="md:hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "#374151" }}
                  className="text-sm font-medium py-2.5 hover:text-gray-900 transition-colors border-b border-gray-100"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  style={{ color: "#374151" }}
                  className="text-sm font-medium py-2.5 text-center border border-gray-200 rounded-full"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{ backgroundColor: "#10B981", color: "#ffffff" }}
                  className="text-sm font-semibold py-2.5 rounded-full text-center shadow-md"
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
