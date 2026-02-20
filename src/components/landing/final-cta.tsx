"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-24 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-violet-200/60 via-blue-200/40 to-violet-200/60 rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: useTransform(y, v => -v * 0.5) }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-300/30 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: useTransform(y, v => -v * 0.3) }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-blue-300/30 to-transparent rounded-full blur-3xl" 
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-violet-200/40"
        >
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-transparent to-blue-50/60 pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-400/20 blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20 blur-xl"
          />

          <div className="relative px-8 py-20 sm:px-16 sm:py-28 lg:py-32 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 border border-violet-200/60 mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              <span className="text-xs font-semibold text-violet-700">
                12,000+ stores launched
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]"
            >
              Your ecommerce business
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]">
                starts with one sentence.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 max-w-xl mx-auto mb-10 text-lg sm:text-xl"
            >
              No coding. No design skills. No DevOps knowledge.
              <br className="hidden sm:block" />
              Just describe your store and watch it come to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_100%] text-white font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all duration-500 animate-[gradient_4s_ease-in-out_infinite] w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate My Store</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Free trial · No credit card required</span>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-10 border-t border-gray-200/40"
            >
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                {[
                  { label: "Stores Created", value: "12,000+" },
                  { label: "Revenue Generated", value: "$4.2M+" },
                  { label: "Countries", value: "78" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
