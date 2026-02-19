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
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-violet-400 to-blue-400"
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
  const [activeTab, setActiveTab] = useState<'design' | 'products' | 'settings'>('design');

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl md:rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-violet-200/30">
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
              <span className="text-[10px] md:text-xs text-gray-500 font-mono truncate">dashboard.bytescart.dev</span>
            </div>
          </div>
        </div>

        {/* Dashboard header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100/60 bg-gradient-to-r from-white to-violet-50/30">
          <div className="flex items-center gap-2">
            <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-3.5 md:w-4 h-3.5 md:w-4 text-white" />
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-900">Bytescart Dashboard</span>
          </div>
          <div className="w-6 md:w-7 h-6 md:h-7 rounded-full bg-violet-200 flex items-center justify-center text-xs md:text-sm font-semibold text-violet-600">
            JD
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col w-32 md:w-40 border-r border-gray-100/60 bg-gray-50/40 p-3 md:p-4 gap-2">
            {[
              { icon: Palette, label: 'Design', tab: 'design' },
              { icon: Package, label: 'Products', tab: 'products' },
              { icon: Settings, label: 'Settings', tab: 'settings' },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab as any)}
                className={`flex items-center gap-2 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === item.tab
                    ? 'bg-white text-violet-600 border border-violet-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-3.5 md:w-4 h-3.5 md:h-4 flex-shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-3 md:p-5 space-y-3 md:space-y-4">
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
                    <p className="text-[10px] md:text-xs font-semibold text-gray-600 mb-2">Brand Colors</p>
                    <div className="flex gap-2">
                      {[
                        { color: 'bg-violet-500', name: 'Violet' },
                        { color: 'bg-blue-500', name: 'Blue' },
                        { color: 'bg-emerald-500', name: 'Green' },
                        { color: 'bg-amber-500', name: 'Amber' },
                      ].map((c) => (
                        <motion.button
                          key={c.name}
                          whileHover={{ scale: 1.1 }}
                          className={`w-6 md:w-7 h-6 md:h-7 rounded-lg ${c.color} shadow-md cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-gray-600 mb-2">Typography</p>
                    <div className="space-y-1.5 md:space-y-2">
                      {['Heading Font', 'Body Font'].map((item) => (
                        <div
                          key={item}
                          className="px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-white border border-gray-100 text-[10px] md:text-xs text-gray-700"
                        >
                          {item}: Inter
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-gray-600 mb-2">Layout</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Grid', 'Carousel', 'List', 'Featured'].map((layout) => (
                        <button
                          key={layout}
                          className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-[9px] md:text-xs bg-violet-50 text-violet-600 border border-violet-200 font-medium hover:bg-violet-100 transition-colors"
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
                      className="flex items-center justify-between px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-[9px] md:text-[10px] text-violet-600">{product.price}</p>
                      </div>
                      <span className={`text-xs ${product.status === '✓' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {product.status}
                      </span>
                    </motion.div>
                  ))}
                  <button className="w-full px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-[9px] md:text-xs bg-violet-100 text-violet-600 font-semibold hover:bg-violet-200 transition-colors">
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
                      className="px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-white border border-gray-100"
                    >
                      <p className="text-[9px] md:text-[10px] text-gray-600 font-medium">{setting.label}</p>
                      <p className="text-[10px] md:text-xs text-gray-900 font-semibold">{setting.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 border-t border-gray-100/60 bg-gradient-to-r from-violet-50/30 to-blue-50/30">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] md:text-xs text-gray-600">Live preview updating...</span>
          </div>
          <button className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-[9px] md:text-xs font-semibold hover:shadow-lg transition-shadow">
            Publish
          </button>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-8 md:-inset-12 bg-gradient-to-br from-violet-300/20 via-blue-200/10 to-purple-300/20 rounded-[40px] md:rounded-[48px] blur-3xl -z-10" />
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen lg:h-screen flex items-center pt-16 sm:pt-20 lg:pt-16 pb-12 sm:pb-24 lg:pb-12 overflow-hidden">
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
            {/* Main headline - Brutalist bold typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl 2xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-4 sm:mb-6 lg:mb-5">
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
              className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl text-gray-500 leading-relaxed mb-6 sm:mb-8 lg:mb-6 max-w-xl mx-auto lg:mx-0"
            >
              Our AI builds the frontend, backend, database, payments — and deploys your complete store in <span className="text-gray-900 font-semibold">60 seconds</span>.
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
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_100%] text-white font-bold text-sm sm:text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all duration-500 animate-[gradient_4s_ease-in-out_infinite]"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Generate My Store</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
              </Link>

              <a
                href="#demo"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm sm:text-base bg-white/60 backdrop-blur-xl hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all duration-300"
              >
                <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors flex-shrink-0">
                  <Play className="w-3 sm:w-4 h-3 sm:h-4 text-violet-600 ml-0.5" fill="currentColor" />
                </span>
                <span>Watch Demo</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 lg:mt-8 pt-6 sm:pt-8 lg:pt-6 border-t border-gray-200/60"
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
            className="relative mt-8 sm:mt-12 lg:mt-0 lg:block lg:max-h-[calc(100vh-8rem)] lg:flex lg:items-center lg:justify-center"
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

