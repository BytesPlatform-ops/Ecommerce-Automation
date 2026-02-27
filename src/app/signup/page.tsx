"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthBackground } from "@/components/auth/auth-background";

export default function SignupPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Full-screen animated background */}
      <AuthBackground />

      {/* Floating feature badges — left side */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="hidden xl:flex flex-col gap-4 absolute left-12 top-1/2 -translate-y-1/2"
      >
        {[
          { emoji: "🚀", text: "Launch instantly" },
          { emoji: "🎨", text: "Fully customizable" },
          { emoji: "💳", text: "Built-in payments" },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm text-white/70 font-medium">{item.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating testimonial — right side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="hidden xl:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2 max-w-[240px]"
      >
        <div className="px-6 py-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-sm">★</span>
            ))}
          </div>
          <p className="text-sm text-white/60 leading-relaxed italic">
            &ldquo;Set up my store in under a minute. The best platform I&apos;ve ever used.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">JD</span>
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Jane D.</p>
              <p className="text-[10px] text-white/40">Store Owner</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          <p className="text-2xl font-semibold text-white/90">99.9%</p>
          <p className="text-xs text-white/40">Uptime guaranteed</p>
        </div>
      </motion.div>

      {/* Center: Glass card with form */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 border border-white/20 px-5 sm:px-7 py-5 sm:py-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-4 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 group"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Image src="/logo.jpeg" alt="Bytescart" width={40} height={40} className="object-contain" />
              </div>
              <span className="font-serif text-base tracking-tight text-neutral-900">
                Bytescart
              </span>
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-4 text-center"
          >
            <h1 className="font-serif text-xl sm:text-xl text-neutral-900 mb-0.5">
              Create account
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-tight">
              Build your store
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <SignupForm />
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 flex items-center gap-2"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          </motion.div>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-3 text-center text-[11px] sm:text-xs text-neutral-500"
          >
            Have an account?{" "}
            <Link
              href="/login"
              className="relative text-neutral-900 font-medium hover:text-amber-700 transition-colors duration-300"
            >
              Sign in
            </Link>
          </motion.p>
        </div>

        {/* Trust line below card — hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="hidden sm:flex mt-4 text-center justify-center gap-1.5"
        >
          <div className="flex -space-x-1">
            {["from-rose-400 to-rose-600", "from-blue-400 to-blue-600", "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600"].map((g, i) => (
              <div key={i} className={`w-5 h-5 rounded-full bg-gradient-to-br ${g} border-2 border-neutral-900 flex items-center justify-center`}>
                <span className="text-white text-[7px] font-bold">{["J", "A", "S", "L"][i]}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40">Trusted by <span className="text-white/70 font-medium">2K+</span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
