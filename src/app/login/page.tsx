"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";
import { AuthBackground } from "@/components/auth/auth-background";

export default function LoginPage() {
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
          { emoji: "⚡", text: "60-second setup" },
          { emoji: "🔒", text: "Enterprise security" },
          { emoji: "📊", text: "Real-time analytics" },
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

      {/* Floating stats — right side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="hidden xl:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2"
      >
        {[
          { value: "2,000+", label: "Merchants" },
          { value: "99.9%", label: "Uptime" },
          { value: "50M+", label: "Orders processed" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 + i * 0.15, duration: 0.5 }}
            className="text-center px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md"
          >
            <p className="text-xl font-semibold text-white/90">{stat.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Center: Glass card with form */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 border border-white/20 px-8 sm:px-10 py-10 sm:py-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Image src="/logo.png" alt="Bytescart" width={48} height={48} className="object-contain" />
              </div>
              <span className="font-serif text-xl tracking-tight text-neutral-900">
                Bytescart
              </span>
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="font-serif text-3xl text-neutral-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Sign in to manage your store
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <LoginForm />
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            <span className="text-xs text-neutral-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          </motion.div>

          {/* Sign up link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-5 text-center text-sm text-neutral-500"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="relative text-neutral-900 font-medium hover:text-amber-700 transition-colors duration-300"
            >
              Create one
            </Link>
          </motion.p>
        </div>

        {/* Trust line below card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-1.5">
              {["from-rose-400 to-rose-600", "from-blue-400 to-blue-600", "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600"].map((g, i) => (
                <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-neutral-900 flex items-center justify-center`}>
                  <span className="text-white text-[8px] font-bold">{["J", "A", "S", "L"][i]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40">Trusted by <span className="text-white/70 font-medium">2,000+</span> merchants</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
