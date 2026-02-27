"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CursorEffect } from "./cursor-effect";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { Stats } from "./stats";
import { DashboardPreview } from "./dashboard-preview";
// import { DbSchema } from "./db-schema";
import { Comparison } from "./comparison";
import { ProcessSteps } from "./process-steps";
import { LivePreview } from "./live-preview";
import { Pricing } from "./pricing";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

gsap.registerPlugin(ScrollTrigger);

export function BytescartLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // === BACKGROUND COLOR INVERSION ===
      // Dark → Light transition after hero
      ScrollTrigger.create({
        trigger: ".bc-inversion-start",
        start: "top 40%",
        end: "top 10%",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          const container = containerRef.current;
          const main = mainRef.current;
          if (!container || !main) return;

          // Interpolate background color
          const r = Math.round(11 + (248 - 11) * p);
          const g = Math.round(15 + (250 - 15) * p);
          const b = Math.round(20 + (252 - 20) * p);
          container.style.backgroundColor = `rgb(${r},${g},${b})`;

          // Interpolate text color
          const tr = Math.round(255 - (255 - 17) * p);
          const tg = Math.round(255 - (255 - 24) * p);
          const tb = Math.round(255 - (255 - 39) * p);
          main.style.color = `rgb(${tr},${tg},${tb})`;
        },
      });

      // === RETURN TO DARK for Final CTA ===
      ScrollTrigger.create({
        trigger: ".bc-dark-return",
        start: "top 60%",
        end: "top 20%",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          const container = containerRef.current;
          const main = mainRef.current;
          if (!container || !main) return;

          const r = Math.round(248 - (248 - 11) * p);
          const g = Math.round(250 - (250 - 15) * p);
          const b = Math.round(252 - (252 - 20) * p);
          container.style.backgroundColor = `rgb(${r},${g},${b})`;

          const tr = Math.round(17 + (255 - 17) * p);
          const tg = Math.round(24 + (255 - 24) * p);
          const tb = Math.round(39 + (255 - 39) * p);
          main.style.color = `rgb(${tr},${tg},${tb})`;
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden selection:bg-[#00FF88]/20"
      style={{
        backgroundColor: "#0B0F14",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        transition: "background-color 0.05s linear",
      }}
    >
      <CursorEffect />
      <Navbar />

      <div ref={mainRef} className="relative z-10 text-white" style={{ transition: "color 0.05s linear" }}>
        {/* DARK SECTION — Hero area */}
        <Hero />
        <Stats />

        {/* INVERSION TRIGGER */}
        <div className="bc-inversion-start" />

        {/* LIGHT SECTION — Main content */}
        <DashboardPreview />
        {/* <DbSchema /> */}
        <Comparison />
        <ProcessSteps />
        <LivePreview />
        <Pricing />

        {/* RETURN TO DARK TRIGGER */}
        <div className="bc-dark-return" />

        {/* DARK SECTION — Final CTA */}
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
