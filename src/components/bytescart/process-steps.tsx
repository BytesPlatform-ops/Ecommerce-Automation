"use client";

import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useRef, useCallback } from "react";

/* ─── Step Data ─── */
const steps = [
  {
    num: "01",
    title: "Set Up Your Store",
    description:
      "Choose your store name, niche, and style. Everything is guided — no experience needed.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    orbitSpeed: 6,
  },
  {
    num: "02",
    title: "Everything Gets Built",
    description:
      "Storefront, products, payments, shipping — your entire store is ready and live in under 60 seconds.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    orbitSpeed: 5,
  },
  {
    num: "03",
    title: "Go Live & Scale",
    description:
      "Custom domain, analytics, orders — your empire is live. Manage everything from one dashboard.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    orbitSpeed: 7,
  },
];

/* ─── Neon Border Card ─── */
function NeonCard({
  children,
  index,
  orbitSpeed,
}: {
  children: React.ReactNode;
  index: number;
  orbitSpeed: number;
}) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [0, 1], [-4, 4]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.25, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-default"
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative will-change-transform"
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {/* Ambient glow beneath card */}
        <div className="absolute -inset-6 rounded-3xl bg-[#10B981]/0 group-hover:bg-[#10B981]/[0.07] blur-3xl transition-all duration-700 ease-out -z-10" />

        {/* Neon border container — clips the spinning gradient */}
        <div className="relative rounded-2xl p-[1.5px] overflow-hidden">
          {/* === Primary orbiting neon dot === */}
          <motion.div
            className="absolute opacity-50 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              inset: "-200%",
              background: `conic-gradient(
                from 0deg,
                transparent 0%,
                transparent 70%,
                rgba(0,255,136,0.04) 76%,
                rgba(0,255,136,0.18) 83%,
                rgba(0,255,136,0.65) 89%,
                #10B981 92%,
                rgba(0,255,136,0.65) 95%,
                rgba(0,255,136,0.12) 97%,
                transparent 100%
              )`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: orbitSpeed, repeat: Infinity, ease: "linear" }}
          />

          {/* === Secondary counter-rotating trace (visible on hover) === */}
          <motion.div
            className="absolute opacity-0 group-hover:opacity-50 transition-opacity duration-700"
            style={{
              inset: "-200%",
              background: `conic-gradient(
                from 180deg,
                transparent 0%,
                transparent 82%,
                rgba(0,255,136,0.12) 88%,
                rgba(0,255,136,0.35) 94%,
                transparent 100%
              )`,
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: orbitSpeed * 1.4, repeat: Infinity, ease: "linear" }}
          />

          {/* === Base static ring (faint fallback border) === */}
          <div
            className="absolute inset-0 rounded-2xl opacity-100 group-hover:opacity-0 transition-opacity duration-500"
            style={{
              background: `conic-gradient(
                from 90deg,
                rgba(0,255,136,0.04),
                rgba(0,255,136,0.01),
                rgba(0,255,136,0.04),
                rgba(0,255,136,0.01)
              )`,
            }}
          />

          {/* === Inner card surface === */}
          <div className="relative rounded-[calc(1rem-1.5px)] bg-white p-8 sm:p-10 h-full transition-shadow duration-500 shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,255,136,0.1)]">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step Content ─── */
function StepContent({ step, index }: { step: (typeof steps)[0]; index: number }) {
  return (
    <div className="relative">
      {/* Large watermark number */}
      <div className="absolute -top-3 -right-3 text-8xl sm:text-[6.5rem] font-black text-[#10B981]/[0.05] group-hover:text-[#10B981]/[0.1] select-none leading-none tracking-tighter transition-colors duration-700 pointer-events-none">
        {step.num}
      </div>

      {/* Icon badge */}
      <div className="relative w-14 h-14 rounded-2xl bg-[#10B981]/[0.06] border border-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-7 group-hover:bg-[#10B981]/[0.12] group-hover:border-[#10B981]/20 transition-all duration-500 overflow-hidden">
        {/* Icon glow ring on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(0,255,136,0.15)]" />
        <motion.div
          className="relative z-10"
          whileHover={{ scale: 1.15, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {step.icon}
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-[1.35rem] font-bold tracking-tight leading-tight mb-2">
        {step.title}
      </h3>

      {/* Animated accent bar */}
      <motion.div
        className="h-[2px] rounded-full bg-gradient-to-r from-[#10B981] to-[#10B981]/0 origin-left mb-4"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: 0.4 + index * 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ maxWidth: 48 }}
      />

      {/* Description */}
      <p className="text-sm leading-relaxed opacity-40 group-hover:opacity-55 transition-opacity duration-500">
        {step.description}
      </p>
    </div>
  );
}

/* ─── Connecting Line (desktop) ─── */
function ConnectorLine() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="absolute top-[42px] left-0 right-0 hidden md:flex items-center justify-center pointer-events-none z-20"
    >
      <div className="w-full max-w-[calc(100%-140px)] mx-auto relative flex items-center">
        {/* Base line */}
        <motion.div
          className="absolute inset-x-0 h-[1px]"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          style={{ originX: 0 }}
        >
          <div className="h-full bg-gradient-to-r from-[#10B981]/20 via-[#10B981]/10 to-[#10B981]/20" />
        </motion.div>

        {/* Traveling energy pulse */}
        {isInView && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-16 h-[2px] bg-gradient-to-r from-transparent via-[#10B981]/70 to-transparent rounded-full"
            animate={{ left: ["-8%", "108%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
        )}

        {/* Junction dots */}
        {[33, 66].map((pos, i) => (
          <motion.div
            key={pos}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${pos}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.4,
              delay: 0.9 + i * 0.3,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#10B981]/25 border border-[#10B981]/30 relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-[#10B981]/20"
                animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: i * 0.6 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Section ─── */
export function ProcessSteps() {
  return (
    <section className="relative py-24 sm:py-36 px-5 overflow-hidden" id="process">
      {/* Subtle background radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,255,136,0.025) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* ─── Section Header ─── */}
        <div className="text-center mb-20 sm:mb-24">
          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10B981]/15 bg-[#10B981]/[0.04] mb-6"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[#10B981] text-[11px] font-semibold tracking-[0.15em] uppercase">
              How It Works
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            Three steps to{" "}
            <span className="relative inline-block">
              <span className="text-[#10B981]">launch</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
              >
                <motion.path
                  d="M2 8C30 2 60 2 100 6C140 10 170 4 198 6"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-sm sm:text-base opacity-35 max-w-md mx-auto leading-relaxed"
          >
            From idea to live storefront in minutes — no code, no complexity.
          </motion.p>
        </div>

        {/* ─── Cards Grid ─── */}
        <div className="relative">
          <ConnectorLine />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <NeonCard key={step.num} index={i} orbitSpeed={step.orbitSpeed}>
                <StepContent step={step} index={i} />
              </NeonCard>
            ))}
          </div>
        </div>

        {/* ─── Bottom stat ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 opacity-30 hover:opacity-50 transition-opacity duration-300 cursor-default">
            <span className="text-xs font-medium tracking-wide uppercase">
              Average setup time: 60 seconds
            </span>
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#10B981]"
            >
              →
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
