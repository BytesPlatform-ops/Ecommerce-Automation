"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Describe Your Vision",
    description: "Tell our AI what kind of store you want. Products, style, audience — just describe it naturally.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI Builds Everything",
    description: "Storefront, products, payments, shipping — your entire store gets generated in under 60 seconds.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Go Live & Scale",
    description: "Custom domain, analytics, orders — your empire is live. Manage everything from one dashboard.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export function ProcessSteps() {
  return (
    <section className="relative py-20 sm:py-32 px-5" id="process">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[#00FF88] text-xs font-semibold tracking-wider uppercase mb-4 block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Three steps to <span className="text-[#00FF88]">launch</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-[60px] left-0 right-0 hidden md:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent origin-left mx-16"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(0,255,136,0.08)" }}
                className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 transition-shadow duration-300 cursor-default"
              >
                {/* Step number */}
                <div className="text-[#00FF88]/20 text-5xl font-black absolute top-4 right-4 select-none">
                  {step.num}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/10 flex items-center justify-center text-[#00FF88] mb-5">
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-current opacity-40 leading-relaxed font-light">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
