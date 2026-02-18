"use client";

import { motion } from "framer-motion";

/* Floating orb animation */
const orbFloat = (i: number) => ({
  y: [0, -25, 0],
  x: [0, i % 2 === 0 ? 12 : -12, 0],
  scale: [1, 1.08, 1],
  transition: {
    duration: 6 + i * 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});

export function AuthBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={orbFloat(0)}
        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/15 to-orange-600/5 blur-3xl"
      />
      <motion.div
        animate={orbFloat(1)}
        className="absolute bottom-[10%] right-[8%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-violet-600/10 to-indigo-500/5 blur-3xl"
      />
      <motion.div
        animate={orbFloat(2)}
        className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-emerald-500/8 to-teal-400/5 blur-3xl"
      />
      <motion.div
        animate={orbFloat(3)}
        className="absolute bottom-[30%] left-[25%] w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-rose-500/8 to-pink-400/5 blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial fade from center for card readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3)_0%,transparent_70%)]" />
    </div>
  );
}
