"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Store } from "@/types/database";

interface SettingsFormProps {
  store: Store;
}

export function SettingsForm({ store }: SettingsFormProps) {
  const [storeName, setStoreName] = useState(store.storeName);
  const [aboutText, setAboutText] = useState(store.aboutText || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!storeName.trim()) {
      setError("Store name is required");
      return;
    }

    setLoading(true);

    try {
      await updateStore(store.id, {
        storeName: storeName.trim(),
        aboutText: aboutText.trim() || undefined,
      });

      setSuccess(true);
      router.refresh();

      // Hide success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          Settings saved successfully!
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
        />
      </div>

      {/* Store URL (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store URL
        </label>
        <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
          /stores/{store.subdomainSlug}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Store URL cannot be changed after creation
        </p>
      </div>

      {/* About Text */}
      <div>
        <label
          htmlFor="aboutText"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          About Your Store
        </label>
        <textarea
          id="aboutText"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Tell customers about your store..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
