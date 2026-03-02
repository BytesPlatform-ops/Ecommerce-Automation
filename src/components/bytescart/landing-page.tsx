"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CursorEffect } from "./cursor-effect";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { HeroV2 } from "./hero-v2";
import { Hero as LandingHero } from "../landing/hero";
import { DashboardPreview } from "./dashboard-preview";
// import { DbSchema } from "./db-schema";
import { Comparison } from "./comparison";
import { ProcessSteps } from "./process-steps";
import { LivePreview } from "./live-preview";
import { Pricing } from "./pricing";
import { FAQ } from "./faq";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

gsap.registerPlugin(ScrollTrigger);

export function BytescartLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // White → Dark transition starting at FAQ
      ScrollTrigger.create({
        trigger: ".bc-dark-return",
        start: "top 70%",
        end: "top 20%",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          const container = containerRef.current;
          const content = contentRef.current;
          if (!container || !content) return;

          const r = Math.round(255 - (255 - 11) * p);
          const g = Math.round(255 - (255 - 15) * p);
          const b = Math.round(255 - (255 - 20) * p);
          container.style.backgroundColor = `rgb(${r},${g},${b})`;

          const tr = Math.round(17 + (255 - 17) * p);
          const tg = Math.round(24 + (255 - 24) * p);
          const tb = Math.round(39 + (255 - 39) * p);
          content.style.color = `rgb(${tr},${tg},${tb})`;
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden selection:bg-[#00FF88]/20"
      style={{ backgroundColor: "#ffffff", fontFamily: "var(--font-inter), system-ui, sans-serif", transition: "background-color 0.05s linear" }}
    >
      <CursorEffect />
      <Navbar />

      <div ref={contentRef} className="relative z-10 text-[#111827]" style={{ transition: "color 0.05s linear" }}>
        <LandingHero />
        {/* <HeroV2 /> */}
        {/* <Hero /> */}

        <DashboardPreview />
        {/* <DbSchema /> */}
        <Comparison />
        <ProcessSteps />
        <LivePreview />
        <Pricing />
        <FAQ />

        {/* DARK TRANSITION TRIGGER */}
        <div className="bc-dark-return" />

        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
