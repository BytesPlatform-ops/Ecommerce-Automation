"use client";

import { motion } from "framer-motion";

const oldWay = [
  "Hire developers, designers, PMs",
  "Wait weeks for mockups",
  "Manual product uploads",
  "Set up payment gateways yourself",
  "Debug production bugs at 2am",
  "Months to launch",
];

const newWay = [
  "Describe your store in plain English",
  "AI generates your entire storefront",
  "Products auto-imported from description",
  "Stripe payments configured instantly",
  "99.9% uptime, zero maintenance",
  "Live in 60 seconds",
];

export function Comparison() {
  return (
    <section className="relative py-20 sm:py-32 px-5">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The old way is <span className="text-red-400/80 line-through decoration-red-500/40">broken</span>
          </h2>
        </motion.div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 0.7, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: -2 }}
            className="relative rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400/80">The Old Way</h3>
            </div>
            <ul className="space-y-3">
              {oldWay.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                  className="flex items-start gap-3 text-sm text-current opacity-40"
                >
                  <span className="text-red-400/60 mt-0.5 flex-shrink-0">✕</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Bytescart Way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-2xl border border-[#00FF88]/20 bg-[#00FF88]/[0.03] p-6 sm:p-8 shadow-lg shadow-[#00FF88]/[0.05]"
          >
            {/* Pulse glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#00FF88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#00FF88]">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#00FF88]">The Bytescart Way</h3>
            </div>
            <ul className="space-y-3">
              {newWay.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                  className="flex items-start gap-3 text-sm text-current opacity-70"
                >
                  <span className="text-[#00FF88] mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
