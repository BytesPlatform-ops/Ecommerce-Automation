"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const steps = [
  {
    label: "Input",
    description: "Describe your store",
    icon: "💬",
    color: "from-purple-500 to-purple-600",
    glowColor: "purple",
  },
  {
    label: "Code",
    description: "Generate frontend & API",
    icon: "⚡",
    color: "from-blue-500 to-blue-600",
    glowColor: "blue",
  },
  {
    label: "Database",
    description: "Schema & migrations",
    icon: "🗄️",
    color: "from-cyan-500 to-cyan-600",
    glowColor: "cyan",
  },
  {
    label: "Products",
    description: "Catalog & inventory",
    icon: "📦",
    color: "from-emerald-500 to-emerald-600",
    glowColor: "emerald",
  },
  {
    label: "Deploy",
    description: "Build & ship to edge",
    icon: "🚀",
    color: "from-orange-500 to-orange-600",
    glowColor: "orange",
  },
  {
    label: "Live URL",
    description: "yourstore.com is live",
    icon: "🌐",
    color: "from-pink-500 to-pink-600",
    glowColor: "pink",
  },
];

export function Automation() {
  return (
    <SectionWrapper className="py-32">
      {/* Timeline - horizontal on desktop, vertical on mobile */}
      <div className="relative">
        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          {/* Connection line */}
          <div className="absolute top-[42px] left-[8%] right-[8%] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-300/60 via-blue-300/60 to-pink-300/60"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Node */}
                <div className={`relative w-[84px] h-[84px] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                  {/* Pulse ring */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} animate-ping opacity-20`} />
                </div>

                <p className="text-sm font-semibold text-gray-900 mb-1">{step.label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-1">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-lg shrink-0`}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-8 bg-gradient-to-b from-gray-200 to-transparent" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
