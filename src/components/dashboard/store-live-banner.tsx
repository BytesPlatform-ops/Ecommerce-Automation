"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, X, Sparkles } from "lucide-react";

const DISMISSED_KEY = "bytescart_store_live_dismissed";

export function StoreLiveBanner({ storeSlug }: { storeSlug: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="dash-animate-in relative overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Your store is live — see it in action!</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            bytescart.ai/stores/<span className="font-medium text-indigo-600">{storeSlug}</span>
          </p>
        </div>
        <Link
          href={`/stores/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:shadow-md hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Store
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, "true");
            setDismissed(true);
          }}
          className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-200/20 pointer-events-none" />
    </div>
  );
}
