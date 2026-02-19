"use client";

import { motion, useMotionValue, useTransform, animate, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Play, ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";

const typingPrompts = [
  "A minimalist sneaker store with dark mode and streetwear aesthetic...",
  "An artisanal coffee brand with earthy tones and subscription model...",
  "A pet accessories shop with playful colors and cute illustrations...",
  "A sustainable fashion marketplace with eco-friendly vibes...",
];

const buildSteps = [
  { label: "Generating store schema...", icon: "🗄️", color: "purple" },
  { label: "Building product pages...", icon: "📦", color: "blue" },
  { label: "Configuring Stripe payments...", icon: "💳", color: "green" },
  { label: "Setting up SSL & domain...", icon: "🔒", color: "amber" },
  { label: "Deploying to edge network...", icon: "🚀", color: "emerald" },
];

/* Three.js inspired depth parallax effect */
function ParallaxOrbs() {
  const { scrollY } = useScroll();
  const y1 = useSpring(useTransform(scrollY, [0, 500], [0, -100]), { stiffness: 100, damping: 30 });
  const y2 = useSpring(useTransform(scrollY, [0, 500], [0, -50]), { stiffness: 100, damping: 30 });
  const y3 = useSpring(useTransform(scrollY, [0, 500], [0, -150]), { stiffness: 100, damping: 30 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primary gradient orb */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px]"
      >
        <div className="w-full h-full bg-gradient-radial from-violet-200/60 via-blue-100/40 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Left accent orb */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/4 -left-[200px] w-[600px] h-[600px]"
      >
        <div className="w-full h-full bg-gradient-radial from-purple-300/30 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Right accent orb */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-1/3 -right-[200px] w-[800px] h-[800px]"
      >
        <div className="w-full h-full bg-gradient-radial from-blue-200/40 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-violet-400 to-blue-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* Animated counter with spring physics */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2.5,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, rounded, target]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* Typewriter effect with cursor */
function TypewriterEffect() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const prompt = typingPrompts[currentPrompt];
    
    if (!isDeleting && displayed.length < prompt.length) {
      const timeout = setTimeout(() => {
        setDisplayed(prompt.slice(0, displayed.length + 1));
      }, 40 + Math.random() * 30);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && displayed.length === prompt.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayed.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayed(displayed.slice(0, -1));
      }, 20);
      return () => clearTimeout(timeout);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentPrompt((prev) => (prev + 1) % typingPrompts.length);
    }
  }, [displayed, isDeleting, currentPrompt]);

  return (
    <div className="min-h-[60px] md:min-h-[80px] text-xs md:text-sm text-gray-600 font-mono">
      <span>{displayed}</span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-4 md:h-5 bg-violet-500 ml-1 align-middle"
      />
    </div>
  );
}

/* Build progress animation */
function BuildProgress() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (activeStep < buildSteps.length) {
      const interval = setInterval(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCompleted(true);
      const resetTimeout = setTimeout(() => {
        setActiveStep(0);
        setCompleted(false);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [activeStep]);

  return (
    <div className="space-y-3">
      {buildSteps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: i <= activeStep ? 1 : 0.3,
            x: 0,
          }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-300 ${
            i < activeStep
              ? "bg-emerald-100 text-emerald-600"
              : i === activeStep
              ? "bg-violet-100 text-violet-600"
              : "bg-gray-100 text-gray-400"
          }`}>
            {i < activeStep ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                ✓
              </motion.span>
            ) : i === activeStep ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
            ) : (
              <span className="text-[10px]">{step.icon}</span>
            )}
          </div>
          <span className={`text-xs font-mono transition-colors duration-300 ${
            i < activeStep
              ? "text-emerald-600"
              : i === activeStep
              ? "text-violet-600"
              : "text-gray-400"
          }`}>
            {step.label}
          </span>
          {i === activeStep && (
            <div className="flex-1 h-1.5 bg-violet-100 rounded-full max-w-[100px] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
                key={activeStep}
              />
            </div>
          )}
        </motion.div>
      ))}
      
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <span className="text-xs font-semibold text-emerald-700">
              Store deployed successfully!
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* Floating glassmorphism badge */
function FloatingBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay + 1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-gray-200/30"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* AI morphing store preview */
function StorefrontMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl md:rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-violet-200/30 text-sm md:text-base">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 border-b border-gray-100/60 bg-white/40">
          <div className="flex gap-1.5 md:gap-2">
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-red-400/80" />
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-amber-400/80" />
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-2 md:mx-4">
            <div className="h-7 md:h-8 rounded-lg bg-gray-100/80 flex items-center px-3 gap-2">
              <Shield className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-[10px] md:text-xs text-gray-500 font-mono truncate">bytescart.dev/your-store</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          {/* AI Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl md:rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-blue-50/80 p-4 md:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4 text-violet-500 flex-shrink-0" />
              <span className="text-[9px] md:text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
                Describe your store
              </span>
            </div>
            <TypewriterEffect />
          </motion.div>

          {/* Build Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl md:rounded-2xl border border-gray-200/60 bg-white/60 p-4 md:p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 text-violet-500 flex-shrink-0" />
              <span className="text-[9px] md:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                Building in real-time
              </span>
            </div>
            <BuildProgress />
          </motion.div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-8 md:-inset-12 bg-gradient-to-br from-violet-300/20 via-blue-200/10 to-purple-300/20 rounded-[40px] md:rounded-[48px] blur-3xl -z-10" />
      
      {/* Floating particles around mockup */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 -z-5"
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-40"
            style={{
              top: `${15 + i * 15}%`,
              left: i % 2 === 0 ? "-4%" : "104%",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-16 sm:pt-20 pb-12 sm:pb-24 overflow-hidden">
      <ParallaxOrbs />

      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 border border-violet-200/60 mb-6 sm:mb-8 text-xs sm:text-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex-shrink-0"
              />
              <span className="font-semibold text-violet-700">
                AI-Powered Ecommerce Generation
              </span>
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-violet-500 flex-shrink-0" />
            </motion.div>

            {/* Main headline - Brutalist bold typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6 sm:mb-8">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="block"
              >
                Turn one sentence
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="block"
              >
                into a live
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block"
              >
                <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]">
                  ecommerce empire.
                </span>
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Our AI builds the frontend, backend, database, payments — and deploys your complete store in <span className="text-gray-900 font-semibold">60 seconds</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_100%] text-white font-bold text-sm sm:text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all duration-500 animate-[gradient_4s_ease-in-out_infinite] w-full sm:w-auto"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden xs:inline">Generate My Store</span>
                <span className="sm:hidden">Generate Store</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>

              <a
                href="#demo"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm sm:text-base bg-white/60 backdrop-blur-xl hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors flex-shrink-0">
                  <Play className="w-3 sm:w-4 h-3 sm:h-4 text-violet-600 ml-0.5" fill="currentColor" />
                </span>
                <span className="hidden xs:inline">Watch Demo</span>
                <span className="sm:hidden">Demo</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-gray-200/60"
            >
              {[
                { value: 12000, suffix: "+", label: "Stores Created" },
                { value: 60, suffix: "s", label: "Avg Build Time" },
                { value: 99, suffix: "%", label: "Uptime" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-1 font-medium line-clamp-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mt-8 sm:mt-12 lg:mt-0 lg:block"
          >
            {/* Floating badges - Hidden on mobile, shown on lg */}
            <FloatingBadge className="absolute -left-10 top-10 z-20 hidden lg:block" delay={0}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">SSL Active</p>
                  <p className="text-[10px] text-gray-500">256-bit encryption</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -right-6 top-1/4 z-20 hidden lg:block" delay={0.5}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">98/100</p>
                  <p className="text-[10px] text-gray-500">Lighthouse Score</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -left-6 bottom-20 z-20 hidden lg:block" delay={1}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Edge Deployed</p>
                  <p className="text-[10px] text-gray-500">200+ locations</p>
                </div>
              </div>
            </FloatingBadge>

            <StorefrontMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

