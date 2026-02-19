"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthBackground } from "@/components/auth/auth-background";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Full-screen animated background */}
      <AuthBackground />

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-serif text-lg font-semibold leading-none">B</span>
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
              Set new password
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Choose a strong password for your account
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <ResetPasswordForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

