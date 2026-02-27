"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";

const stats = [
  { value: 12000, suffix: "+", label: "Stores Generated" },
  { value: 60, suffix: "s", label: "Average Setup Time" },
  { value: 99, suffix: "%", label: "Uptime Guaranteed" },
];

function StatCounter({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && ref.current && !hasAnimated.current) {
      hasAnimated.current = true;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.2,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.val).toLocaleString() + suffix;
          }
        },
      });
    }
  }, [inView, value, suffix, delay]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <span
        ref={ref}
        className="block text-4xl sm:text-5xl md:text-6xl font-bold text-[#00FF88] tracking-tight"
      >
        0{suffix}
      </span>
      <span className="block mt-2 text-sm sm:text-base text-current opacity-50 font-medium tracking-wide">
        {label}
      </span>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="relative py-20 sm:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {stats.map((stat, i) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
