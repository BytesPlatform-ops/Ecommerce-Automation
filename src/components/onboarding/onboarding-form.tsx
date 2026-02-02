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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Store Name */}
      <div>
        <label
          htmlFor="storeName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Store Name
        </label>
        <input
          id="storeName"
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="My Awesome Store"
        />
        {storeName && (
          <p className="mt-2 text-sm text-gray-500">
            Your store URL: <span className="font-medium">/stores/{slug}</span>
          </p>
        )}
      </div>

      {/* Theme Selection */}
      {themes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose a Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === theme.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="flex gap-1 mb-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.primaryHex }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.secondaryHex }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !storeName.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? "Creating your store..." : "Create Store"}
      </button>
    </form>
  );
}
