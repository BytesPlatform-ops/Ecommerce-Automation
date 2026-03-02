"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Styles & Animations ─────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=DM+Sans:wght@300;400&display=swap');
  
  .bc-hero-wrapper {
    font-family: 'DM Sans', sans-serif;
  }
  
  .bc-headline {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800;
  }
  
  /* Dot grid pattern */
  .bc-dot-grid {
    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  
  /* Float animation for cards */
  @keyframes bc-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .bc-float {
    animation: bc-float 6s ease-in-out infinite;
  }
  
  /* Shimmer sweep animation */
  @keyframes bc-shimmer {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }
  
  .bc-shimmer-active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: bc-shimmer 0.8s ease-out;
  }
  
  /* Ticker animation */
  @keyframes bc-ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .bc-ticker-track {
    animation: bc-ticker 25s linear infinite;
  }
  
  /* Fade in animations */
  .bc-fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  
  .bc-fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .bc-badge-animate {
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
  
  .bc-badge-animate.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .bc-word-wrapper {
    overflow: hidden;
    display: inline-flex;
    padding-bottom: 4px;
  }
  
  .bc-word {
    opacity: 0;
    transform: translateY(110%);
    filter: blur(8px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), 
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                filter 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    display: inline-block;
    position: relative;
  }
  
  .bc-word.visible {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
  
  .bc-word-green {
    position: relative;
  }
  
  .bc-word-green.visible {
    text-shadow: 0 0 40px rgba(0,245,118,0.5), 0 0 80px rgba(0,245,118,0.2);
    animation: bc-glow-pulse 2.5s ease-in-out infinite 1.5s;
  }
  
  @keyframes bc-glow-pulse {
    0%, 100% { text-shadow: 0 0 40px rgba(0,245,118,0.4), 0 0 80px rgba(0,245,118,0.15); }
    50% { text-shadow: 0 0 60px rgba(0,245,118,0.7), 0 0 120px rgba(0,245,118,0.3); }
  }
  
  /* Underline sweep on "60 seconds" */
  .bc-word-underline::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #00f576, rgba(0,245,118,0.3));
    border-radius: 2px;
    transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 0 12px rgba(0,245,118,0.5);
  }
  
  .bc-word-underline.visible::after {
    width: 100%;
    transition-delay: 0.3s;
  }
  
  /* Highlight sweep across entire headline */
  @keyframes bc-highlight-sweep {
    0% { left: -30%; opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { left: 130%; opacity: 0; }
  }
  
  .bc-headline-sweep {
    position: relative;
    overflow: hidden;
  }
  
  .bc-headline-sweep::after {
    content: '';
    position: absolute;
    top: 0;
    left: -30%;
    width: 20%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transform: skewX(-15deg);
    animation: bc-highlight-sweep 3s ease-in-out 1.8s;
    pointer-events: none;
  }
  
  .bc-card-fade {
    opacity: 0;
    transition: opacity 0.6s ease-out;
  }
  
  .bc-card-fade.visible {
    opacity: 1;
  }
  
  /* Animated background orbs */
  @keyframes bc-orb-float-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -20px) scale(1.05); }
    50% { transform: translate(-20px, 30px) scale(0.95); }
    75% { transform: translate(-30px, -10px) scale(1.02); }
  }
  
  @keyframes bc-orb-float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 25px) scale(1.08); }
    66% { transform: translate(25px, -35px) scale(0.92); }
  }
  
  @keyframes bc-orb-float-3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(20px, 40px) rotate(180deg); }
  }
  
  @keyframes bc-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }
  
  @keyframes bc-beam-sweep {
    0% { transform: translateX(-100%) rotate(45deg); opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    100% { transform: translateX(200%) rotate(45deg); opacity: 0; }
  }
  
  @keyframes bc-grid-pulse {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.06; }
  }
  
  @keyframes bc-particle-rise {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) scale(1); opacity: 0; }
  }
  
  .bc-orb-1 {
    animation: bc-orb-float-1 12s ease-in-out infinite;
  }
  
  .bc-orb-2 {
    animation: bc-orb-float-2 15s ease-in-out infinite;
  }
  
  .bc-orb-3 {
    animation: bc-orb-float-3 18s ease-in-out infinite;
  }
  
  .bc-pulse-orb {
    animation: bc-pulse 4s ease-in-out infinite;
  }
  
  .bc-beam {
    animation: bc-beam-sweep 8s ease-in-out infinite;
  }
  
  .bc-grid-animated {
    animation: bc-grid-pulse 6s ease-in-out infinite;
  }
`;

// ─── Mouse Glow Effect (Hero Section Only) ───────────────────────────────────
function MouseGlow({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationId: number;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Check if mouse is inside the hero section
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        targetPos.current = { x: e.clientX, y: e.clientY };
        if (!isVisible) setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Smooth animation loop with lerp
    const animate = () => {
      // Primary glow follows faster
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.15;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.15;
      
      // Trail follows slower for fluid effect
      trailPos.current.x += (targetPos.current.x - trailPos.current.x) * 0.08;
      trailPos.current.y += (targetPos.current.y - trailPos.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.left = `${currentPos.current.x}px`;
        glowRef.current.style.top = `${currentPos.current.y}px`;
      }
      
      if (trailRef.current) {
        trailRef.current.style.left = `${trailPos.current.x}px`;
        trailRef.current.style.top = `${trailPos.current.y}px`;
      }
      
      if (coreRef.current) {
        coreRef.current.style.left = `${currentPos.current.x}px`;
        coreRef.current.style.top = `${currentPos.current.y}px`;
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [isVisible, containerRef]);

  return (
    <>
      {/* Outer trail glow */}
      <div
        ref={trailRef}
        style={{
          position: "fixed",
          width: "800px",
          height: "800px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,245,118,0.06) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 4,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.5s ease-out",
          willChange: "left, top",
        }}
      />
      {/* Primary glow */}
      <div
        ref={glowRef}
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,245,118,0.18) 0%, rgba(0,245,118,0.06) 30%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 5,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          willChange: "left, top",
        }}
      />
      {/* Inner bright core */}
      <div
        ref={coreRef}
        style={{
          position: "fixed",
          width: "150px",
          height: "150px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,245,118,0.25) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 6,
          opacity: isVisible ? 1 : 0,
          filter: "blur(5px)",
          willChange: "left, top",
        }}
      />
    </>
  );
}

// ─── Animated Background Effects ─────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 bc-grid-animated"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,118,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,118,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Primary green orb - top center */}
      <div
        className="bc-orb-1"
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(0,245,118,0.12) 0%, transparent 60%)",
          filter: "blur(60px)",
          transform: "translateX(-50%)",
        }}
      />

      {/* Secondary blue orb - right side */}
      <div
        className="bc-orb-2"
        style={{
          position: "absolute",
          top: "30%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      {/* Tertiary purple orb - bottom left */}
      <div
        className="bc-orb-3"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-5%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />

      {/* Pulsing center accent */}
      <div
        className="bc-pulse-orb"
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(0,245,118,0.08) 0%, transparent 50%)",
          transform: "translate(-50%, -50%)",
          filter: "blur(40px)",
        }}
      />

      {/* Diagonal light beam */}
      <div
        className="bc-beam"
        style={{
          position: "absolute",
          top: "-50%",
          left: "-100%",
          width: "200%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(0,245,118,0.3), transparent)",
          boxShadow: "0 0 30px 10px rgba(0,245,118,0.1)",
        }}
      />

      {/* Second beam with delay */}
      <div
        className="bc-beam"
        style={{
          position: "absolute",
          top: "20%",
          left: "-100%",
          width: "200%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(0,245,118,0.2), transparent)",
          boxShadow: "0 0 20px 5px rgba(0,245,118,0.05)",
          animationDelay: "4s",
        }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${10 + i * 12}%`,
            bottom: "0",
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            background: "rgba(0,245,118,0.4)",
            borderRadius: "50%",
            animation: `bc-particle-rise ${8 + i * 2}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.015,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Corner gradient accents */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle at top right, rgba(0,245,118,0.04) 0%, transparent 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle at bottom left, rgba(0,245,118,0.03) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}

// ─── Floating Revenue Card ───────────────────────────────────────────────────
function RevenueCard({ visible }: { visible: boolean }) {
  return (
    <div
      className={`bc-card-fade ${visible ? "visible bc-float" : ""}`}
      style={{
        position: "absolute",
        top: "42%",
        left: "5%",
        background: "rgba(12, 18, 14, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px 24px",
        minWidth: "200px",
        zIndex: 20,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,245,118,0.12)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="text-white/50 text-sm font-light">Monthly Revenue</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-white text-2xl font-normal tracking-tight">$48,290</span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(0,245,118,0.12)", color: "#00f576" }}
        >
          +24%
        </span>
      </div>
    </div>
  );
}

// ─── Floating Notification Card ──────────────────────────────────────────────
function NotificationCard({ visible }: { visible: boolean }) {
  return (
    <div
      className={`bc-card-fade ${visible ? "visible bc-float" : ""}`}
      style={{
        position: "absolute",
        top: "46%",
        right: "5%",
        background: "rgba(12, 18, 14, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px 24px",
        minWidth: "200px",
        zIndex: 20,
        animationDelay: "0.5s",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,245,118,0.12)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f576" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <span className="text-white/50 text-sm font-light">New Order</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-white text-lg font-normal tracking-tight">Order #1,247</span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(0,245,118,0.12)", color: "#00f576" }}
        >
          Just now
        </span>
      </div>
    </div>
  );
}

// ─── Stats Row with IntersectionObserver ─────────────────────────────────────
function StatsRow({ visible }: { visible: boolean }) {
  const [stores, setStores] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [uptime, setUptime] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Animate stores
          const storeTarget = 12000;
          const storeStep = storeTarget / 60;
          let storeCount = 0;
          const storeInterval = setInterval(() => {
            storeCount += storeStep;
            if (storeCount >= storeTarget) {
              setStores(storeTarget);
              clearInterval(storeInterval);
            } else {
              setStores(Math.floor(storeCount));
            }
          }, 25);

          // Animate revenue
          const revenueTarget = 2.4;
          const revenueStep = revenueTarget / 60;
          let revenueCount = 0;
          const revenueInterval = setInterval(() => {
            revenueCount += revenueStep;
            if (revenueCount >= revenueTarget) {
              setRevenue(revenueTarget);
              clearInterval(revenueInterval);
            } else {
              setRevenue(Math.round(revenueCount * 10) / 10);
            }
          }, 25);

          // Animate uptime
          const uptimeTarget = 99.9;
          const uptimeStep = uptimeTarget / 50;
          let uptimeCount = 0;
          const uptimeInterval = setInterval(() => {
            uptimeCount += uptimeStep;
            if (uptimeCount >= uptimeTarget) {
              setUptime(uptimeTarget);
              clearInterval(uptimeInterval);
            } else {
              setUptime(Math.round(uptimeCount * 10) / 10);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={statsRef}
      className={`bc-fade-up ${visible ? "visible" : ""}`}
      style={{ 
        transitionDelay: "1300ms",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0",
        marginTop: "48px",
      }}
    >
      <div className="text-center px-8">
        <div className="text-white text-3xl font-light tracking-tight">{stores.toLocaleString()}+</div>
        <div className="text-white/40 text-sm font-light mt-1">Active Stores</div>
      </div>
      <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.08)" }} />
      <div className="text-center px-8">
        <div className="text-white text-3xl font-light tracking-tight">${revenue}M+</div>
        <div className="text-white/40 text-sm font-light mt-1">Processed</div>
      </div>
      <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.08)" }} />
      <div className="text-center px-8">
        <div className="text-white text-3xl font-light tracking-tight">{uptime}%</div>
        <div className="text-white/40 text-sm font-light mt-1">Uptime</div>
      </div>
    </div>
  );
}

// ─── Ticker Bar ──────────────────────────────────────────────────────────────
const tickerItems = [
  "60-Second Setup",
  "Stripe Payments",
  "Custom Domains",
  "Real-Time Analytics",
  "Global Shipping",
  "SEO Optimized",
  "No Code Required",
  "SSL Included",
];

function TickerBar() {
  const items = [...tickerItems, ...tickerItems];
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "48px",
        background: "rgba(7,9,10,0.9)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      {/* Left fade mask */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "80px",
          background: "linear-gradient(to right, #07090a, transparent)",
          zIndex: 2,
        }}
      />
      {/* Right fade mask */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "80px",
          background: "linear-gradient(to left, #07090a, transparent)",
          zIndex: 2,
        }}
      />
      
      <div className="bc-ticker-track flex items-center h-full whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 text-white/30 text-sm font-light">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00f576", opacity: 0.5 }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function HeroNavbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        zIndex: 50,
        background: "rgba(7,9,10,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "#00f576" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07090a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="text-white text-lg font-normal tracking-tight">Bytescart</span>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-10">
        {["Features", "Pricing", "Resources", "Docs"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="text-white/50 text-sm font-light hover:text-white transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </div>

      {/* Right CTA */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-white/60 text-sm font-light hover:text-white transition-colors duration-200"
        >
          Sign in
        </Link>
        <GetStartedButton />
      </div>
    </nav>
  );
}

// ─── Get Started Button with Hover Effects ──────────────────────────────────
function GetStartedButton() {
  const [hovered, setHovered] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    setShimmer(true);
    setTimeout(() => setShimmer(false), 800);
  };

  return (
    <Link
      href="/signup"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden px-5 py-2.5 rounded-full text-sm font-normal ${shimmer ? "bc-shimmer-active" : ""}`}
      style={{
        background: "#00f576",
        color: "#07090a",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        boxShadow: hovered
          ? "0 0 32px 8px rgba(0,245,118,0.25)"
          : "0 0 0 0 rgba(0,245,118,0)",
        transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out",
      }}
    >
      Get started
    </Link>
  );
}

// ─── Watch Demo Button ───────────────────────────────────────────────────────
function WatchDemoButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 text-sm font-light"
      style={{ color: hovered ? "white" : "rgba(255,255,255,0.5)" }}
    >
      <span
        className="w-10 h-10 rounded-full border flex items-center justify-center"
        style={{
          borderColor: hovered ? "rgba(0,245,118,0.4)" : "rgba(255,255,255,0.15)",
          transition: "border-color 0.2s ease-out",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.2s ease-out, color 0.2s ease-out",
            marginLeft: "2px",
          }}
        >
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      </span>
      <span style={{ transition: "color 0.2s ease-out" }}>Watch demo</span>
    </button>
  );
}

// ─── Main Hero Component ─────────────────────────────────────────────────────
const headlineWords = ["Launch", "your", "store", "in", "60", "seconds"];

export function HeroV2() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [wordsVisible, setWordsVisible] = useState<boolean[]>(new Array(headlineWords.length).fill(false));
  const [subtextVisible, setSubtextVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Badge: delay 300ms
    const badgeTimer = setTimeout(() => setBadgeVisible(true), 300);

    // Headline words: staggered 120ms between words, starting at 400ms
    const wordTimers = headlineWords.map((_, i) =>
      setTimeout(() => {
        setWordsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 400 + i * 120)
    );

    // Subtext: delay 900ms
    const subtextTimer = setTimeout(() => setSubtextVisible(true), 900);

    // CTA: delay 1100ms
    const ctaTimer = setTimeout(() => setCtaVisible(true), 1100);

    // Stats: delay 1300ms
    const statsTimer = setTimeout(() => setStatsVisible(true), 1300);

    // Cards: delay 1600ms
    const cardsTimer = setTimeout(() => setCardsVisible(true), 1600);

    return () => {
      clearTimeout(badgeTimer);
      wordTimers.forEach(clearTimeout);
      clearTimeout(subtextTimer);
      clearTimeout(ctaTimer);
      clearTimeout(statsTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      <div
        ref={heroRef}
        className="bc-hero-wrapper bc-dot-grid"
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#07090a",
          overflow: "hidden",
        }}
      >
        {/* Mouse Glow Effect - Only active in hero section */}
        <MouseGlow containerRef={heroRef} />

        {/* Animated Background Effects */}
        <AnimatedBackground />

        {/* Radial gradient behind headline */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,245,118,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        <HeroNavbar />

        {/* Floating Cards */}
        <div className="hidden lg:block">
          <RevenueCard visible={cardsVisible} />
          <NotificationCard visible={cardsVisible} />
        </div>

        {/* Main Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "120px 24px 100px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            className={`bc-badge-animate ${badgeVisible ? "visible" : ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(0,245,118,0.2)",
              background: "rgba(0,245,118,0.06)",
              marginBottom: "32px",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#00f576" }}
            />
            <span style={{ color: "#00f576", fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Now in Open Beta
            </span>
          </div>

          {/* Headline */}
          <h1
            className="bc-headline bc-headline-sweep"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.2em",
            }}
          >
            {headlineWords.map((word, i) => {
              const isGreen = word === "60" || word === "seconds";
              return (
                <span key={i} className="bc-word-wrapper">
                  <span
                    className={`bc-word ${wordsVisible[i] ? "visible" : ""} ${isGreen ? "bc-word-green" : ""} ${word === "seconds" ? "bc-word-underline" : ""}`}
                    style={{
                      transitionDelay: `${i * 120}ms`,
                      color: isGreen ? "#00f576" : "white",
                    }}
                  >
                    {word}
                  </span>
                </span>
              );
            })}
          </h1>

          {/* Subtext */}
          <p
            className={`bc-fade-up ${subtextVisible ? "visible" : ""}`}
            style={{
              maxWidth: "560px",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.45)",
              fontWeight: 300,
              marginBottom: "40px",
              transitionDelay: "900ms",
            }}
          >
            Set up your store in minutes — products, payments, shipping, and your own domain. 
            All included and ready to go. No code, no design skills, no limits.
          </p>

          {/* CTA Group */}
          <div
            className={`bc-fade-up ${ctaVisible ? "visible" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              transitionDelay: "1100ms",
            }}
          >
            <GetStartedButton />
            <WatchDemoButton />
          </div>

          {/* Stats Row */}
          <StatsRow visible={statsVisible} />
        </div>

        {/* Ticker Bar */}
        <TickerBar />
      </div>
    </>
  );
}
