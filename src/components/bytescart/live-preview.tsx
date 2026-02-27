"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stores = [
  {
    name: "Urban Threads",
    category: "Fashion",
    color: "#FF6B6B",
    bg: "from-rose-50 to-orange-50",
    revenue: "$24.8K",
    revenueRaw: 24800,
    change: "+18%",
    positive: true,
    orders: 312,
    products: 156,
    spark: [30, 45, 38, 60, 55, 72, 80],
    tagline: "Premium streetwear & lifestyle",
    productColors: ["#FF6B6B", "#F97316", "#EC4899", "#6366F1"],
  },
  {
    name: "TechVault",
    category: "Electronics",
    color: "#06B6D4",
    bg: "from-cyan-50 to-blue-50",
    revenue: "$89.2K",
    revenueRaw: 89200,
    change: "+34%",
    positive: true,
    orders: 1043,
    products: 234,
    spark: [40, 50, 60, 48, 75, 90, 100],
    tagline: "Next-gen gadgets & accessories",
    productColors: ["#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6"],
  },
  {
    name: "Glow Beauty",
    category: "Skincare",
    color: "#E879A8",
    bg: "from-pink-50 to-rose-50",
    revenue: "$31.5K",
    revenueRaw: 31500,
    change: "+22%",
    positive: true,
    orders: 489,
    products: 89,
    spark: [20, 35, 30, 50, 45, 60, 70],
    tagline: "Clean beauty essentials",
    productColors: ["#E879A8", "#F472B6", "#FB7185", "#FBBF24"],
  },
  {
    name: "HomeNest",
    category: "Home & Living",
    color: "#D97706",
    bg: "from-amber-50 to-yellow-50",
    revenue: "$56.1K",
    revenueRaw: 56100,
    change: "+9%",
    positive: true,
    orders: 672,
    products: 312,
    spark: [55, 48, 60, 58, 65, 70, 68],
    tagline: "Curated home décor & furniture",
    productColors: ["#D97706", "#F59E0B", "#10B981", "#6B7280"],
  },
  {
    name: "FitGear Pro",
    category: "Fitness",
    color: "#10B981",
    bg: "from-emerald-50 to-teal-50",
    revenue: "$42.7K",
    revenueRaw: 42700,
    change: "+27%",
    positive: true,
    orders: 531,
    products: 178,
    spark: [25, 40, 55, 50, 68, 75, 88],
    tagline: "Performance gear for champions",
    productColors: ["#10B981", "#14B8A6", "#06B6D4", "#3B82F6"],
  },
  {
    name: "PetPalace",
    category: "Pet Supplies",
    color: "#8B5CF6",
    bg: "from-violet-50 to-purple-50",
    revenue: "$18.3K",
    revenueRaw: 18300,
    change: "+41%",
    positive: true,
    orders: 287,
    products: 95,
    spark: [10, 18, 22, 30, 35, 45, 58],
    tagline: "Everything your pet deserves",
    productColors: ["#8B5CF6", "#A78BFA", "#EC4899", "#F59E0B"],
  },
];


function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function StoreCard({ store }: { store: (typeof stores)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 w-[260px] rounded-xl overflow-hidden cursor-pointer bg-white shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-gray-100/80 transition-shadow duration-300 hover:shadow-[0_10px_36px_rgba(0,0,0,0.12)]"
    >
      {/* ── Browser chrome bar ── */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-100">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white border border-gray-200/60 text-[10px] text-gray-400 font-mono">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {store.name.toLowerCase().replace(" ", "")}.bytescart.com
          </div>
        </div>
        {/* Live badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* ── Store preview ── */}
      <div
        className={`relative h-[120px] bg-gradient-to-br ${store.bg} overflow-hidden`}
      >
        {/* Mock nav */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/60 backdrop-blur-sm border-b border-white/50">
          <div
            className="text-[11px] font-bold tracking-tight"
            style={{ color: store.color }}
          >
            {store.name}
          </div>
          <div className="flex gap-3">
            {["Shop", "About", "Cart"].map((t) => (
              <span key={t} className="text-[9px] text-gray-400 font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Mock product grid */}
        <div className="grid grid-cols-4 gap-2 px-4 pt-3">
          {store.productColors.map((c, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{ aspectRatio: "1", background: `linear-gradient(135deg, ${c}20, ${c}08)` }}
            >
              <div
                className="w-full h-full rounded-lg opacity-60"
                style={{ background: `linear-gradient(135deg, ${c}30 0%, transparent 100%)` }}
              />
            </div>
          ))}
        </div>

        {/* Mock hero text */}
        <div className="px-4 pt-2">
          <div className="h-1.5 w-32 rounded-full bg-gray-300/50 mb-1.5" />
          <div className="h-1.5 w-20 rounded-full bg-gray-200/50" />
        </div>

        {/* Hover: visit button */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"
        >
          <div
            className="px-5 py-2 rounded-full text-white text-xs font-bold shadow-lg"
            style={{ backgroundColor: store.color }}
          >
            View Store ↗
          </div>
        </motion.div>
      </div>

      {/* ── Stats row ── */}
      <div className="px-3.5 pt-2.5 pb-3">
        {/* Category + tagline */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{store.category}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{store.tagline}</p>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: store.color, backgroundColor: store.color + "15" }}
          >
            {store.change}
          </span>
        </div>

        {/* Revenue + sparkline */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Monthly Revenue</p>
            <p className="text-base font-bold text-gray-900 mt-0.5 leading-none">{store.revenue}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-gray-400">{store.orders} orders</span>
              <span className="text-gray-200">·</span>
              <span className="text-[10px] text-gray-400">{store.products} products</span>
            </div>
          </div>
          <Sparkline data={store.spark} color={store.color} />
        </div>
      </div>
    </motion.div>
  );
}

export function LivePreview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const offsetRef = useRef(0);

  const allStores = [...stores, ...stores];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animId: number;
    const speed = 0.4;

    const animate = () => {
      if (!isPaused) {
        offsetRef.current += speed;
        const totalWidth = scrollContainer.scrollWidth / 2;
        if (offsetRef.current >= totalWidth) offsetRef.current = 0;
        scrollContainer.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      {/* Section header */}
      <div className="max-w-5xl mx-auto px-5 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="text-[#00FF88] text-xs font-semibold tracking-wider uppercase mb-4 block">
            Live Stores
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Stores built with <span className="text-[#00FF88]">Bytescart</span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Real stores, generating real revenue — all built with a single prompt.
          </p>
        </motion.div>

        {/* Aggregate trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mt-6"
        >
          {[
            { label: "Total GMV", value: "$2.4M+" },
            { label: "Active Stores", value: "12,000+" },
            { label: "Avg. Setup Time", value: "58s" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg sm:text-xl font-bold text-[#111827]">{stat.value}</p>
              <p className="text-[11px] text-[#111827]/40 uppercase tracking-wider font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scrolling cards */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none bg-gradient-to-r from-[#F8FAFC] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none bg-gradient-to-l from-[#F8FAFC] to-transparent" />

        <div
          ref={scrollRef}
          className="flex gap-5 px-5 pb-2"
          style={{ willChange: "transform" }}
        >
          {allStores.map((store, i) => (
            <StoreCard key={`${store.name}-${i}`} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}
