"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const oldWay = [
  "Hire developers, designers, PMs",
  "Wait weeks for mockups",
  "Manual product uploads",
  "Set up payment gateways yourself",
  "Debug production bugs at 2am",
  "Months to launch",
];

const newWay = [
  "Fill in your store details in minutes",
  "Your entire storefront is built instantly",
  "Products set up and ready to sell",
  "Stripe payments configured instantly",
  "99.9% uptime, zero maintenance",
  "Live in 60 seconds",
];

/* ── Animated X icon ──────────────────────────── */
function AnimatedX({ delay }: { delay: number }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-[3px] flex-shrink-0"
    >
      <motion.line
        x1="3"
        y1="3"
        x2="13"
        y2="13"
        stroke="#f87171"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.35, ease: "easeOut" }}
      />
      <motion.line
        x1="13"
        y1="3"
        x2="3"
        y2="13"
        stroke="#f87171"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.12, duration: 0.35, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/* ── Animated checkmark icon ──────────────────── */
function AnimatedCheck({ delay }: { delay: number }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="mt-[2px] flex-shrink-0"
    >
      <motion.circle
        cx="9"
        cy="9"
        r="8"
        stroke="#10B981"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M5.5 9.5l2.2 2.2 4.8-5.4"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.25, duration: 0.35, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/* ── Floating particle dots for the green card ── */
function FloatingParticles() {
  const [particles, setParticles] = useState<{ id: number; size: number; x: number; y: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: 3 + Math.random() * 4,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#10B981]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.25, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Scribble strikethrough SVG ───────────────── */
function ScribbleStrike() {
  return (
    <motion.svg
      className="absolute -left-2 -right-2 top-1/2 -translate-y-1/2 w-[calc(100%+16px)] h-[40px] pointer-events-none"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      fill="none"
    >
      <motion.path
        d="M5 22 C40 16, 60 28, 100 20 S160 14, 195 22"
        stroke="#ef4444"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.85 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d="M8 24 C45 18, 55 30, 98 22 S155 16, 192 24"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      />
    </motion.svg>
  );
}

export function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-36 px-5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(ellipse, #10B981 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* ── Section header ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-sm font-semibold tracking-widest uppercase text-[#10B981] mb-4"
          >
            Why Bytescart?
          </motion.p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            The old way is{" "}
            <span className="relative inline-block">
              <span className="text-red-400/90">broken</span>
              <ScribbleStrike />
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-5 text-base sm:text-lg opacity-50 max-w-md mx-auto"
          >
            Stop wasting months on setup. Launch your store while your
            competitors are still waiting for mockups.
          </motion.p>
        </motion.div>

        {/* ── Comparison grid ───────────────────── */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* ─── VS divider ─── */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-full bg-white shadow-xl shadow-black/10 border border-gray-200/60 flex items-center justify-center pointer-events-auto"
            >
              <span className="text-sm font-black tracking-tight bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                VS
              </span>
            </motion.div>
          </div>

          {/* ─── Old Way Card ─── */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
          >
            <div className="relative h-full rounded-3xl border border-red-200/60 bg-gradient-to-br from-red-50/80 via-white to-rose-50/50 p-8 sm:p-10 transition-all duration-500 hover:border-red-300/60 hover:shadow-lg hover:shadow-red-100/30">
              {/* Faded grain overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-200/80 flex items-center justify-center shadow-sm"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">The Old Way</h3>
                  <p className="text-xs text-red-400/80 font-medium mt-0.5">Painful & slow</p>
                </div>
              </div>

              {/* List items */}
              <ul className="space-y-4">
                {oldWay.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-start gap-3 group/item"
                  >
                    <AnimatedX delay={0.4 + i * 0.1} />
                    <span className="text-[15px] text-gray-500 leading-relaxed group-hover/item:text-gray-600 transition-colors">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Bottom fade/discourage effect */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                className="mt-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-red-200 to-transparent origin-left"
              />
            </div>
          </motion.div>

          {/* ─── Bytescart Way Card ─── */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative"
          >
            <div className="relative h-full rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-[#10B981]/10 overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #10B981, #10B981, #10B981, #80FFB4, #10B981)",
                    opacity: 0.4,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-[1.5px] rounded-[22px] bg-gradient-to-br from-emerald-50/95 via-white to-green-50/80" />
              </div>

              {/* Inner content */}
              <div className="relative z-10">
                <FloatingParticles />

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={isInView ? { boxShadow: ["0 0 0px #10B98100", "0 0 20px #10B98144", "0 0 0px #10B98100"] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-emerald-200/40 flex items-center justify-center"
                  >
                    <motion.svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#10B981]"
                      animate={isInView ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path
                        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      The Bytescart Way
                    </h3>
                    <p className="text-xs text-[#10B981] font-semibold mt-0.5">
                      Fast & effortless
                    </p>
                  </div>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="ml-auto"
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#00AA55] border border-[#10B981]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      Recommended
                    </span>
                  </motion.div>
                </div>

                {/* List items */}
                <ul className="space-y-4">
                  {newWay.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.4 + i * 0.1,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 group/item cursor-default"
                    >
                      <AnimatedCheck delay={0.55 + i * 0.1} />
                      <span className="text-[15px] text-gray-700 leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Bottom accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
                  className="mt-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent origin-left"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom social proof ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 flex flex-row flex-wrap items-center justify-center gap-8 sm:gap-10"
        >
          {[
            { value: "60s", label: "Average launch time" },
            { value: "0", label: "Lines of code needed" },
            { value: "24/7", label: "Uptime monitoring" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-gray-800 to-gray-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-1 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
