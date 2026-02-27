"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const plans = {
  monthly: [
    {
      name: "Starter",
      price: 0,
      period: "forever",
      description: "Perfect to test the waters",
      features: ["1 store", "50 products", "Basic analytics", "Community support", "Bytescart branding"],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 29,
      period: "/mo",
      description: "For serious entrepreneurs",
      features: [
        "3 stores",
        "Unlimited products",
        "Advanced analytics",
        "Priority support",
        "Custom domain",
        "Remove branding",
        "AI product descriptions",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: 99,
      period: "/mo",
      description: "For scaling businesses",
      features: [
        "Unlimited stores",
        "Unlimited everything",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "API access",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: 0,
      period: "forever",
      description: "Perfect to test the waters",
      features: ["1 store", "50 products", "Basic analytics", "Community support", "Bytescart branding"],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 19,
      period: "/mo",
      description: "For serious entrepreneurs",
      features: [
        "3 stores",
        "Unlimited products",
        "Advanced analytics",
        "Priority support",
        "Custom domain",
        "Remove branding",
        "AI product descriptions",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: 79,
      period: "/mo",
      description: "For scaling businesses",
      features: [
        "Unlimited stores",
        "Unlimited everything",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "API access",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ],
};

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const currentPlans = plans[billing];

  return (
    <section className="relative py-20 sm:py-32 px-5" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="text-[#00FF88] text-xs font-semibold tracking-wider uppercase mb-4 block">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent <span className="text-[#00FF88]">pricing</span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Start free. Scale as you grow.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-current" : "text-current/40"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-white/[0.08] border border-white/[0.1] transition-colors"
          >
            <motion.div
              animate={{ x: billing === "yearly" ? 28 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#00FF88]"
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-current" : "text-current/40"}`}>
            Yearly
            <span className="ml-1.5 text-[#00FF88] text-xs">Save 34%</span>
          </span>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
          <AnimatePresence mode="wait">
            {currentPlans.map((plan, i) => (
              <motion.div
                key={`${plan.name}-${billing}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-2 border-[#00FF88]/40 bg-[#00FF88]/[0.04] scale-[1.03] md:scale-105 shadow-2xl shadow-[#00FF88]/[0.08]"
                    : "border border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {/* Animated gradient border for Pro */}
                {plan.highlighted && (
                  <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                    <div
                      className="absolute inset-0 animate-spin-slow"
                      style={{
                        background: "conic-gradient(from 0deg, #00FF88, transparent, #00FF88, transparent, #00FF88)",
                        opacity: 0.15,
                        animationDuration: "6s",
                      }}
                    />
                  </div>
                )}

                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF88] text-[#0B0F14] text-xs font-bold tracking-wide">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-current opacity-40 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-current opacity-40 text-sm ml-1">{plan.period}</span>
                  )}
                  {plan.price === 0 && (
                    <span className="text-current opacity-40 text-sm ml-2">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-current opacity-60">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.highlighted ? "#00FF88" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-[#00FF88] text-[#0B0F14] hover:shadow-lg hover:shadow-[#00FF88]/25 hover:scale-105"
                      : "border border-white/[0.1] text-current opacity-70 hover:opacity-100 hover:border-white/[0.2]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
