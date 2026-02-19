"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { Check, X, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const includedFeatures = [
  "AI-powered store generation",
  "Unlimited products",
  "Custom domain + SSL",
  "Stripe payments integration",
  "Admin dashboard",
  "PostgreSQL database",
  "Edge hosting (200+ locations)",
  "SEO optimization",
  "Email notifications",
  "Analytics dashboard",
  "Priority support",
  "Automatic backups",
];

const agencyComparison = [
  { feature: "Development time", agency: "3-6 months", bytescart: "60 seconds" },
  { feature: "Upfront cost", agency: "$15,000+", bytescart: "$0" },
  { feature: "Monthly maintenance", agency: "$500-2,000/mo", bytescart: "Included" },
  { feature: "Design revisions", agency: "Limited", bytescart: "Unlimited" },
  { feature: "Tech expertise needed", agency: "Yes", bytescart: "None" },
];

export function Pricing() {
  return (
    <SectionWrapper id="pricing" className="py-24 sm:py-32">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-violet-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Simple Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5"
        >
          One plan.{" "}
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Everything included.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-lg"
        >
          No hidden fees. No surprise charges. Just one simple price for everything.
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative"
          >
            {/* Gradient border */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500 via-blue-500 to-violet-500" />
            
            <div className="relative rounded-3xl bg-white p-8 lg:p-10 shadow-2xl shadow-violet-200/50">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </motion.div>
              </div>

              {/* Header */}
              <div className="text-center mb-8 pt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-sm text-gray-500 mb-6">Everything you need to succeed</p>
                
                {/* Price */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg text-gray-400 line-through">$15,000</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                    Agency price
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    $49
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-emerald-600 font-medium mt-2">
                  Save $14,951 vs agency builds
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {includedFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/signup"
                className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_100%] text-white font-bold text-lg shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all duration-500 animate-[gradient_4s_ease-in-out_infinite]"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                14-day free trial · No credit card required
              </p>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-3xl border border-gray-200/60 bg-white/60 backdrop-blur-xl p-8 lg:p-10"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Traditional agency vs Bytescart
            </h4>
            <p className="text-sm text-gray-500 mb-8">
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
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-2">{item.feature}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-500 line-through">{item.agency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-600">{item.bytescart}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom callout */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100">
              <p className="text-center text-sm text-gray-700">
                <span className="font-semibold text-violet-700">30,000+ hours</span> of development time saved for our customers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
