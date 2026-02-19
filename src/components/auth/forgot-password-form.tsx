"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-reset-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Email sent!</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            If an account exists with <span className="font-medium text-neutral-700">{email}</span>, you&apos;ll receive a password reset link shortly.
            <br />
            Be sure to check your spam folder if you don&apos;t see it.
          </p>
        </div>
        <p className="text-xs text-neutral-400 pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="text-neutral-900 font-medium hover:text-amber-700 transition-colors duration-300 underline underline-offset-2"
          >
            Try another email
          </button>
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email field */}
      <div className="space-y-1.5">
        <label
          htmlFor="reset-email"
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Email address
        </label>
        <div
          className={`relative flex items-center rounded-xl border bg-white transition-all duration-300 ${
            focusedField === "email"
              ? "border-neutral-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
              : "border-border hover:border-neutral-400"
          }`}
        >
          <Mail
            className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${
              focusedField === "email" ? "text-neutral-900" : "text-muted-foreground"
            }`}
          />
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        suppressHydrationWarning
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="auth-btn-primary group"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending reset link...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send reset link
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </motion.button>
    </form>
  );
}

