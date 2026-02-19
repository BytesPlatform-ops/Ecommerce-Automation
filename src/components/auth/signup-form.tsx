"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  X,
} from "lucide-react";

function getPasswordStrength(password: string) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  score = Object.values(checks).filter(Boolean).length;
  const label =
    score <= 1
      ? "Weak"
      : score <= 2
      ? "Fair"
      : score <= 3
      ? "Good"
      : score <= 4
      ? "Strong"
      : "Excellent";
  const color =
    score <= 1
      ? "bg-red-400"
      : score <= 2
      ? "bg-orange-400"
      : score <= 3
      ? "bg-amber-400"
      : score <= 4
      ? "bg-emerald-400"
      : "bg-emerald-500";
  return { score, label, color, checks };
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const requirementItems = [
    { key: "length", label: "8+ chars", met: strength.checks.length },
    { key: "uppercase", label: "Upper", met: strength.checks.uppercase },
    { key: "lowercase", label: "Lower", met: strength.checks.lowercase },
    { key: "number", label: "Number", met: strength.checks.number },
  ];

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
      <div className="space-y-2">
        <label
          htmlFor="email"
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
              focusedField === "email"
                ? "text-neutral-900"
                : "text-muted-foreground"
            }`}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-12 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Password
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
              focusedField === "password"
                ? "text-neutral-900"
                : "text-muted-foreground"
            }`}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="Create a secure password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password strength meter */}
        <AnimatePresence>
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1.5 space-y-1.5">
                {/* Strength bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.score / 5) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`h-full rounded-full ${strength.color}`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground min-w-[50px] text-right">
                    {strength.label}
                  </span>
                </div>

                {/* Requirements checklist */}
                <div className="grid grid-cols-4 gap-1">
                  {requirementItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-1">
                      {item.met ? (
                        <Check className="h-2.5 w-2.5 text-emerald-500" />
                      ) : (
                        <X className="h-2.5 w-2.5 text-neutral-300" />
                      )}
                      <span className={`text-[11px] transition-colors duration-200 ${item.met ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Confirm
        </label>
        <div
          className={`relative flex items-center rounded-xl border bg-white transition-all duration-300 ${
            focusedField === "confirmPassword"
              ? "border-neutral-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
              : confirmPassword.length > 0 && password !== confirmPassword
              ? "border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.06)]"
              : confirmPassword.length > 0 && password === confirmPassword
              ? "border-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.06)]"
              : "border-border hover:border-neutral-400"
          }`}
        >
          <Lock
            className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${
              focusedField === "confirmPassword"
                ? "text-neutral-900"
                : "text-muted-foreground"
            }`}
          />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            required
            suppressHydrationWarning
            className="w-full pl-11 pr-12 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors duration-200"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {/* Match indicator */}
        <AnimatePresence>
          {confirmPassword.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-[10px] flex items-center gap-0.5 ${
                password === confirmPassword
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {password === confirmPassword ? (
                <><Check className="h-2.5 w-2.5" /></>
              ) : (
                <><X className="h-2.5 w-2.5" /></>
              )}
            </motion.p>
          )}
        </AnimatePresence>
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
            Creating account...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Create account
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </motion.button>
    </form>
  );
}
