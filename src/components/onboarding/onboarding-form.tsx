"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStore } from "@/lib/actions";
import { Theme } from "@/types/database";
import { Check } from "lucide-react";

interface OnboardingFormProps {
  themes: Theme[];
  userId: string;
}

export function OnboardingForm({ themes, userId }: OnboardingFormProps) {
  const [storeName, setStoreName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(
    themes[0]?.id || null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generate slug from store name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError("Please enter a store name");
      return;
    }

    const slug = generateSlug(storeName);
    if (slug.length < 3) {
      setError("Store name is too short");
      return;
    }

    if (!selectedTheme) {
      setError("Please select a theme");
      return;
    }

    setLoading(true);

    try {
      const result = await createStore(userId, {
        storeName: storeName.trim(),
        subdomainSlug: slug,
        themeId: selectedTheme,
      });
      
      console.log("Store created:", result);

      // Redirect after successful store creation
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Error creating store:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  const slug = generateSlug(storeName);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
          <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-red-600" />
          </div>
          {error}
        </div>
      )}

      {/* Store Name */}
      <div>
        <label
          htmlFor="storeName"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Store Name
        </label>
        <input
          id="storeName"
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
          placeholder="My Awesome Store"
        />
        {storeName && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600">
              Your store URL: <span className="font-semibold text-blue-600">/stores/{slug}</span>
            </p>
          </div>
        )}
      </div>

      {/* Theme Selection */}
      {themes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Choose a Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  selectedTheme === theme.id
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/10"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-1.5 shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="flex gap-2 mb-3 justify-center">
                  <div
                    className="w-10 h-10 rounded-xl shadow-sm"
                    style={{ backgroundColor: theme.primaryHex }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl shadow-sm"
                    style={{ backgroundColor: theme.secondaryHex }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !storeName.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating your store...
          </span>
        ) : (
          "Create Store"
        )}
      </button>
    </form>
  );
}
