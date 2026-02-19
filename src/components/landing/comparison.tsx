"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { 
  X, 
  Check, 
  Clock, 
  DollarSign, 
  Code2, 
  Server, 
  Palette, 
  Rocket,
  Sparkles,
  Zap
} from "lucide-react";

const oldWayItems = [
  { icon: Clock, text: "Weeks of development time", detail: "3-6 months typical" },
  { icon: DollarSign, text: "Expensive agency fees", detail: "$15,000 - $50,000+" },
  { icon: Code2, text: "Hire developers & designers", detail: "Full team required" },
  { icon: Server, text: "Manual server setup", detail: "DevOps expertise needed" },
  { icon: Palette, text: "Endless design revisions", detail: "Back-and-forth cycles" },
];

const newWayItems = [
  { icon: Zap, text: "Live in 60 seconds", detail: "Instant deployment" },
  { icon: DollarSign, text: "Just $49/month", detail: "No hidden fees" },
  { icon: Sparkles, text: "AI handles everything", detail: "Zero coding required" },
  { icon: Server, text: "Auto-scaling infrastructure", detail: "Enterprise-grade" },
  { icon: Rocket, text: "Perfect on first try", detail: "AI-optimized design" },
];

export function Comparison() {
  return (
    <SectionWrapper id="comparison" className="py-24 sm:py-32">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-violet-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Why Bytescart
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5"
        >
          The old way vs.{" "}
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            the Bytescart way
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg"
        >
          Stop wasting months and thousands of dollars. Launch your store today.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-0">
        {/* Old Way Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="relative rounded-2xl md:rounded-3xl border border-gray-200 bg-white/60 backdrop-blur-xl p-6 sm:p-8 lg:p-10 overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">The Old Way</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Traditional ecommerce setup</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {oldWayItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-gray-900 font-medium line-through decoration-red-300">
                        {item.text}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">{item.detail}</p>
                    </div>
                    <X className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  </motion.div>
                ))}
              </div>

              {/* Bottom pill */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-50 text-red-600 text-xs sm:text-sm font-medium">
                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                  <span>Months to launch</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* New Way Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="relative rounded-2xl md:rounded-3xl border border-violet-200/60 bg-gradient-to-br from-white via-violet-50/30 to-blue-50/30 backdrop-blur-xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl shadow-violet-100/50">
            {/* Gradient glow */}
            <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-violet-200/40 to-blue-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-tr from-blue-200/30 to-violet-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                  <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">The Bytescart Way</h3>
                  <p className="text-xs sm:text-sm text-violet-600 font-medium">AI-powered automation</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {newWayItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 border border-violet-200/50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-gray-900 font-semibold">{item.text}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{item.detail}</p>
                    </div>
                    <div className="w-4.5 sm:w-5 h-4.5 sm:h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-600" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom pill */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-violet-100">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-500/30"
                >
                  <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                  <span>Launch in 60 seconds</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating accent */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-xl shadow-violet-500/40 z-10"
          >
            <span className="text-lg sm:text-2xl">⚡</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto px-4 sm:px-0"
      >
        {[
          { value: "99%", label: "Time saved" },
          { value: "300x", label: "Faster launch" },
          { value: "$14,950", label: "Money saved" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="text-center"
          >
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {stat.value}
            </p>
            <p className="text-[11px] sm:text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
