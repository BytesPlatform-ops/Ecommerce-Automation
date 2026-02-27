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
      {/* Primary gradient orb - Forest green */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#1A5C3E]/40 via-[#0D2B1F]/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Left accent orb - Deep green */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/4 -left-[200px] w-[600px] h-[600px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#2E5C40]/30 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Right accent orb - Amber glow */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-1/3 -right-[200px] w-[800px] h-[800px]"
      >
        <div className="w-full h-full bg-gradient-radial from-[#D4873A]/15 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Floating particles - Amber/Gold */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-[#D4873A] to-[#C9A84C]"
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
    <div className="min-h-[60px] md:min-h-[80px] text-xs md:text-sm text-[#8FA898] font-mono">
      <span>{displayed}</span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-4 md:h-5 bg-[#D4873A] ml-1 align-middle"
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
              ? "bg-[#2E5C40] text-[#F5F0E8]"
              : i === activeStep
              ? "bg-[#D4873A]/20 text-[#D4873A]"
              : "bg-[#1A3D2B]/30 text-[#8FA898]"
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
              ? "text-[#2E5C40]"
              : i === activeStep
              ? "text-[#D4873A]"
              : "text-[#8FA898]"
          }`}>
            {step.label}
          </span>
          {i === activeStep && (
            <div className="flex-1 h-1.5 bg-[#D4873A]/20 rounded-full max-w-[100px] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4873A] to-[#C9A84C] rounded-full"
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
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#2E5C40]/20 to-[#1A5C3E]/20 border border-[#2E5C40]"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="w-2 h-2 rounded-full bg-[#2E5C40]"
            />
            <span className="text-xs font-semibold text-[#1A3D2B]">
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
        className="px-4 py-3 rounded-2xl bg-[#F5F0E8]/90 backdrop-blur-2xl border border-[#2E5C40]/20 shadow-xl shadow-[#0D2B1F]/10"
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
      <div className="relative rounded-xl md:rounded-2xl border border-[#2E5C40]/30 bg-[#F5F0E8]/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-[#0D2B1F]/20">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-2 md:px-4 py-2 md:py-3 border-b border-[#2E5C40]/20 bg-[#0D2B1F]">
          <div className="flex gap-1 md:gap-1.5">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#D4873A]/80" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#2E5C40]/80" />
          </div>
          <div className="flex-1 mx-1 md:mx-3">
            <div className="h-6 md:h-7 rounded-lg bg-[#122E22] flex items-center px-2 md:px-3 gap-1.5">
              <Shield className="w-2 md:w-3 h-2 md:h-3 text-[#2E5C40] flex-shrink-0" />
              <span className="text-[8px] md:text-xs text-[#8FA898] font-mono truncate">dashboard.bytescart.dev</span>
            </div>
          </div>
        </div>

        {/* Dashboard header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-[#2E5C40]/20 bg-gradient-to-r from-[#F5F0E8] to-[#F5F0E8]/80">
          <div className="flex items-center gap-2">
            <div className="w-6 md:w-7 h-6 md:h-7 rounded-lg bg-gradient-to-br from-[#D4873A] to-[#C9A84C] flex items-center justify-center">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#0D2B1F]" />
            </div>
            <span className="text-[10px] md:text-sm font-bold text-[#1A3D2B]">Bytescart Dashboard</span>
          </div>
          <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-[#D4873A]/20 flex items-center justify-center text-[9px] md:text-xs font-semibold text-[#D4873A]">
            JD
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col w-28 md:w-36 border-r border-[#2E5C40]/20 bg-[#F5F0E8]/60 p-2 md:p-3 gap-1">
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
                    ? 'bg-[#F5F0E8] text-[#D4873A] border border-[#D4873A]/30'
                    : 'text-[#1A3D2B] hover:text-[#D4873A]'
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
                    <p className="text-[9px] md:text-xs font-semibold text-[#1A3D2B] mb-1.5">Brand Colors</p>
                    <div className="flex gap-1.5">
                      {[
                        { color: 'bg-[#0D2B1F]', name: 'Forest' },
                        { color: 'bg-[#2E5C40]', name: 'Green' },
                        { color: 'bg-[#D4873A]', name: 'Amber' },
                        { color: 'bg-[#C9A84C]', name: 'Gold' },
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
                    <p className="text-[9px] md:text-xs font-semibold text-[#1A3D2B] mb-1.5">Typography</p>
                    <div className="space-y-1 md:space-y-1.5">
                      {['Heading Font', 'Body Font'].map((item) => (
                        <div
                          key={item}
                          className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-white border border-[#2E5C40]/20 text-[9px] md:text-xs text-[#1A3D2B]"
                        >
                          {item}: DM Sans
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] md:text-xs font-semibold text-[#1A3D2B] mb-1.5">Layout</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Grid', 'Carousel', 'List', 'Featured'].map((layout) => (
                        <button
                          key={layout}
                          className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[8px] md:text-xs bg-[#D4873A]/10 text-[#D4873A] border border-[#D4873A]/30 font-medium hover:bg-[#D4873A]/20 transition-colors"
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
                      className="flex items-center justify-between px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-white border border-[#2E5C40]/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] md:text-xs font-medium text-[#1A3D2B] truncate">{product.name}</p>
                        <p className="text-[8px] md:text-[9px] text-[#D4873A]">{product.price}</p>
                      </div>
                      <span className={`text-xs ${product.status === '✓' ? 'text-[#2E5C40]' : 'text-[#8FA898]'}`}>
                        {product.status}
                      </span>
                    </motion.div>
                  ))}
                  <button className="w-full px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[8px] md:text-xs bg-[#D4873A]/10 text-[#D4873A] font-semibold hover:bg-[#D4873A]/20 transition-colors">
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
                      className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg bg-white border border-[#2E5C40]/20"
                    >
                      <p className="text-[8px] md:text-[9px] text-[#8FA898] font-medium">{setting.label}</p>
                      <p className="text-[9px] md:text-xs text-[#1A3D2B] font-semibold">{setting.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-2 md:px-4 py-2 border-t border-[#2E5C40]/20 bg-gradient-to-r from-[#F5F0E8] to-[#F5F0E8]/80">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#2E5C40] animate-pulse" />
            <span className="text-[8px] md:text-xs text-[#8FA898]">Live preview updating...</span>
          </div>
          <button className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-gradient-to-r from-[#D4873A] to-[#C9A84C] text-[#0D2B1F] text-[8px] md:text-xs font-semibold hover:shadow-lg transition-shadow">
            Publish
          </button>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-6 md:-inset-10 bg-gradient-to-br from-[#2E5C40]/20 via-[#0D2B1F]/10 to-[#D4873A]/10 rounded-[40px] md:rounded-[48px] blur-3xl -z-10" />
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen lg:h-screen flex items-center pt-24 sm:pt-28 lg:pt-16 pb-12 sm:pb-24 lg:pb-12 overflow-hidden bg-[#0D2B1F]">
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
            <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-[#F5F0E8] leading-[1.1] tracking-tight mb-6 sm:mb-6 lg:mb-5">
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
                <span className="bg-gradient-to-r from-[#D4873A] via-[#C9A84C] to-[#D4873A] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]">
                  ecommerce empire.
                </span>
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="text-base sm:text-base md:text-lg lg:text-base xl:text-lg text-[#8FA898] leading-relaxed mb-8 sm:mb-8 lg:mb-6 max-w-xl mx-auto lg:mx-0"
            >
              Our AI builds the frontend, backend, database, payments — and deploys your complete store in <span className="text-[#F5F0E8] font-semibold">60 seconds</span>.
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
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#D4873A] text-[#0D2B1F] font-bold text-sm sm:text-base shadow-2xl shadow-[#D4873A]/30 hover:bg-[#E8A04F] hover:shadow-[#D4873A]/50 hover:-translate-y-1 transition-all duration-500"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Generate My Store</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#D4873A] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>

              <a
                href="#demo"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-[#F5F0E8]/30 text-[#F5F0E8] font-semibold text-sm sm:text-base bg-transparent hover:border-[#F5F0E8] hover:bg-[#F5F0E8]/10 transition-all duration-300"
              >
                <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-[#D4873A]/20 flex items-center justify-center group-hover:bg-[#D4873A]/30 transition-colors flex-shrink-0">
                  <Play className="w-3 sm:w-4 h-3 sm:h-4 text-[#D4873A] ml-0.5" fill="currentColor" />
                </span>
                <span>Watch Demo</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-10 lg:mt-8 pt-8 sm:pt-8 lg:pt-6 border-t border-[#2E5C40]/40"
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
                  <p className="text-3xl sm:text-3xl md:text-4xl font-black text-[#D4873A]">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs sm:text-xs md:text-sm text-[#8FA898] mt-2 font-medium line-clamp-2">{stat.label}</p>
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
                <div className="w-8 h-8 rounded-lg bg-[#2E5C40]/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#2E5C40]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A3D2B]">SSL Active</p>
                  <p className="text-[10px] text-[#8FA898]">256-bit encryption</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -right-6 top-1/4 z-20 hidden lg:block" delay={0.5}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4873A]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#D4873A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A3D2B]">98/100</p>
                  <p className="text-[10px] text-[#8FA898]">Lighthouse Score</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -left-6 bottom-20 z-20 hidden lg:block" delay={1}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A3D2B]">Edge Deployed</p>
                  <p className="text-[10px] text-[#8FA898]">200+ locations</p>
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

