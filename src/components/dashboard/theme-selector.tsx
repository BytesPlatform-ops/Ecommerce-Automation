"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Theme } from "@/types/database";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
  themes: Theme[];
  currentThemeId: string | null;
  storeId: string;
}

export function ThemeSelector({
  themes,
  currentThemeId,
  storeId,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(currentThemeId);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    setLoading(true);
    setSuccess(false);

    try {
      await updateStore(storeId, { themeId });

      setSuccess(true);
      router.refresh();

      // Hide success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating theme:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {success && (
        <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          Theme updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            disabled={loading}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedTheme === theme.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            } ${loading ? "opacity-50 cursor-wait" : ""}`}
          >
            {selectedTheme === theme.id && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Color Preview */}
            <div className="flex gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-lg shadow-sm"
                style={{ backgroundColor: theme.primaryHex }}
                title="Primary"
              />
              <div
                className="w-10 h-10 rounded-lg shadow-sm"
                style={{ backgroundColor: theme.secondaryHex }}
                title="Secondary"
              />
            </div>

            {/* Theme Name */}
            <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>

            {/* Font Preview */}
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: theme.fontFamily }}
            >
              Font: {theme.fontFamily.split(",")[0]}
            </p>

            {/* Mini Preview */}
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: theme.primaryHex }}
            >
              <div
                className="text-sm font-medium text-white"
              >
                Preview Text
              </div>
              <div
                className="mt-2 text-xs px-2 py-1 rounded inline-block bg-white"
                style={{
                  backgroundColor: theme.secondaryHex,
                  color: "#ffffff",
                }}
              >
                Button
              </div>
            </div>
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          No themes available. Please run the seed script to add themes.
        </div>
      )}
    </div>
  );
}
