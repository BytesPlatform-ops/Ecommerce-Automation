"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Leaf } from "lucide-react";

const plans = {
  monthly: [
    {
      name: "Starter",
      price: 0,
      period: "forever",
      description: "Perfect to test the waters",
      features: ["1 store", "2 products", "Basic analytics", "Community support", "Bytescart branding"],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 30,
      period: "/mo",
      description: "For serious entrepreneurs",
      features: [
        "1 store",
        "100 products",
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
      price: -1,
      period: "",
      description: "For scaling businesses",
      features: [
        "Unlimited stores",
        "Unlimited everything",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Priority onboarding",
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
      features: ["1 store", "2 products", "Basic analytics", "Community support", "Bytescart branding"],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 25,
      period: "/mo",
      description: "For serious entrepreneurs",
      features: [
        "1 store",
        "100 products",
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
      price: -1,
      period: "",
      description: "For scaling businesses",
      features: [
        "Unlimited stores",
        "Unlimited everything",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Priority onboarding",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ],
};

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const currentPlans = plans[billing];

  const cardStyles = [
    {
      wrapperClass:
        "border border-current/20 bg-gradient-to-b from-current/[0.03] to-transparent hover:border-current/35 hover:shadow-2xl hover:shadow-current/[0.04]",
      iconWrapperClass: "bg-current/[0.06] border border-current/10",
      icon: <Leaf className="w-5 h-5 opacity-40" />,
      dividerClass: "bg-current/[0.08]",
      priceColor: "text-current",
      checkBg: "bg-current/[0.07]",
      checkColor: "currentColor",
      ctaClass:
        "border border-current/20 text-current/70 hover:border-current/40 hover:bg-current/[0.05]",
      ctaHref: "/signup",
    },
    {
      wrapperClass:
        "border-2 border-[#10B981]/45 bg-[#10B981]/[0.04] shadow-2xl shadow-[#10B981]/10",
      iconWrapperClass: "bg-[#10B981]/15 border border-[#10B981]/25",
      icon: <Zap className="w-5 h-5 text-[#10B981]" />,
      dividerClass: "bg-[#10B981]/15",
      priceColor: "text-[#10B981]",
      checkBg: "bg-[#10B981]/15",
      checkColor: "#10B981",
      ctaClass:
        "bg-[#10B981] text-[#0B0F14] font-bold hover:shadow-lg hover:shadow-[#10B981]/30 hover:scale-105",
      ctaHref: "/signup",
    },
    {
      wrapperClass:
        "border border-[#D4873A]/35 bg-gradient-to-b from-[#D4873A]/[0.06] to-transparent hover:border-[#D4873A]/55 hover:shadow-2xl hover:shadow-[#D4873A]/10",
      iconWrapperClass: "bg-[#D4873A]/10 border border-[#D4873A]/20",
      icon: <Crown className="w-5 h-5 text-[#D4873A]/80" />,
      dividerClass: "bg-[#D4873A]/15",
      priceColor: "text-[#D4873A]",
      checkBg: "bg-[#D4873A]/12",
      checkColor: "#D4873A",
      ctaClass:
        "border border-[#D4873A]/35 text-[#D4873A]/80 hover:border-[#D4873A]/60 hover:text-[#D4873A] hover:bg-[#D4873A]/[0.08]",
      ctaHref: "mailto:bytesuite@bytesplatform.com",
    },
  ];

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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/[0.07] text-[#10B981] text-xs font-semibold tracking-wider uppercase mb-6">
            <Zap className="w-3 h-3" />
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent <span className="text-[#10B981]">pricing</span>
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
          className="flex items-center justify-center gap-4 mb-14"
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
              className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#10B981]"
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-current" : "text-current/40"}`}>
            Yearly
            <span className="ml-1.5 text-[#10B981] text-xs font-semibold">Save 34%</span>
          </span>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-stretch">
          <AnimatePresence mode="wait">
            {currentPlans.map((plan, i) => {
              const style = cardStyles[i];
              return (
                <motion.div
                  key={`${plan.name}-${billing}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`relative rounded-2xl p-7 sm:p-8 transition-all duration-300 flex flex-col ${style.wrapperClass}`}
                >
                  {/* Animated gradient sweep for Pro */}
                  {plan.highlighted && (
                    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                      <div
                        className="absolute inset-0 animate-spin-slow"
                        style={{
                          background: "conic-gradient(from 0deg, #10B981, transparent, #10B981, transparent, #10B981)",
                          opacity: 0.12,
                          animationDuration: "6s",
                        }}
                      />
                    </div>
                  )}

                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#10B981] text-[#0B0F14] text-xs font-bold tracking-wide whitespace-nowrap shadow-lg shadow-[#10B981]/20">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Plan icon + name */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
                      <p className="text-current/40 text-sm mt-0.5">{plan.description}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${style.iconWrapperClass}`}>
                      {style.icon}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`h-px w-full mb-5 ${style.dividerClass}`} />

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-bold tracking-tight ${style.priceColor}`}>
                        {plan.price === 0 ? "Free" : plan.price === -1 ? "Custom" : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-current/40 text-sm mb-1.5">{plan.period}</span>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-current/10 border border-current/20 text-current/70 text-xs font-semibold tracking-wide">
                        {plan.period}
                      </span>
                    )}
                    {plan.price === -1 && (
                      <span className="text-current/30 text-xs mt-0.5 block">Talk to us for a quote</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-current/60">
                        <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 ${style.checkBg}`}>
                          <Check
                            style={{ color: style.checkColor }}
                            className="w-2.5 h-2.5"
                            strokeWidth={3}
                          />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={style.ctaHref}
                    className={`mt-auto block text-center py-3 rounded-full text-sm font-semibold transition-all duration-300 ${style.ctaClass}`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
