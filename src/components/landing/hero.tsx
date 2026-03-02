"use client";

import { motion, useMotionValue, useTransform, animate, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Play, ArrowRight, Sparkles, Zap, Shield, Globe, Palette, Package, Settings } from "lucide-react";

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

  const [particles, setParticles] = useState<Array<{left: string; top: string; opacity: number; duration: number; delay: number}>>([]);

  useEffect(() => {
    // Generate particles only on client to avoid hydration mismatch
    const generatedParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: 0.3 + Math.random() * 0.4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primary gradient orb - Subtle green */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#10B981]/15 via-[#F8FAFC]/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Left accent orb - Blue tint */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/4 -left-[200px] w-[600px] h-[600px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Right accent orb - Purple tint */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-1/3 -right-[200px] w-[800px] h-[800px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#8B5CF6]/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Floating particles - Multi-color */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-[#10B981] to-[#3B82F6]"
          style={{
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [particle.opacity * 0.5, particle.opacity + 0.3, particle.opacity * 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
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
    <div className="min-h-[60px] md:min-h-[80px] text-xs md:text-sm text-[#6B7280] font-mono">
      <span>{displayed}</span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-4 md:h-5 bg-[#059669] ml-1 align-middle"
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
              ? "bg-[#059669] text-white"
              : i === activeStep
              ? "bg-[#059669]/20 text-[#059669]"
              : "bg-gray-200 text-gray-400"
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
              ? "text-[#059669]"
              : i === activeStep
              ? "text-[#059669]"
              : "text-gray-400"
          }`}>
            {step.label}
          </span>
          {i === activeStep && (
            <div className="flex-1 h-1.5 bg-[#059669]/20 rounded-full max-w-[100px] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] rounded-full"
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
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#059669]/10 to-[#10B981]/10 border border-[#059669]"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="w-2 h-2 rounded-full bg-[#059669]"
            />
            <span className="text-xs font-semibold text-[#059669]">
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
        className="px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-gray-200 shadow-xl shadow-gray-200/50"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* AI morphing store preview */
function StorefrontMockup() {
  const [activeTab, setActiveTab] = useState<'design' | 'products' | 'settings'>('design');

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      {/* Glassmorphism container */}
      <div className="relative rounded-xl md:rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xl shadow-gray-300/40">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 bg-[#1F2937]">
          <div className="flex gap-1 md:gap-1.5">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#EF4444]" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#F59E0B]" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="flex-1 mx-1 md:mx-3">
            <div className="h-6 md:h-7 rounded-lg bg-[#374151] flex items-center px-2 md:px-3 gap-1.5">
              <Shield className="w-2 md:w-3 h-2 md:h-3 text-[#10B981] flex-shrink-0" />
              <span className="text-[8px] md:text-xs text-gray-400 font-mono truncate">dashboard.bytescart.dev</span>
            </div>
          </div>
        </div>

        {/* Dashboard header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 md:w-7 h-6 md:h-7 rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" />
            </div>
            <span className="text-[10px] md:text-sm font-bold text-[#111827]">Bytescart Dashboard</span>
          </div>
          <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-[9px] md:text-xs font-semibold text-white">
            JD
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col w-28 md:w-36 border-r border-gray-100 bg-gray-50/80 p-2 md:p-3 gap-1">
            {[
              { icon: Palette, label: 'Design', tab: 'design' },
              { icon: Package, label: 'Products', tab: 'products' },
              { icon: Settings, label: 'Settings', tab: 'settings' },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab as any)}
                className={`flex items-center gap-2 px-2 md:px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === item.tab
                    ? 'bg-white text-[#059669] border border-[#059669]/30 shadow-sm'
                    : 'text-gray-600 hover:text-[#059669]'
                }`}
              >
                <item.icon className="w-3.5 md:w-4 h-3.5 md:h-4 flex-shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-2 md:p-4 space-y-2 md:space-y-3">
            <AnimatePresence mode="wait">
              {activeTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 md:space-y-4"
                >
                  <div>
                    <p className="text-[9px] md:text-xs font-semibold text-[#111827] mb-1.5">Brand Colors</p>
                    <div className="flex gap-1.5">
                      {[
                        { color: 'bg-[#059669]', name: 'Green' },
                        { color: 'bg-[#3B82F6]', name: 'Blue' },
                        { color: 'bg-[#8B5CF6]', name: 'Purple' },
                        { color: 'bg-[#F59E0B]', name: 'Amber' },
                      ].map((c) => (
                        <motion.button
                          key={c.name}
                          whileHover={{ scale: 1.1 }}
                          className={`w-5 md:w-6 h-5 md:h-6 rounded-lg ${c.color} shadow-md cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] md:text-xs font-semibold text-[#111827] mb-1.5">Typography</p>
                    <div className="space-y-1 md:space-y-1.5">
                      {['Heading Font', 'Body Font'].map((item) => (
                        <div
                          key={item}
                          className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[9px] md:text-xs text-[#374151]"
                        >
                          {item}: DM Sans
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] md:text-xs font-semibold text-[#111827] mb-1.5">Layout</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Grid', 'Carousel', 'List', 'Featured'].map((layout) => (
                        <button
                          key={layout}
                          className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[8px] md:text-xs bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 font-medium hover:bg-[#3B82F6]/20 transition-colors"
                        >
                          {layout}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 md:space-y-3"
                >
                  {[
                    { name: 'Sneaker Max Pro', price: '$189', status: '✓' },
                    { name: 'Urban Hoodie', price: '$89', status: '✓' },
                    { name: 'Classic Runner', price: '$149', status: '○' },
                  ].map((product, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] md:text-xs font-medium text-[#111827] truncate">{product.name}</p>
                        <p className="text-[8px] md:text-[9px] text-[#059669]">{product.price}</p>
                      </div>
                      <span className={`text-xs ${product.status === '✓' ? 'text-[#059669]' : 'text-gray-400'}`}>
                        {product.status}
                      </span>
                    </motion.div>
                  ))}
                  <button className="w-full px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[8px] md:text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] font-semibold hover:bg-[#8B5CF6]/20 transition-colors">
                    + Add Product
                  </button>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 md:space-y-3"
                >
                  {[
                    { label: 'Store Name', value: 'My Store' },
                    { label: 'Email', value: 'owner@store.ai' },
                    { label: 'Domain', value: 'mystore.com' },
                  ].map((setting, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-medium">{setting.label}</p>
                      <p className="text-[9px] md:text-xs text-[#111827] font-semibold">{setting.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-2 md:px-4 py-2 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[8px] md:text-xs text-gray-500">Live preview updating...</span>
          </div>
          <button className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-[8px] md:text-xs font-semibold hover:shadow-lg transition-shadow">
            Publish
          </button>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-6 md:-inset-10 bg-gradient-to-br from-[#059669]/10 via-[#3B82F6]/5 to-[#8B5CF6]/10 rounded-[40px] md:rounded-[48px] blur-3xl -z-10" />
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen lg:h-screen flex items-center pt-24 sm:pt-28 lg:pt-36 pb-12 sm:pb-24 lg:pb-24 overflow-hidden bg-[#F8FAFC]">
      <ParallaxOrbs />

      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            {/* Main headline - Elegant serif typography */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-[#111827] leading-[1.1] tracking-tight mb-6 sm:mb-6 lg:mb-5">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="block"
              >
                Turn one idea
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
                <span className="bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]">
                  ecommerce empire.
                </span>
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="text-base sm:text-base md:text-lg lg:text-base xl:text-lg text-[#6B7280] leading-relaxed mb-8 sm:mb-8 lg:mb-6 max-w-xl mx-auto lg:mx-0"
            >
              Our AI builds the frontend, backend, database, payments — and deploys your complete store in <span className="text-[#111827] font-semibold">60 seconds</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#059669] text-white font-bold text-sm sm:text-base shadow-2xl shadow-[#059669]/30 hover:bg-[#047857] hover:shadow-[#059669]/50 hover:-translate-y-1 transition-all duration-500"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Start Building Free</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#059669] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>

              <a
                href="#demo"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-[#E5E7EB] text-[#374151] font-semibold text-sm sm:text-base bg-white hover:border-[#059669] hover:bg-[#059669]/5 transition-all duration-300"
              >
                <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-[#059669]/10 flex items-center justify-center group-hover:bg-[#059669]/20 transition-colors flex-shrink-0">
                  <Play className="w-3 sm:w-4 h-3 sm:h-4 text-[#059669] ml-0.5" fill="currentColor" />
                </span>
                <span>Watch Demo</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-10 lg:mt-8 pt-8 sm:pt-8 lg:pt-6 border-t border-[#E5E7EB]"
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
                  <p className="text-3xl sm:text-3xl md:text-4xl font-black text-[#059669]">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs sm:text-xs md:text-sm text-[#6B7280] mt-2 font-medium line-clamp-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mt-8 sm:mt-12 lg:mt-0 lg:block lg:max-h-[calc(100vh-8rem)] lg:flex lg:items-center lg:justify-center"
          >
            {/* Floating badges - Hidden on mobile, shown on lg */}
            <FloatingBadge className="absolute -left-10 top-10 z-20 hidden lg:block" delay={0}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#059669]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">SSL Active</p>
                  <p className="text-[10px] text-gray-500">256-bit encryption</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -right-6 top-1/4 z-20 hidden lg:block" delay={0.5}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">98/100</p>
                  <p className="text-[10px] text-gray-500">Lighthouse Score</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -left-6 bottom-20 z-20 hidden lg:block" delay={1}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">Edge Deployed</p>
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

