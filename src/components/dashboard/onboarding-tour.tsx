"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Rocket } from "lucide-react";

const TOUR_STEPS = [
  {
    target: "dashboard",
    title: "Your Dashboard",
    description:
      "This is your command center. View your store's performance, recent orders, and key metrics at a glance.",
    icon: "📊",
  },
  {
    target: "products",
    title: "Manage Products",
    description:
      "Add and manage your products here. Create listings with images, descriptions, pricing, and variants.",
    icon: "📦",
  },
  {
    target: "categories",
    title: "Organize Categories",
    description:
      "Group your products into categories so customers can easily browse and find what they need.",
    icon: "🏷️",
  },
  {
    target: "themes",
    title: "Customize Your Theme",
    description:
      "Make your store uniquely yours. Choose colors, fonts, and styles that match your brand.",
    icon: "🎨",
  },
  {
    target: "payments",
    title: "Set Up Payments",
    description:
      "Connect Stripe to start accepting payments. This is required before you can receive orders.",
    icon: "💳",
  },
  {
    target: "settings",
    title: "Store Settings",
    description:
      "Configure your store details — shipping options, contact info, policies, FAQs, and more.",
    icon: "⚙️",
  },
  {
    target: "view-store",
    title: "Preview Your Store",
    description:
      "See your live store anytime! Check how it looks to your customers as you make changes.",
    icon: "🏪",
  },
];

const STORAGE_KEY = "bytescart_tour_completed";

function copyRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
}

export function OnboardingTour() {
  const [phase, setPhase] = useState<"idle" | "welcome" | "touring">("idle");
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState<ReturnType<typeof copyRect> | null>(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });
  const [tipAbove, setTipAbove] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tour is no longer auto-launched — user is guided by the Getting Started checklist instead

  // Core: position highlight + tooltip whenever step or phase changes
  useEffect(() => {
    if (phase !== "touring") return;

    const cleanup = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    cleanup();

    // On mobile, tell sidebar to open
    if (isMobile) {
      window.dispatchEvent(new CustomEvent("tour-open-sidebar"));
    }

    const measureAndPosition = (el: HTMLElement, attempt: number) => {
      // Use rAF to ensure browser layout is complete before measuring
      requestAnimationFrame(() => {
        const rect = copyRect(el);
        if (rect.width === 0 || rect.height === 0) {
          // Element not yet laid out — retry
          if (attempt < 20) {
            timerRef.current = setTimeout(() => measureAndPosition(el, attempt + 1), 100);
          }
          return;
        }
        positionOn(rect);
      });
    };

    const findAndPosition = (attempt: number) => {
      const target = TOUR_STEPS[step]?.target;
      if (!target) return;

      const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
      if (!el) {
        if (attempt < 20) {
          timerRef.current = setTimeout(() => findAndPosition(attempt + 1), 100);
        }
        return;
      }

      // Check if element needs scrolling within its nav container
      const nav = el.closest("nav");
      if (nav) {
        const navR = nav.getBoundingClientRect();
        const elR = el.getBoundingClientRect();
        if (elR.top < navR.top || elR.bottom > navR.bottom) {
          nav.scrollTo({
            top: nav.scrollTop + (elR.top - navR.top) - navR.height / 2 + elR.height / 2,
            behavior: "smooth",
          });
          // Re-measure after scroll
          timerRef.current = setTimeout(() => measureAndPosition(el, attempt), 350);
          return;
        }
      }

      // If element is outside the visible viewport, scroll it into view
      const elRect = el.getBoundingClientRect();
      if (elRect.bottom < 0 || elRect.top > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        timerRef.current = setTimeout(() => measureAndPosition(el, attempt), 400);
        return;
      }

      measureAndPosition(el, attempt);
    };

    const positionOn = (rect: ReturnType<typeof copyRect>) => {

      setHighlight(rect);

      if (isMobile) {
        const screenH = window.innerHeight;
        const cardH = 260;
        const above = rect.top + rect.height / 2 > screenH * 0.4;
        setTipAbove(above);
        setTipPos({
          top: above ? Math.max(8, rect.top - cardH - 12) : rect.bottom + 12,
          left: 0,
        });
      } else {
        const tipW = 340;
        const tipH = 220;
        let top = rect.top + rect.height / 2 - tipH / 2;
        let left = rect.right + 16;

        if (top + tipH > window.innerHeight - 20) top = window.innerHeight - tipH - 20;
        if (top < 20) top = 20;
        if (left + tipW > window.innerWidth - 20) {
          left = Math.max(20, (window.innerWidth - tipW) / 2);
          top = rect.bottom + 16;
        }
        setTipPos({ top, left });
      }
    };

    // Initial delay: allow sidebar to open on mobile, brief delay on desktop for DOM
    const delay = isMobile ? 450 : 80;
    timerRef.current = setTimeout(() => findAndPosition(0), delay);

    return cleanup;
  }, [phase, step, isMobile]);

  const finish = () => {
    setPhase("idle");
    setHighlight(null);
    localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("tour-close-sidebar"));
  };

  const skip = () => {
    setPhase("idle");
    setHighlight(null);
    localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("tour-close-sidebar"));
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) {
      setHighlight(null);
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) {
      setHighlight(null);
      setStep(step - 1);
    }
  };

  // Welcome modal
  if (phase === "welcome") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Rocket className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Let&apos;s take a quick tour to help you get started. We&apos;ll walk you through each
              section so you know exactly where everything is.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setStep(0); setPhase("touring"); }}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Start Tour
              </button>
              <button
                onClick={skip}
                className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
              >
                Skip, I&apos;ll explore on my own
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase !== "touring") return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Dark overlay with cutout */}
      <div className="fixed inset-0 z-[90]" onClick={skip}>
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlight && (
                <rect
                  x={highlight.left - 4}
                  y={highlight.top - 4}
                  width={highlight.width + 8}
                  height={highlight.height + 8}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#tour-mask)" />
        </svg>
      </div>

      {/* Highlight border */}
      {highlight && (
        <div
          key={`hl-${step}`}
          className="fixed z-[101] rounded-xl border-2 border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] pointer-events-none"
          style={{
            top: highlight.top - 4,
            left: highlight.left - 4,
            width: highlight.width + 8,
            height: highlight.height + 8,
          }}
        >
          <div className="absolute inset-0 rounded-xl animate-pulse bg-blue-400/10" />
        </div>
      )}

      {/* Tooltip card — only render once highlight is positioned */}
      {highlight && (
        <div
          key={`tip-${step}`}
          className={
            isMobile
              ? `fixed z-[100] left-2 right-2 animate-in fade-in ${tipAbove ? "slide-in-from-bottom-2" : "slide-in-from-top-2"} duration-200`
              : "fixed z-[100] w-[340px] animate-in fade-in slide-in-from-left-2 duration-200"
          }
          style={isMobile ? { top: tipPos.top } : { top: tipPos.top, left: tipPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{current.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{current.title}</h3>
                    <p className="text-xs text-gray-400">Step {step + 1} of {TOUR_STEPS.length}</p>
                  </div>
                </div>
                <button
                  onClick={skip}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5">{current.description}</p>

              <div className="flex items-center justify-center gap-1.5 mb-4">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-6 bg-blue-500" : i < step ? "w-1.5 bg-blue-300" : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <button onClick={skip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Skip tour
                </button>

                <button
                  onClick={next}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  {isLast ? "Finish" : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Arrow (desktop only) */}
          {!isMobile && tipPos.left > (highlight?.right ?? 0) && (
            <div
              className="absolute w-3 h-3 bg-white border-l border-b border-gray-100 transform -rotate-45 -left-1.5"
              style={{
                top: Math.min(Math.max((highlight?.top ?? 0) + (highlight?.height ?? 0) / 2 - tipPos.top, 20), 200),
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
