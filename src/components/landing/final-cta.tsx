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
    <section ref={sectionRef} className="relative py-16 sm:py-24 overflow-hidden bg-[#0D2B1F]">
      {/* Organic texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-[#2E5C40]/30 via-[#1A3D2B]/40 to-[#2E5C40]/30 rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: useTransform(y, v => -v * 0.5) }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#2E5C40]/30 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: useTransform(y, v => -v * 0.3) }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#D4873A]/10 to-transparent rounded-full blur-3xl" 
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[40px] border border-[#2E5C40]/40 bg-[#0D2B1F]/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-[#0D2B1F]/60"
        >
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E5C40]/20 via-transparent to-[#D4873A]/10 pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245,240,232,0.2) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#2E5C40]/30 to-[#D4873A]/20 blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#D4873A]/20 to-[#2E5C40]/30 blur-xl"
          />

          <div className="relative px-8 py-20 sm:px-16 sm:py-28 lg:py-32 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2E5C40]/40 to-[#1A3D2B]/40 border border-[#D4873A]/30 mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#D4873A]"
              />
              <span className="text-xs font-semibold text-[#D4873A]">
                12,000+ stores launched
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#F5F0E8] tracking-tight mb-6 leading-[1.1] font-serif"
            >
              Your ecommerce business
              <br />
              <span className="bg-gradient-to-r from-[#D4873A] via-[#C9A84C] to-[#D4873A] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]">
                starts with one sentence.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#8FA898] max-w-xl mx-auto mb-10 text-lg sm:text-xl"
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
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-[#D4873A] text-[#0D2B1F] font-bold text-lg shadow-2xl shadow-[#D4873A]/30 hover:shadow-[0_0_40px_rgba(212,135,58,0.4)] hover:-translate-y-1 transition-all duration-500 w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate My Store</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4873A] to-[#C9A84C] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-[#8FA898]">
                <Zap className="w-4 h-4 text-[#D4873A]" />
                <span>Free trial · No credit card required</span>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-10 border-t border-[#2E5C40]/40"
            >
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                {[
                  { label: "Stores Created", value: "12,000+" },
                  { label: "Revenue Generated", value: "$4.2M+" },
                  { label: "Countries", value: "78" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-black text-[#D4873A]">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-[#F5F0E8] mt-1">{stat.label}</p>
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
