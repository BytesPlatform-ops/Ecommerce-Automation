"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  CreditCard,
  Eye,
  Palette,
  ChevronDown,
  ChevronUp,
  Rocket,
  ArrowRight,
  X,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
  completed: boolean;
  gradient: string;
  glowColor: string;
  iconBg: string;
}

interface GettingStartedProps {
  hasProducts: boolean;
  hasStripeConnected: boolean;
  hasViewedStore: boolean;
  storeSlug: string;
}

const DISMISSED_KEY = "bytescart_getting_started_dismissed";

export function GettingStarted({
  hasProducts,
  hasStripeConnected,
  hasViewedStore,
  storeSlug,
}: GettingStartedProps) {
  const [dismissed, setDismissed] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  const steps: Step[] = [
    {
      id: "product",
      title: "Add your first product",
      description: "Your store is invisible to customers until you do this.",
      href: "/dashboard/products/new",
      cta: "Add Product",
      icon: <Package className="h-4 w-4" />,
      completed: hasProducts,
      gradient: "from-blue-600 to-indigo-600",
      glowColor: "shadow-blue-500/25",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      id: "payments",
      title: "Connect payments",
      description: "Customers can't checkout until this is connected.",
      href: "/dashboard/payments",
      cta: "Setup Payments",
      icon: <CreditCard className="h-4 w-4" />,
      completed: hasStripeConnected,
      gradient: "from-emerald-600 to-teal-600",
      glowColor: "shadow-emerald-500/25",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      id: "theme",
      title: "Customize your theme",
      description: "Pick colors that match your brand.",
      href: "/dashboard/themes",
      cta: "Choose Theme",
      icon: <Palette className="h-4 w-4" />,
      completed: true,
      gradient: "from-purple-600 to-pink-600",
      glowColor: "shadow-purple-500/25",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      id: "preview",
      title: "Preview your live store",
      description: "See your store from a customer's perspective.",
      href: `/stores/${storeSlug}`,
      cta: "View Store",
      icon: <Eye className="h-4 w-4" />,
      completed: hasViewedStore,
      gradient: "from-amber-500 to-orange-600",
      glowColor: "shadow-amber-500/25",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const allDone = completedCount === totalSteps;
  const progressPercent = (completedCount / totalSteps) * 100;
  const nextStep = steps.find((s) => !s.completed);

  if (dismissed) return null;

  // All done state
  if (allDone) {
    return (
      <div className="dash-animate-in">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-5 shadow-sm">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="gs-icon-done">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  You&apos;re all set!
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    <Star className="h-2.5 w-2.5" /> Complete
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Your store is live and ready for customers!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem(DISMISSED_KEY, "true");
                setDismissed(true);
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-200/20" />
          <div className="absolute right-10 -bottom-8 h-20 w-20 rounded-full bg-teal-200/15" />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-animate-in">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        {/* Subtle top accent */}
        <div className="h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Background decorations */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-50/50 pointer-events-none" />
        <div className="absolute right-1/4 top-2 h-20 w-20 rounded-full bg-purple-50/30 pointer-events-none" />

        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="gs-icon-rocket">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Launch your store
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {completedCount === 0
                    ? "4 quick steps to start selling"
                    : `${totalSteps - completedCount} step${totalSteps - completedCount > 1 ? "s" : ""} left — you're almost there!`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(DISMISSED_KEY, "true");
                  setDismissed(true);
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            {/* Circular progress */}
            <div className="relative h-10 w-10 shrink-0">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="url(#gs-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gs-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-gray-800">
                  {completedCount}/{totalSteps}
                </span>
              </div>
            </div>

            {/* Segmented bar */}
            <div className="flex-1 flex items-center gap-1.5">
              {steps.map((step) => (
                <div key={step.id} className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      step.completed
                        ? "w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        {expanded && (
          <div className="relative px-5 pb-5 sm:px-6">
            <div className="space-y-1.5">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="gs-step-item"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  {step.completed ? (
                    /* ─ Completed step ─ */
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50/70">
                      <div className="gs-check-done shrink-0">
                        <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />
                      </div>
                      <p className="flex-1 text-sm font-medium text-gray-400 line-through decoration-gray-300">
                        {step.title}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                        Done
                      </span>
                    </div>
                  ) : (
                    /* ─ Active step ─ */
                    <div className="group flex items-start sm:items-center flex-wrap gap-x-3 gap-y-2 px-3 py-3 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                      <div
                        className={`gs-step-icon shrink-0 ${step.iconBg} shadow-md ${step.glowColor}`}
                      >
                        <span className="text-white">{step.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      <Link
                        href={step.href}
                        target={step.id === "preview" ? "_blank" : undefined}
                        className={`gs-step-btn bg-gradient-to-r ${step.gradient} ${step.glowColor} w-full sm:w-auto justify-center`}
                      >
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Big CTA */}
            {nextStep && (
              <div className="mt-4">
                <Link
                  href={nextStep.href}
                  target={nextStep.id === "preview" ? "_blank" : undefined}
                  className={`gs-main-cta bg-gradient-to-r ${nextStep.gradient}`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>{nextStep.cta} — it only takes a minute</span>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  <div className="gs-shimmer-sweep" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
