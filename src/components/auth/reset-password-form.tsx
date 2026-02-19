"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Get token from URL params only after hydration to prevent mismatch
  useEffect(() => {
    const tokenParam = new URLSearchParams(window.location.search).get("token");
    if (!tokenParam) {
      setTokenError(true);
      setError("Invalid or missing reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
    setIsHydrated(true);
  }, []);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!isStrong) {
      setError("Password does not meet the requirements.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      setLoading(false);
      return;
    }

    try {
      // Call API endpoint to reset password with token
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until after hydration
  if (!isHydrated) {
    return null;
  }

  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Invalid Reset Link</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            This password reset link is invalid or has expired.
            <br />
            Please request a new one to continue.
          </p>
        </div>
        <a
          href="/forgot-password"
          className="inline-block mt-4 px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors duration-300"
        >
          Request New Reset Link
        </a>
      </motion.div>
    );
  }

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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Password updated</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Your password has been successfully reset. Redirecting you to the login page...
          </p>
        </div>
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

      {/* New Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          New password
        </label>
        <div
          className={`relative flex items-center rounded-xl border bg-white transition-all duration-300 ${
            focusedField === "password"
              ? "border-neutral-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
              : "border-border hover:border-neutral-400"
          }`}
        >
          <Lock
            className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${
              focusedField === "password" ? "text-neutral-900" : "text-muted-foreground"
            }`}
          />
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Password strength indicators */}
      {password.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="space-y-2 overflow-hidden"
        >
          <div className="flex gap-1.5">
            {[hasMinLength, hasLowercase, hasUppercase, hasNumber].map((met, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  met ? "bg-emerald-500" : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              { label: "8+ characters", met: hasMinLength },
              { label: "Lowercase letter", met: hasLowercase },
              { label: "Uppercase letter", met: hasUppercase },
              { label: "Number", met: hasNumber },
            ].map((req) => (
              <p
                key={req.label}
                className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${
                  req.met ? "text-emerald-600" : "text-neutral-400"
                }`}
              >
                {req.met ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-neutral-300 inline-block" />
                )}
                {req.label}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Confirm Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirm-password"
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Confirm password
        </label>
        <div
          className={`relative flex items-center rounded-xl border bg-white transition-all duration-300 ${
            focusedField === "confirmPassword"
              ? "border-neutral-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
              : confirmPassword.length > 0 && password !== confirmPassword
              ? "border-red-300"
              : "border-border hover:border-neutral-400"
          }`}
        >
          <Lock
            className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${
              focusedField === "confirmPassword" ? "text-neutral-900" : "text-muted-foreground"
            }`}
          />
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors duration-200"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-500 mt-1"
          >
            Passwords do not match
          </motion.p>
        )}
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
            Updating password...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Update password
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </motion.button>
    </form>
  );
}

