"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { Comparison } from "./comparison";
import { HowItWorks } from "./how-it-works";
import { MorphingUI } from "./morphing-ui";
import { Features } from "./features";
import { LivePreview } from "./live-preview";
import { Pricing } from "./pricing";
import { Testimonials } from "./testimonials";
import { FAQ } from "./faq";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D2B1F] text-[#F5F0E8] overflow-x-hidden selection:bg-[#D4873A]/30">
      {/* Subtle dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #2E5C40 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient gradient glow - forest/amber */}
      <div className="fixed top-0 left-0 right-0 h-[800px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#122E22]/80 via-[#0D2B1F]/60 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4873A]/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-[#2E5C40]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Comparison />
        <HowItWorks />
        <MorphingUI />
        <Features />
        <LivePreview />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
