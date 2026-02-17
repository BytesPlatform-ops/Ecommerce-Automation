"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const steps = [
  {
    number: "01",
    title: "Tell us your vision",
    description:
      "Share what you want to sell and the look you're going for. Just describe it in your own words — no tech skills needed.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    gradient: "from-purple-500 to-blue-500",
    bgGradient: "from-purple-50 to-blue-50",
    accentColor: "text-purple-600",
  },
  {
    number: "02",
    title: "We build your store",
    description:
      "Your product pages, checkout, and payments are set up automatically — a complete online store, ready in seconds.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    accentColor: "text-blue-600",
  },
  {
    number: "03",
    title: "Start selling right away",
    description:
      "Your store goes live with your own custom web address — fully secure and ready for customers everywhere.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    accentColor: "text-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" className="py-32">
      <div className="text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-purple-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Simple Process
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight"
        >
          Three steps to launch
        </motion.h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i, duration: 0.6 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="group relative"
          >
            <div className={`relative h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br ${step.bgGradient} p-8 hover:border-gray-300/80 transition-all duration-500 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50`}>
              {/* Shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                
                <span className={`text-xs font-mono ${step.accentColor} mb-3 block font-semibold`}>
                  Step {step.number}
                </span>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connecting arrows (desktop) */}
      <div className="hidden md:flex absolute top-1/2 left-[33%] right-[33%] items-center justify-around pointer-events-none -translate-y-4">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.2, type: "spring", stiffness: 300 }}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
