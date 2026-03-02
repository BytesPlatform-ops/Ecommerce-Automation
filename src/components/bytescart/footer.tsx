"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] py-8 px-5 bg-[#0B0F14]">
      <div className="max-w-6xl mx-auto">
        {/* Single row: logo left, links right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <Link href="/" className="inline-block flex-shrink-0">
            <Image src="/asset2.svg" alt="Bytescart" width={130} height={34} className="object-contain brightness-0 invert opacity-70" />
          </Link>

          {/* All links in one row */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
            <Link href="/#features" className="text-white/30 text-sm hover:text-white/60 transition-colors">Features</Link>
            <Link href="/#process" className="text-white/30 text-sm hover:text-white/60 transition-colors">How It Works</Link>
            <Link href="/#pricing" className="text-white/30 text-sm hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/contact" className="text-white/30 text-sm hover:text-white/60 transition-colors">Contact</Link>
            <span className="text-white/10">|</span>
            <Link href="/login" className="text-white/30 text-sm hover:text-white/60 transition-colors">Sign In</Link>
            <Link href="/signup" className="text-white/30 text-sm hover:text-white/60 transition-colors">Get Started</Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© 2026 Bytescart. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["X", "GitHub", "LinkedIn"].map((name) => (
              <a key={name} href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">{name}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

