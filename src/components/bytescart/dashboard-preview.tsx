"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animated counter hook
function useAnimatedNumber(target: number, duration: number = 1500, inView: boolean = true) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [target, duration, inView]);
  return current;
}

// Sparkline mini chart component
function Sparkline({ data, color = "#00FF88", delay = 0 }: { data: number[]; color?: string; delay?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <motion.svg
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: 1, pathLength: 1 }}
      transition={{ duration: 1, delay }}
      className="w-16 h-8"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

// Live activity indicator
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-[#00FF88]"
      />
      <span className="text-[10px] text-[#00FF88] font-medium">LIVE</span>
    </div>
  );
}

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [cursorPos, setCursorPos] = useState({ x: 280, y: 140 });
  const [activeTab, setActiveTab] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [hoverCard, setHoverCard] = useState<number | null>(null);

  // Animated stats
  const revenue = useAnimatedNumber(12847, 2000, inView);
  const orders = useAnimatedNumber(384, 1800, inView);
  const visitors = useAnimatedNumber(8200, 2200, inView);
  const conversion = useAnimatedNumber(4.7, 1600, inView);

  // Fake cursor movement with more natural path
  useEffect(() => {
    if (!inView) return;
    const points = [
      { x: 280, y: 140 },
      { x: 450, y: 90 },
      { x: 380, y: 220 },
      { x: 520, y: 180 },
      { x: 320, y: 280 },
      { x: 200, y: 160 },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % points.length;
      setCursorPos(points[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [inView]);

  // Cycle through tabs
  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, [inView]);

  // Show notification periodically
  useEffect(() => {
    if (!inView) return;
    const showTimer = setTimeout(() => setShowNotification(true), 3000);
    const hideTimer = setTimeout(() => setShowNotification(false), 6000);
    const cycleInterval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(cycleInterval);
    };
  }, [inView]);

  const sidebarItems = [
    { name: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { name: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { name: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const statsData = [
    { label: "Revenue", value: `$${revenue.toLocaleString()}`, change: "+23%", trend: "up", sparkline: [40, 45, 42, 55, 60, 58, 72], color: "#00FF88" },
    { label: "Orders", value: orders.toString(), change: "+12%", trend: "up", sparkline: [20, 25, 22, 28, 30, 35, 38], color: "#3B82F6" },
    { label: "Visitors", value: `${(visitors / 1000).toFixed(1)}K`, change: "+31%", trend: "up", sparkline: [50, 60, 55, 70, 80, 75, 95], color: "#A855F7" },
    { label: "Conversion", value: `${(conversion / 10).toFixed(1)}%`, change: "+0.8%", trend: "up", sparkline: [3.5, 3.8, 3.6, 4.0, 4.2, 4.5, 4.7], color: "#F59E0B" },
  ];

  const recentOrders = [
    { id: 1, customer: "Sarah M.", email: "sarah@email.com", amount: "84.99", status: "completed", items: 2, avatar: "S" },
    { id: 2, customer: "Alex K.", email: "alex@email.com", amount: "119.50", status: "processing", items: 3, avatar: "A" },
    { id: 3, customer: "Jordan P.", email: "jordan@email.com", amount: "47.25", status: "completed", items: 1, avatar: "J" },
  ];

  const topProducts = [
    { name: "Premium Headphones", sales: 127, revenue: "$15,875", progress: 85 },
    { name: "Wireless Charger", sales: 89, revenue: "$4,450", progress: 62 },
    { name: "Smart Watch", sales: 64, revenue: "$12,800", progress: 45 },
  ];

  return (
    <section ref={ref} className="relative py-20 sm:py-32 px-5" id="features">
      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold tracking-wider uppercase mb-6"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              ⚡
            </motion.span>
            Real-time Dashboard
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your <span className="relative">
              <span className="text-[#10B981]">command center</span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent origin-left"
              />
            </span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Monitor performance, track orders, and grow your business with powerful analytics.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50"
            style={{
              background: "linear-gradient(145deg, #0D1117 0%, #080B0F 50%, #0D1117 100%)",
            }}
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <motion.div whileHover={{ scale: 1.1 }} className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.1 }} className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.1 }} className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-white/40 text-xs font-mono">dashboard.bytescart.com</span>
                </div>
              </div>
              <LiveIndicator />
            </div>

            {/* Dashboard content */}
            <div className="flex min-h-[450px] sm:min-h-[520px] relative">
              {/* Sidebar */}
              <div className="w-[180px] lg:w-[200px] border-r border-white/[0.04] p-4 hidden sm:flex flex-col bg-white/[0.01]">
                {/* Logo area */}
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                    <span className="text-black font-bold text-sm">B</span>
                  </div>
                  <span className="text-white/80 font-semibold text-sm">BytesCart</span>
                </div>

                {/* Nav items */}
                <div className="space-y-1 flex-1">
                  {sidebarItems.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
                        activeTab === i
                          ? "bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20"
                          : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.name}
                      {i === 2 && (
                        <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#00FF88]/20 text-[#00FF88]">3</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* User area */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      JD
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/70 text-xs font-medium truncate">John Doe</div>
                      <div className="text-white/30 text-[10px] truncate">Pro Plan</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 sm:p-6 overflow-hidden relative">
                {/* Header with search */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white font-semibold text-lg"
                    >
                      Welcome back! 👋
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/40 text-xs mt-0.5"
                    >
                      Here&apos;s what&apos;s happening with your store today.
                    </motion.p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-40 lg:w-48 px-3 py-2 pl-8 text-xs rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/60 placeholder:text-white/30 focus:outline-none focus:border-[#00FF88]/30"
                      />
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FF88]" />
                    </motion.button>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {statsData.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20. }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      onMouseEnter={() => setHoverCard(i)}
                      onMouseLeave={() => setHoverCard(null)}
                      className="relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] overflow-hidden group cursor-pointer hover:border-white/[0.12] transition-all duration-300"
                    >
                      <motion.div
                        animate={{ opacity: hoverCard === i ? 0.1 : 0 }}
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 50% 50%, ${stat.color}, transparent 70%)` }}
                      />
                      <div className="flex items-start justify-between relative">
                        <div>
                          <div className="text-white/40 text-[10px] uppercase tracking-wider font-medium">{stat.label}</div>
                          <div className="text-white text-sm lg:text-base font-bold mt-1 tabular-nums">{stat.value}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3" style={{ color: stat.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: stat.color }}>{stat.change}</span>
                          </div>
                        </div>
                        <Sparkline data={stat.sparkline} color={stat.color} delay={i * 0.2 + 0.8} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart and side panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  {/* Main chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="lg:col-span-2 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] p-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-white/70 text-sm font-medium">Revenue Overview</div>
                        <div className="text-white/30 text-[10px] mt-0.5">Last 7 days performance</div>
                      </div>
                      <div className="flex gap-1">
                        {["1D", "7D", "1M", "1Y"].map((period, i) => (
                          <button
                            key={period}
                            className={`px-2 py-1 text-[10px] rounded ${
                              i === 1 ? "bg-[#00FF88]/20 text-[#00FF88]" : "text-white/30 hover:text-white/50"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00FF88" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#00FF88" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Grid lines */}
                        {[20, 40, 60, 80].map((y) => (
                          <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="white" strokeOpacity="0.03" />
                        ))}
                        {/* Area fill */}
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 1.2 }}
                          d="M0,75 C40,70 60,65 100,55 S160,40 200,35 S260,42 300,38 S360,25 400,20 S460,12 500,8 V100 H0 Z"
                          fill="url(#chartGradientEnhanced)"
                        />
                        {/* Main line */}
                        <motion.path
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
                          d="M0,75 C40,70 60,65 100,55 S160,40 200,35 S260,42 300,38 S360,25 400,20 S460,12 500,8"
                          fill="none"
                          stroke="#00FF88"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                        {/* Data points */}
                        {[[0, 75], [100, 55], [200, 35], [300, 38], [400, 20], [500, 8]].map(([x, y], i) => (
                          <motion.circle
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.5 + i * 0.1 }}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#0D1117"
                            stroke="#00FF88"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                      {/* Tooltip */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                        className="absolute top-2 right-16 px-2 py-1 rounded-md bg-white/10 border border-white/10 backdrop-blur-sm"
                      >
                        <div className="text-[9px] text-white/50">Today</div>
                        <div className="text-sm font-bold text-[#00FF88]">$2,847</div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Top products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] p-4"
                  >
                    <div className="text-white/70 text-sm font-medium mb-3">Top Products</div>
                    <div className="space-y-3">
                      {topProducts.map((product, i) => (
                        <motion.div
                          key={product.name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.3 + i * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-white/60 text-[11px] truncate pr-2">{product.name}</div>
                            <div className="text-[#00FF88] text-[10px] font-medium">{product.revenue}</div>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${product.progress}%` }}
                              transition={{ duration: 0.8, delay: 1.5 + i * 0.1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, #00FF88, #00CC6A)` }}
                            />
                          </div>
                          <div className="text-white/30 text-[9px] mt-1">{product.sales} sales</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Recent orders table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="text-white/70 text-sm font-medium">Recent Orders</div>
                    <button className="text-[#00FF88] text-[10px] hover:underline">View all</button>
                  </div>
                  {recentOrders.map(({ id, customer, email, amount, status, items, avatar }, i) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                      className="px-4 py-3 flex items-center justify-between border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{
                            background: `linear-gradient(135deg, ${
                              i === 0 ? "#00FF88, #00CC6A" : i === 1 ? "#3B82F6, #2563EB" : "#A855F7, #7C3AED"
                            })`
                          }}
                        >
                          {avatar}
                        </div>
                        <div>
                          <div className="text-white/80 text-xs font-medium">Order #{1000 + id}</div>
                          <div className="text-white/40 text-[10px]">{customer} • {items} items</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                            status === "completed"
                              ? "bg-[#00FF88]/10 text-[#00FF88]"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {status}
                        </span>
                        <div className="text-[#00FF88] text-sm font-semibold tabular-nums">${amount}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Notification toast */}
              <AnimatePresence>
                {showNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-16 right-6 z-30"
                  >
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#00FF88]/20 to-[#00FF88]/5 border border-[#00FF88]/30 backdrop-blur-xl shadow-lg shadow-[#00FF88]/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00FF88]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#00FF88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white text-xs font-medium">New order received!</div>
                        <div className="text-white/50 text-[10px]">Order #1004 • $156.00</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fake cursor */}
              <motion.div
                animate={{ x: cursorPos.x, y: cursorPos.y }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute hidden sm:block pointer-events-none z-20"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z"
                      fill="white"
                      fillOpacity="0.9"
                      stroke="#00FF88"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.div>
                {/* Click ripple */}
                <motion.div
                  animate={{ scale: [0, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-[#00FF88]"
                />
              </motion.div>
            </div>
          </motion.div>


        </motion.div>
      </div>
    </section>
  );
}
