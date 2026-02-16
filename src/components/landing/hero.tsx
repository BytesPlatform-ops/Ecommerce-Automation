"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const buildSteps = [
  { label: "Creating database schema...", icon: "🗄️" },
  { label: "Generating product pages...", icon: "📦" },
  { label: "Setting up payments...", icon: "💳" },
  { label: "Configuring domain & SSL...", icon: "🔒" },
  { label: "Deploying to the edge...", icon: "🚀" },
];

const typingText = "A modern sneaker store with streetwear vibes, dark theme, and curated collections for Gen Z...";

/* Floating particle orbs */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 200 + i * 80,
            height: 200 + i * 80,
            background: i % 2 === 0
              ? "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
            left: `${10 + i * 15}%`,
            top: `${5 + (i % 3) * 25}%`,
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* Animated counter */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, rounded, target]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}

function TypingAnimation() {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < typingText.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + typingText[index]);
        setIndex(index + 1);
      }, 30 + Math.random() * 20);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayed("");
        setIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index]);

  return (
    <span className="text-gray-700 text-sm">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-purple-500 font-medium"
      >
        |
      </motion.span>
    </span>
  );
}

function BuildProgress() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % buildSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2.5">
      {buildSteps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: i <= activeStep ? 1 : 0.3,
            x: 0,
          }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className={`flex items-center gap-3 text-xs font-mono ${
            i < activeStep
              ? "text-emerald-600"
              : i === activeStep
              ? "text-purple-600"
              : "text-gray-300"
          }`}
        >
          <span className="w-5 text-center">
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
                className="inline-block"
              >
                ⟳
              </motion.span>
            ) : (
              step.icon
            )}
          </span>
          <span>{step.label}</span>
          {i === activeStep && (
            <div className="h-1.5 bg-purple-100 rounded-full flex-1 max-w-[80px] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                key={activeStep}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* Stats badges floating near hero */
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
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay + 0.8, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        className="px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-gray-200/40"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
      <FloatingOrbs />

      {/* Radial gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-purple-200/40 via-blue-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-blue-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-[-5%] w-[300px] h-[300px] bg-gradient-to-r from-purple-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[1280px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50/80 backdrop-blur-sm mb-8"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
              <span className="text-xs text-purple-700 font-medium">
                AI-Powered Store Generation
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold text-gray-900 leading-[1.06] tracking-tight mb-7">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="block"
              >
                Turn an idea into
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="block"
              >
                a live ecommerce
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="block"
              >
                website{" "}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_3s_ease-in-out_infinite]">
                  in 60 seconds
                </span>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg"
            >
              Describe your store and the platform builds the frontend, backend,
              database, payments and deploys it automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Generate My Store</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  whileHover={{ x: 3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
              </Link>
              <a
                href="#live-preview"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm bg-white/60 backdrop-blur-sm hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50/50 transition-all duration-300"
              >
                <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-3 h-3 text-purple-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                View Demo
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200/60"
            >
              {[
                { value: 12000, suffix: "+", label: "Stores created" },
                { value: 60, suffix: "s", label: "Avg. build time" },
                { value: 99, suffix: "%", label: "Uptime" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Animated mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block"
          >
            {/* Floating badges */}
            <FloatingBadge className="absolute -left-8 top-8 z-20" delay={0}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-gray-700">SSL Active</span>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -right-4 top-1/3 z-20" delay={0.5}>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">98/100</p>
                  <p className="text-[10px] text-gray-400">Lighthouse</p>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="absolute -left-4 bottom-16 z-20" delay={1}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <span className="text-xs font-semibold text-gray-700">Store is live!</span>
              </div>
            </FloatingBadge>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl border border-gray-200/80 bg-white/70 backdrop-blur-xl overflow-hidden shadow-2xl shadow-gray-300/30"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-7 rounded-lg bg-gray-100 flex items-center px-3">
                    <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[11px] text-gray-400 font-mono">chameleon.dev/generate</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Input area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl border border-gray-200 bg-gray-50/80 p-4"
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">Describe your store</p>
                  <div className="min-h-[60px]">
                    <TypingAnimation />
                  </div>
                </motion.div>

                {/* Build progress */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="rounded-xl border border-gray-200 bg-gray-50/80 p-4"
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 font-semibold">Building your store</p>
                  <BuildProgress />
                </motion.div>

                {/* Output preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <motion.div
                    animate={{
                      borderColor: ["rgba(147,51,234,0.2)", "rgba(59,130,246,0.3)", "rgba(147,51,234,0.2)"],
                      boxShadow: [
                        "0 0 0 0 rgba(147,51,234,0)",
                        "0 0 20px 0 rgba(147,51,234,0.08)",
                        "0 0 0 0 rgba(147,51,234,0)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="rounded-xl border border-purple-200 bg-purple-50/50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-emerald-500"
                      />
                      <span className="text-[10px] text-emerald-600 font-semibold">Live — deployed successfully</span>
                    </div>
                    <div className="h-3 w-3/4 bg-purple-200/50 rounded-full mb-2" />
                    <div className="h-3 w-1/2 bg-purple-100/50 rounded-full" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Soft glow behind card */}
            <div className="absolute -inset-8 bg-gradient-to-br from-purple-200/30 via-blue-200/20 to-purple-200/30 rounded-3xl blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
