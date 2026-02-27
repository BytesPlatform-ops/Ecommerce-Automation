"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { Check, X, Sparkles, Zap, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";

const freeFeatures = [
  "Up to 15 products",
  "Custom storefront",
  "Admin dashboard",
  "PostgreSQL database",
  "Edge hosting (200+ locations)",
  "Stripe Connect payments",
  "Email notifications",
  "SSL certificate",
];

const proFeatures = [
  "Up to 100 products",
  "Custom domain + SSL",
  "Stripe payments integration",
  "Admin dashboard",
  "PostgreSQL database",
  "Edge hosting (200+ locations)",
  "Email notifications",
  "Analytics dashboard",
  "Priority support",
  "Automatic backups",
];

const agencyComparison = [
  { feature: "Development time", agency: "3-6 months", bytescart: "60 seconds" },
  { feature: "Upfront cost", agency: "$3,000+", bytescart: "$0" },
  { feature: "Monthly maintenance", agency: "$500-2,000/mo", bytescart: "Included" },
  { feature: "Tech expertise needed", agency: "Yes", bytescart: "None" },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <SectionWrapper id="pricing" className="py-16 sm:py-24 bg-[#F5F0E8]">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-[#D4873A] uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Simple Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A3D2B] tracking-tight mb-5"
        >
          Start free.{" "}
          <span className="bg-gradient-to-r from-[#D4873A] to-[#C9A84C] bg-clip-text text-transparent">
            Scale when ready.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#8FA898] max-w-2xl mx-auto text-lg"
        >
          Launch your store for free with 15 products. Upgrade to Pro when you need more.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-3 mt-8"
        >
          <div className="inline-flex items-center gap-1 p-1 bg-white/60 border border-[#2E5C40]/20 rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-[#1A3D2B] shadow-sm"
                  : "text-[#8FA898] hover:text-[#1A3D2B]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white text-[#1A3D2B] shadow-sm"
                  : "text-[#8FA898] hover:text-[#1A3D2B]"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-[#D4873A] font-semibold">Save 17%</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-3xl border border-[#2E5C40]/30 bg-white p-8"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1A3D2B] mb-1">Free</h3>
              <p className="text-sm text-[#8FA898]">Perfect for getting started</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-[#1A3D2B]"><span className="text-[#D4873A]">$</span>0</span>
              <span className="text-[#8FA898]">/forever</span>
            </div>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#2E5C40] text-[#1A3D2B] font-semibold hover:bg-[#2E5C40]/5 transition-all mb-8"
            >
              Get Started Free
            </Link>

            <div className="space-y-3">
              {freeFeatures.map((feature, i) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#D4873A]" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-[#8FA898]">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative lg:col-span-1"
          >
            {/* Amber border */}
            <div className="absolute -inset-px rounded-3xl border-2 border-[#D4873A]" />
            
            <div className="relative rounded-3xl bg-white p-8 shadow-2xl shadow-[#D4873A]/20">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4873A] text-[#0D2B1F] text-xs font-semibold shadow-lg shadow-[#D4873A]/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </motion.div>
              </div>

              <div className="mb-6 pt-4">
                <h3 className="text-lg font-bold text-[#1A3D2B] mb-1 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#D4873A]" />
                  Pro Plan
                </h3>
                <p className="text-sm text-[#8FA898]">Everything you need to succeed</p>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-[#1A3D2B]">
                  <span className="text-[#D4873A]">$</span>{billingPeriod === "monthly" ? "49.99" : "500"}
                </span>
                <span className="text-[#8FA898]">
                  /{billingPeriod === "monthly" ? "mo" : "yr"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-[#D4873A] font-medium mb-4">
                  That&apos;s $41.67/mo — save $99.88/year
                </p>
              )}
              {billingPeriod === "monthly" && (
                <p className="text-sm text-[#D4873A] font-medium mb-4">
                  Save 17% with yearly billing
                </p>
              )}

              <Link
                href="/signup"
                className="group w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#D4873A] text-white font-bold shadow-xl shadow-[#D4873A]/30 hover:bg-[#E8A04F] hover:shadow-[#D4873A]/50 hover:-translate-y-1 transition-all duration-500 mb-8"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-center text-xs text-[#8FA898] -mt-6 mb-6">
                Start free · Upgrade from your dashboard
              </p>

              <div className="space-y-3">
                {proFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#D4873A]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#D4873A]" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-[#1A3D2B]">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-3xl border border-[#2E5C40]/30 bg-white/60 backdrop-blur-xl p-8"
          >
            <h4 className="text-lg font-bold text-[#1A3D2B] mb-2">
              Traditional agency vs Bytescart
            </h4>
            <p className="text-sm text-[#8FA898] mb-8">
              See why 12,000+ founders chose us over agencies
            </p>

            <div className="space-y-4">
              {agencyComparison.map((item, i) => (
                <motion.div
                  key={item.feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F5F0E8] border border-[#2E5C40]/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A3D2B] mb-2">{item.feature}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-[#8FA898] line-through">{item.agency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#D4873A]" />
                        <span className="text-sm font-semibold text-[#D4873A]">{item.bytescart}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom callout */}
            <div className="mt-8 p-4 rounded-2xl bg-[#0D2B1F] border border-[#2E5C40]">
              <p className="text-center text-sm text-[#F5F0E8]">
                <span className="font-semibold text-[#D4873A]">30,000+ hours</span> of development time saved for our customers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
