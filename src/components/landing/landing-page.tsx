"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { TrustBar } from "./trust-bar";
import { HowItWorks } from "./how-it-works";
import { Features } from "./features";
import { LivePreview } from "./live-preview";
import { Pricing } from "./pricing";
import { Testimonials } from "./testimonials";
import { FAQ } from "./faq";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFF] text-gray-900 overflow-x-hidden selection:bg-purple-200">
      {/* Subtle dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #d4d4d8 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top gradient wash */}
      <div className="fixed top-0 left-0 right-0 h-[700px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/50 via-blue-50/30 to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Features />
        <LivePreview />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
