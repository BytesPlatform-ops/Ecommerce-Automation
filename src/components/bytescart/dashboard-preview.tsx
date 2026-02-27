"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [cursorPos, setCursorPos] = useState({ x: 180, y: 120 });

  // Fake cursor movement
  useEffect(() => {
    if (!inView) return;
    const points = [
      { x: 180, y: 120 },
      { x: 320, y: 80 },
      { x: 250, y: 200 },
      { x: 400, y: 150 },
      { x: 150, y: 180 },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % points.length;
      setCursorPos(points[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section ref={ref} className="relative py-20 sm:py-32 px-5" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[#00FF88] text-xs font-semibold tracking-wider uppercase mb-4 block">
            Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Access your <span className="text-[#00FF88]">command center</span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Everything you need to run your store, powered by AI.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #0B0F14 50%, #111827 100%)",
            }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/[0.04] text-white/30 text-xs font-mono">
                  dashboard.bytescart.com
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 sm:p-8 min-h-[350px] sm:min-h-[420px] relative">
              {/* Sidebar mock */}
              <div className="absolute left-0 top-0 bottom-0 w-[200px] border-r border-white/[0.04] p-4 hidden sm:block">
                <div className="space-y-1">
                  {["Overview", "Products", "Orders", "Analytics", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        i === 0
                          ? "bg-[#00FF88]/10 text-[#00FF88]"
                          : "text-white/30 hover:text-white/50"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main area */}
              <div className="sm:ml-[216px] space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Revenue", value: "$12,847", change: "+23%" },
                    { label: "Orders", value: "384", change: "+12%" },
                    { label: "Visitors", value: "8.2K", change: "+31%" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                    >
                      <div className="text-white/40 text-[10px] uppercase tracking-wider">{stat.label}</div>
                      <div className="text-white text-lg font-bold mt-1">{stat.value}</div>
                      <div className="text-[#00FF88] text-xs mt-0.5">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Chart mock */}
                <div className="h-32 sm:h-40 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 relative overflow-hidden">
                  <div className="text-white/40 text-xs mb-3">Revenue (7 days)</div>
                  <svg className="w-full h-20" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF88" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,60 Q50,50 100,40 T200,25 T300,35 T400,15 V80 H0 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0,60 Q50,50 100,40 T200,25 T300,35 T400,15"
                      fill="none"
                      stroke="#00FF88"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Table mock */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.05]">
                    <div className="text-white/40 text-xs">Recent Orders</div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
                        <div>
                          <div className="text-white/70 text-xs font-medium">Order #{1000 + i}</div>
                          <div className="text-white/30 text-[10px]">2 items</div>
                        </div>
                      </div>
                      <div className="text-[#00FF88] text-xs font-medium">${(Math.random() * 100 + 20).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake cursor */}
              <motion.div
                animate={{ x: cursorPos.x, y: cursorPos.y }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute hidden sm:block pointer-events-none z-20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.6">
                  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
                </svg>
              </motion.div>

              {/* Blinking caret */}
              <div className="absolute top-[52px] right-[120px] hidden sm:block">
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-[2px] h-4 bg-[#00FF88]"
                />
              </div>
            </div>
          </motion.div>

          {/* Glow underneath */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#00FF88]/[0.06] blur-[60px] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
