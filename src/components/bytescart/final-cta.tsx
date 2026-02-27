"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ctaWords = ["Start", "building", "your", "empire", "today."];
const glowSet = new Set(["empire", "today."]);

export function FinalCTA() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 sm:py-40 px-5 overflow-hidden">
      {/* Radial spotlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Staggered headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          {ctaWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-block mr-[0.3em] ${
                glowSet.has(word)
                  ? "text-[#00FF88] drop-shadow-[0_0_25px_rgba(0,255,136,0.4)]"
                  : "text-white"
              }`}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-white/40 text-base sm:text-lg max-w-xl mx-auto mb-10 font-light"
        >
          Join 12,000+ entrepreneurs who launched their online stores with AI. No credit card required to start.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <Link
            href="/signup"
            className={`inline-block px-10 py-4 rounded-full bg-[#00FF88] text-[#0B0F14] font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,255,136,0.3)] ${
              pulse ? "scale-105 shadow-[0_0_50px_rgba(0,255,136,0.3)]" : ""
            }`}
          >
            Generate My Store — Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
