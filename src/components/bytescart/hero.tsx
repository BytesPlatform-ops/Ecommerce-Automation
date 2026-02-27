"use client";

import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Animated beam sweep ─────────────────────────────────────────────────────
function BeamSweep() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "220%", opacity: [0, 0.7, 0.7, 0] }}
        transition={{ duration: 2.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 bottom-0 w-[2px] hidden md:block"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.6) 30%, rgba(0,255,136,0.9) 50%, rgba(0,255,136,0.6) 70%, transparent)",
          filter: "blur(1px)",
          left: "25%",
        }}
      />
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "320%", opacity: [0, 0.35, 0.35, 0] }}
        transition={{ duration: 3.2, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 bottom-0 w-[1px] hidden md:block"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.3) 50%, transparent)",
          left: "10%",
        }}
      />
    </div>
  );
}

// ─── Floating mini dashboard ─────────────────────────────────────────────────
function FloatingDashboard() {
  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const rControl = animate(0, 12847, { duration: 2, ease: "easeOut", onUpdate: (v) => setRevenue(Math.round(v)) });
      const oControl = animate(0, 384, { duration: 1.8, ease: "easeOut", onUpdate: (v) => setOrders(Math.round(v)) });
      return () => { rControl.stop(); oControl.stop(); };
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-14 mx-auto w-full max-w-3xl hidden md:block"
    >
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Glow underneath */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[#00FF88]/10 blur-[50px] rounded-full" />

        <div
          className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50"
          style={{ background: "linear-gradient(160deg, #141921 0%, #0d1117 100%)" }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white/[0.04] text-white/25 text-[10px] font-mono">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                dashboard.bytescart.com/overview
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              <span className="text-[9px] font-semibold text-[#00FF88] tracking-wider">LIVE</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Revenue", value: `$${revenue.toLocaleString()}`, change: "+23%", color: "#00FF88" },
                { label: "Orders", value: orders.toString(), change: "+12%", color: "#60A5FA" },
                { label: "Visitors", value: "8.2K", change: "+31%", color: "#A78BFA" },
                { label: "Conv. Rate", value: "4.7%", change: "+8%", color: "#F59E0B" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="text-white/30 text-[9px] uppercase tracking-wider">{stat.label}</div>
                  <div className="text-white/90 font-bold text-sm mt-0.5 font-mono">{stat.value}</div>
                  <div className="text-[10px] mt-0.5 font-medium" style={{ color: stat.color }}>{stat.change}</div>
                </div>
              ))}
            </div>
            <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 overflow-hidden">
              <div className="text-white/25 text-[9px] mb-1.5 uppercase tracking-wider">Revenue — last 30 days</div>
              <svg className="w-full h-10" viewBox="0 0 600 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,35 Q60,30 120,24 T240,16 T360,10 T480,6 T600,2 V40 H0 Z"
                  fill="url(#heroChartGrad)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 0.8 }}
                />
                <motion.path
                  d="M0,35 Q60,30 120,24 T240,16 T360,10 T480,6 T600,2"
                  fill="none" stroke="#00FF88" strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 2.1, duration: 1.6, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating chip labels */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5, duration: 0.6 }}
          className="absolute -left-6 top-1/3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F14] border border-[#00FF88]/20 shadow-xl">
          <span className="text-[#00FF88] text-xs">⚡</span>
          <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">AI-Generated</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.7, duration: 0.6 }}
          className="absolute -right-6 top-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 shadow-xl">
          <span className="text-[#60A5FA] text-xs">🔒</span>
          <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">SSL Secured</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.9, duration: 0.6 }}
          className="absolute -bottom-4 left-1/4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 shadow-xl">
          <span className="text-[#F59E0B] text-xs">💳</span>
          <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">Stripe Connected</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Scrolling marquee ───────────────────────────────────────────────────────
const marqueeItems = [
  "12,000+ Stores Live", "60-Second Setup", "AI Product Generator",
  "Stripe Payments", "Custom Domains", "Global Shipping",
  "99.9% Uptime", "Real-Time Analytics", "Multi-Currency", "SEO Optimized",
];

function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="relative overflow-hidden py-3 border-y border-white/[0.05] mt-14">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-[11px] text-white/25 font-semibold tracking-widest uppercase">
            <span className="w-1 h-1 rounded-full bg-[#00FF88]/40 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Particle canvas ─────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 0 : 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.25 + 0.06,
        pulse: Math.random() * Math.PI * 2,
      } as { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number }) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,136,${alpha})`;
        ctx.fill();
      });
      // Faint connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i] as { x: number; y: number }).x - (particles[j] as { x: number; y: number }).x;
          const dy = (particles[i] as { x: number; y: number }).y - (particles[j] as { x: number; y: number }).y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo((particles[i] as { x: number; y: number }).x, (particles[i] as { x: number; y: number }).y);
            ctx.lineTo((particles[j] as { x: number; y: number }).x, (particles[j] as { x: number; y: number }).y);
            ctx.strokeStyle = `rgba(0,255,136,${0.05 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none hidden md:block"
      style={{ willChange: "transform" }}
    />
  );
}

// ─── Main Hero ───────────────────────────────────────────────────────────────
const line1 = ["Turn", "one", "idea"];
const line2 = ["into", "a", "live"];
const line3 = ["ecommerce", "empire."];

export function Hero() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });
  const bgX = useTransform(springX, [0, 1], [-20, 20]);
  const bgY = useTransform(springY, [0, 1], [-12, 12]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* ── Deep background layers ── */}
      <motion.div className="absolute inset-0 z-0" style={{ x: bgX, y: bgY }}>
        {/* Outer grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.06) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Fine inner grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        {/* Center radial — breathing animation */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
          style={{ background: "radial-gradient(circle, #00FF88 0%, transparent 60%)", filter: "blur(80px)" }}
        />
        {/* Top-right blue orb */}
        <motion.div
          animate={{ y: [0, -35, 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, #60A5FA 0%, transparent 60%)", filter: "blur(100px)" }}
        />
        {/* Bottom-left purple orb */}
        <motion.div
          animate={{ y: [0, 25, 0], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, #A78BFA 0%, transparent 60%)", filter: "blur(100px)" }}
        />
      </motion.div>

      <ParticleField />
      <BeamSweep />

      {/* Top/bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-transparent to-[#0B0F14]/90 z-[1] pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 pt-28 sm:pt-32 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#00FF88]/25 bg-[#00FF88]/[0.06] backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]" />
          </span>
          <span className="text-[#00FF88] text-xs font-semibold tracking-widest uppercase">AI-Powered Commerce Platform</span>
          <span className="hidden sm:inline text-white/20 text-xs">·</span>
          <span className="hidden sm:inline text-white/40 text-xs">Open Beta</span>
        </motion.div>

        {/* ── Massive headline — line-by-line clip reveal ── */}
        <h1 className="font-black leading-[0.92] tracking-[-0.03em] mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}>
          {/* Line 1 */}
          <div className="overflow-hidden flex justify-center gap-[0.22em] flex-wrap">
            {line1.map((word, i) => (
              <motion.span key={word}
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block text-white">
                {word}
              </motion.span>
            ))}
          </div>
          {/* Line 2 */}
          <div className="overflow-hidden flex justify-center gap-[0.22em] flex-wrap">
            {line2.map((word, i) => (
              <motion.span key={word}
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.42 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block ${word === "live"
                  ? "text-[#00FF88] drop-shadow-[0_0_70px_rgba(0,255,136,0.55)]"
                  : "text-white"}`}>
                {word}
              </motion.span>
            ))}
          </div>
          {/* Line 3 — gradient text */}
          <div className="overflow-hidden flex justify-center gap-[0.22em] flex-wrap">
            {line3.map((word, i) => (
              <motion.span key={word}
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.64 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
                style={{
                  background: "linear-gradient(90deg, #00FF88 0%, #00D4FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 45px rgba(0,255,136,0.35))",
                }}>
                {word}
              </motion.span>
            ))}
          </div>
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)" }}
        >
          Describe your store. Our AI builds it — products, payments, shipping, domain —
          all live in under 60 seconds. No code, no design skills, no limits.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(0,255,136,0.3)", "0 0 50px rgba(0,255,136,0.6)", "0 0 20px rgba(0,255,136,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full"
          >
            <Link
              href="/signup"
              className="group relative flex items-center gap-2 px-9 py-4 rounded-full bg-[#00FF88] text-[#0B0F14] font-bold text-base overflow-hidden transition-all duration-300 hover:scale-105"
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="relative z-10">Generate My Store — Free</span>
            </Link>
          </motion.div>
          <button className="group flex items-center gap-2.5 px-6 py-4 text-white/60 font-medium text-base hover:text-white transition-colors duration-300">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:border-[#00FF88]/50 group-hover:shadow-[0_0_16px_rgba(0,255,136,0.2)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-white/60 group-hover:text-white transition-colors duration-300">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </motion.span>
            Watch Demo
          </button>
        </motion.div>

        {/* Social proof avatars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2.5">
            {["#FF6B6B", "#00FF88", "#60A5FA", "#F59E0B", "#A78BFA"].map((color, i) => (
              <div key={i}
                className="w-8 h-8 rounded-full border-2 border-[#0B0F14] flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: color, zIndex: 5 - i }}>
                {["JD", "AR", "SM", "KL", "TP"][i]}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white/30 text-[11px]">
              <span className="text-white/60 font-semibold">12,000+</span> entrepreneurs launched this month
            </p>
          </div>
        </motion.div>

        {/* Marquee */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}>
          <Marquee />
        </motion.div>

        {/* Floating dashboard */}
        <FloatingDashboard />

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1 }}
          className="flex justify-center py-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-[#00FF88]/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
