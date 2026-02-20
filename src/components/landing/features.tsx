"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
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
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-100 to-purple-100",
  },
  {
    title: "Automatic PostgreSQL",
    description: "Full database schema with products, orders, customers, and analytics — auto-generated and optimized.",
    icon: Database,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-100 to-cyan-100",
  },
  {
    title: "Stripe Payments Ready",
    description: "Accept credit cards, Apple Pay, Google Pay instantly. No setup required — just connect your Stripe.",
    icon: CreditCard,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-100 to-teal-100",
  },
  {
    title: "Custom Domain + SSL",
    description: "Connect your domain with automatic SSL certificates. Or launch instantly on our free subdomain.",
    icon: Globe,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-100 to-orange-100",
  },
  {
    title: "Admin Dashboard",
    description: "Full management panel for orders, analytics, products, and customers. Beautiful and intuitive.",
    icon: LayoutDashboard,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-100 to-rose-100",
  },
  {
    title: "Advanced Analytics",
    description: "Real-time dashboards tracking sales, traffic, customer behavior, and inventory insights to drive growth.",
    icon: BarChart3,
    gradient: "from-indigo-500 to-blue-500",
    bgGradient: "from-indigo-100 to-blue-100",
  },
  {
    title: "Edge Hosting",
    description: "Deployed to 200+ global edge locations. Sub-100ms response times for customers everywhere.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
    bgGradient: "from-yellow-100 to-amber-100",
  },
  {
    title: "One-Click Deploy",
    description: "Push updates live instantly. Zero-downtime deployments with automatic rollbacks if needed.",
    icon: Rocket,
    gradient: "from-violet-500 to-blue-500",
    bgGradient: "from-violet-100 to-blue-100",
  },
];

export function Features() {
  return (
    <SectionWrapper id="features" className="py-16 sm:py-24">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-violet-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Everything Included
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5"
        >
          Built for{" "}
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            modern commerce
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-lg"
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
            <div className="relative h-full rounded-3xl border border-gray-200/60 bg-white/70 backdrop-blur-xl p-7 hover:border-violet-200/60 transition-all duration-500 overflow-hidden cursor-default hover:shadow-2xl hover:shadow-violet-100/50">
              {/* Hover gradient */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.bgGradient} rounded-3xl`} />
              
              {/* Glow orb */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-white/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 text-gray-600 group-hover:text-violet-600 transition-colors duration-300`} />
                </div>
                
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-violet-900 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
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
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">All features included</span> in every plan. No hidden costs.
          </span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

