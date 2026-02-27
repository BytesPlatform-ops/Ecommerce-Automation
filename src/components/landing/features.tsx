"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { WaveDivider } from "./wave-divider";
import {
  Sparkles,
  Database,
  CreditCard,
  Globe,
  LayoutDashboard,
  BarChart3,
  Zap,
  Rocket
} from "lucide-react";

const features = [
  {
    title: "Store Builder",
    description: "Build a complete, production-ready storefront in seconds.",
    icon: Sparkles,
  },
  {
    title: "Automatic PostgreSQL",
    description: "Full database schema with products, orders, customers, and analytics — auto-generated and optimized.",
    icon: Database,
  },
  {
    title: "Stripe Payments Ready",
    description: "Accept credit cards, Apple Pay, Google Pay instantly. No setup required — just connect your Stripe.",
    icon: CreditCard,
  },
  {
    title: "Custom Domain + SSL",
    description: "Connect your domain with automatic SSL certificates. Or launch instantly on our free subdomain.",
    icon: Globe,
  },
  {
    title: "Admin Dashboard",
    description: "Full management panel for orders, analytics, products, and customers. Beautiful and intuitive.",
    icon: LayoutDashboard,
  },
  {
    title: "Advanced Analytics",
    description: "Real-time dashboards tracking sales, traffic, customer behavior, and inventory insights to drive growth.",
    icon: BarChart3,
  },
  {
    title: "Edge Hosting",
    description: "Deployed to 200+ global edge locations. Sub-100ms response times for customers everywhere.",
    icon: Zap,
  },
  {
    title: "One-Click Deploy",
    description: "Push updates live instantly. Zero-downtime deployments with automatic rollbacks if needed.",
    icon: Rocket,
  },
];

export function Features() {
  return (
    <SectionWrapper id="features" className="relative py-16 sm:py-24 bg-gradient-to-b from-[#0D2B1F] to-[#122E22]">
      <WaveDivider variant="top" color="cream" />
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-[#D4873A] uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Everything Included
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F0E8] tracking-tight mb-5"
        >
          Built for{" "}
          <span className="bg-gradient-to-r from-[#D4873A] to-[#C9A84C] bg-clip-text text-transparent">
            modern commerce
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#8FA898] max-w-2xl mx-auto text-lg"
        >
          Every feature you need to run a successful online business, automatically configured and ready to go.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative"
          >
            <div className="relative h-full rounded-3xl border-t-4 border-t-[#2E5C40] border border-[#2E5C40]/20 bg-[#F5F0E8] p-7 transition-all duration-500 overflow-hidden cursor-default hover:shadow-2xl hover:shadow-[#2E5C40]/20">
              {/* Hover gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D4] rounded-3xl" />
              
              {/* Glow orb */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#D4873A] to-[#C9A84C] rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-[#D4873A] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#0D2B1F]" />
                </div>
                
                <h3 className="text-base font-bold text-[#1A3D2B] mb-2 group-hover:text-[#0D2B1F] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#8FA898] leading-relaxed group-hover:text-[#1A3D2B] transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom callout */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#F5F0E8] border border-[#2E5C40]/20">
          <Sparkles className="w-5 h-5 text-[#D4873A]" />
          <span className="text-sm text-[#8FA898]">
            <span className="font-semibold text-[#1A3D2B]">All features included</span> in every plan. No hidden costs.
          </span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

