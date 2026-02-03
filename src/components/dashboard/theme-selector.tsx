"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Theme } from "@/types/database";
import { Check, Copy, Sparkles } from "lucide-react";

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
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
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

  const copyToClipboard = (text: string) => {
    // Remove # if present before copying
    const hexToCopy = text.startsWith('#') ? text : `#${text}`;
    navigator.clipboard.writeText(hexToCopy);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const formatHex = (hex: string) => {
    // Ensure hex starts with #
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  return (
    <div>
      {success && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 p-4 rounded-xl text-sm flex items-center gap-3 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-green-100 rounded-full p-2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <span className="font-medium">Theme updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            disabled={loading}
            className={`relative rounded-2xl border-2 transition-all text-left overflow-hidden group ${
              selectedTheme === theme.id
                ? "border-blue-500 shadow-xl ring-2 ring-blue-200 bg-gradient-to-br from-white to-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white hover:from-white hover:to-gray-50"
            } ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
          >
            {selectedTheme === theme.id && (
              <div className="absolute top-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-2 z-10 shadow-lg">
                <Check className="h-5 w-5" />
              </div>
            )}

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

            {/* Color Swatches Header */}
            <div className="flex gap-4 p-6 border-b border-gray-100 relative z-10">
              {/* Primary Color */}
              <div className="flex-1">
                <div className="mb-3">
                  <div
                    className="w-full h-24 rounded-xl shadow-lg mb-3 border-2 border-gray-200 transition-all hover:scale-105 cursor-pointer group/color relative overflow-hidden"
                    style={{ backgroundColor: formatHex(theme.primaryHex) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(theme.primaryHex);
                    }}
                    title={`Click to copy: ${formatHex(theme.primaryHex)}`}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover/color:bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-all duration-200">
                      <Copy className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Primary</p>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(theme.primaryHex); }}>
                  <p className="text-xs text-gray-600 font-mono font-semibold select-all">
                    {formatHex(theme.primaryHex)}
                  </p>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex-1">
                <div className="mb-3">
                  <div
                    className="w-full h-24 rounded-xl shadow-lg mb-3 border-2 border-gray-200 transition-all hover:scale-105 cursor-pointer group/color relative overflow-hidden"
                    style={{ backgroundColor: formatHex(theme.secondaryHex) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(theme.secondaryHex);
                    }}
                    title={`Click to copy: ${formatHex(theme.secondaryHex)}`}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover/color:bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-all duration-200">
                      <Copy className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Secondary</p>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(theme.secondaryHex); }}>
                  <p className="text-xs text-gray-600 font-mono font-semibold select-all">
                    {formatHex(theme.secondaryHex)}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Details */}
            <div className="p-6 relative z-10">
              {/* Theme Name */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h3 className="font-bold text-gray-900 text-lg">{theme.name}</h3>
              </div>

              {/* Font Preview */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Font Family</p>
                <p
                  className="text-sm text-gray-700 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-semibold"
                  style={{ fontFamily: theme.fontFamily }}
                >
                  {theme.fontFamily.split(",")[0].replace(/['"]/g, "")}
                </p>
              </div>

              {/* Live Preview Section */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600 font-bold mb-3 uppercase tracking-wide">Live Preview</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    style={{ backgroundColor: formatHex(theme.primaryHex) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Primary
                  </button>
                  <button
                    className="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    style={{ backgroundColor: formatHex(theme.secondaryHex) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>

            {/* Copy Feedback */}
            {copiedColor && (copiedColor === theme.primaryHex || copiedColor === theme.secondaryHex) && (
              <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs px-3 py-2 rounded-full font-semibold animate-pulse z-20 shadow-lg">
                ✓ Copied!
              </div>
            )}
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 text-yellow-800 p-6 rounded-xl border-2 border-yellow-200 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
          <p className="font-bold text-lg">No themes available</p>
          <p className="text-sm mt-1">Please run the seed script to add themes.</p>
        </div>
      )}
    </div>
  );
}
