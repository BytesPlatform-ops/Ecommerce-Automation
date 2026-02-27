"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Store } from "@/types/database";
import { UploadButton } from "@/lib/uploadthing";
import { X, Upload, CheckCircle, ImageIcon, Sparkles } from "lucide-react";

interface SettingsFormProps {
  store: Store;
}

export function SettingsForm({ store }: SettingsFormProps) {
  const [storeName, setStoreName] = useState(store.storeName);
  const [aboutText, setAboutText] = useState(store.aboutText || "");
  const [heroHeadline, setHeroHeadline] = useState(
    store.heroHeadline || "Curated for\nthe discerning"
  );
  const [heroDescription, setHeroDescription] = useState(
    store.heroDescription ||
      "Discover our collection of thoughtfully selected products, crafted with quality and care."
  );
  const [heroTextAlign, setHeroTextAlign] = useState<"Left" | "Center" | "Right">(
    (store.heroTextAlign as "Left" | "Center" | "Right") || "Left"
  );
  const [heroImageUrl, setHeroImageUrl] = useState(store.heroImageUrl || "");
  const [storeLogoUrl, setStoreLogoUrl] = useState(store.storeLogoUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (imageUrl: string) => {
    setHeroImageUrl(imageUrl);
    setImageSaved(false);
    
    // Auto-save the image to the database
    try {
      await updateStore(store.id, {
        storeName: store.storeName,
        aboutText: store.aboutText || undefined,
        heroImageUrl: imageUrl,
      });
      setImageSaved(true);
      router.refresh();
      // Hide message after 2 seconds
      setTimeout(() => setImageSaved(false), 2000);
    } catch (err) {
      setError(`Failed to save image: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleRemoveImage = async () => {
    setHeroImageUrl("");
    try {
      await updateStore(store.id, {
        storeName: store.storeName,
        aboutText: store.aboutText || undefined,
        heroImageUrl: "",
      });
      setImageSaved(true);
      router.refresh();
      setTimeout(() => setImageSaved(false), 2000);
    } catch (err) {
      setError(`Failed to remove image: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleLogoUpload = async (imageUrl: string) => {
    setStoreLogoUrl(imageUrl);
    setImageSaved(false);

    try {
      await updateStore(store.id, {
        storeName: store.storeName,
        aboutText: store.aboutText || undefined,
        storeLogoUrl: imageUrl,
      });
      setImageSaved(true);
      router.refresh();
      setTimeout(() => setImageSaved(false), 2000);
    } catch (err) {
      setError(`Failed to save logo: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleRemoveLogo = async () => {
    setStoreLogoUrl("");
    try {
      await updateStore(store.id, {
        storeName: store.storeName,
        aboutText: store.aboutText || undefined,
        storeLogoUrl: "",
      });
      setImageSaved(true);
      router.refresh();
      setTimeout(() => setImageSaved(false), 2000);
    } catch (err) {
      setError(`Failed to remove logo: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

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
        heroHeadline: heroHeadline.trim() ? heroHeadline.trim() : null,
        heroDescription: heroDescription.trim() ? heroDescription.trim() : null,
        heroTextAlign: heroTextAlign,
        heroImageUrl: heroImageUrl || undefined,
        storeLogoUrl: storeLogoUrl || undefined,
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

      {imageSaved && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Image saved successfully!
        </div>
      )}

      {/* Store Name */}
      <div>
        <label
          htmlFor="storeName"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--primary)' }}
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
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>
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
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--primary)' }}
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

      {/* Hero Headline */}
      <div>
        <label
          htmlFor="heroHeadline"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--primary)' }}
        >
          Hero Headline
        </label>
        <textarea
          id="heroHeadline"
          value={heroHeadline}
          onChange={(e) => setHeroHeadline(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Curated for\nthe discerning"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use line breaks to control where the headline wraps.
        </p>
      </div>

      {/* Hero Description */}
      <div>
        <label
          htmlFor="heroDescription"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--primary)' }}
        >
          Hero Description
        </label>
        <textarea
          id="heroDescription"
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Discover our collection of thoughtfully selected products, crafted with quality and care."
        />
      </div>

      {/* Hero Text Alignment */}
      <div>
        <label
          htmlFor="heroTextAlign"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--primary)' }}
        >
          Hero Text Alignment
        </label>
        <select
          id="heroTextAlign"
          value={heroTextAlign}
          onChange={(e) => setHeroTextAlign(e.target.value as "Left" | "Center" | "Right")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="Left">Left</option>
          <option value="Center">Center</option>
          <option value="Right">Right</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Choose how to align your hero section headline and description.
        </p>
      </div>

      {/* Store Logo */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Store Logo</h3>
              <p className="text-xs text-gray-500">256×256px or larger recommended</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo preview */}
            <div className="shrink-0">
              {storeLogoUrl ? (
                <div className="relative group">
                  <div className="h-24 w-24 rounded-2xl border-2 border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                    <img
                      src={storeLogoUrl}
                      alt="Store Logo Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load logo:", storeLogoUrl);
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLogo()}
                    className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    aria-label="Remove logo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Upload area */}
            <div className="flex-1 w-full">
              <div className="rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-300 bg-gray-50/50 hover:bg-violet-50/30 transition-colors p-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Upload a new logo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG or WebP up to 4MB</p>
                  </div>
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      console.log("Logo upload response:", res);
                      if (res?.[0]) {
                        const uploadedUrl = res[0].url;
                        console.log("Uploaded logo URL:", uploadedUrl);
                        handleLogoUpload(uploadedUrl);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Logo upload error:", error);
                      setError(`Upload error: ${error.message}`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Image */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Hero Section Image</h3>
              <p className="text-xs text-gray-500">1200×400px or wider recommended</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {heroImageUrl && (
            <div className="relative group mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={heroImageUrl}
                alt="Hero Image Preview"
                className="w-full h-44 sm:h-52 object-cover"
                onError={(e) => {
                  console.error("Failed to load image:", heroImageUrl);
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={() => handleRemoveImage()}
                className="absolute top-3 right-3 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/30 transition-colors p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {heroImageUrl ? "Replace hero image" : "Upload a hero image"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG or WebP up to 4MB</p>
              </div>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  console.log("Upload response:", res);
                  if (res?.[0]) {
                    const uploadedUrl = res[0].url;
                    console.log("Uploaded URL:", uploadedUrl);
                    handleImageUpload(uploadedUrl);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  setError(`Upload error: ${error.message}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
