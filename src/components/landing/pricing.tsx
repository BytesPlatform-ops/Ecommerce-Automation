"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for testing the water with your first online store.",
    features: [
      "1 store",
      "Up to 50 products",
      "Basic analytics",
      "Chameleon subdomain",
      "Email support",
      "SSL included",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "For growing brands that need more power and customization.",
    features: [
      "5 stores",
      "Unlimited products",
      "Advanced analytics",
      "Custom domain",
      "Priority support",
      "API access",
      "Custom themes",
      "Abandoned cart recovery",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: "$199",
    period: "/month",
    description: "For agencies and power users who need everything.",
    features: [
      "Unlimited stores",
      "Unlimited products",
      "Full analytics suite",
      "Custom domains",
      "Dedicated support",
      "Full API access",
      "White-label",
      "Custom integrations",
      "Team collaboration",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <SectionWrapper id="pricing" className="py-32">
      <div className="text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-purple-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-5"
        >
          Simple, transparent pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-lg mx-auto"
        >
          Start free. Scale as you grow. No hidden fees, no surprises.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.6 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`relative group ${plan.highlighted ? "md:-my-4" : ""}`}
          >
            {plan.highlighted && (
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-purple-500 to-blue-500 -z-10" />
            )}
            <div
              className={`relative h-full rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "border-transparent bg-white shadow-2xl shadow-purple-200/50"
                  : "border-gray-200/60 bg-white/70 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-gray-500 mb-5">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
