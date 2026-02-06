"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Store } from "@/types/database";
import { UploadButton } from "@/lib/uploadthing";
import { X, Upload, CheckCircle } from "lucide-react";

interface SettingsFormProps {
  store: Store;
}

export function SettingsForm({ store }: SettingsFormProps) {
  const [storeName, setStoreName] = useState(store.storeName);
  const [aboutText, setAboutText] = useState(store.aboutText || "");
  const [heroImageUrl, setHeroImageUrl] = useState((store as any).heroImageUrl || "");
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
        heroImageUrl: heroImageUrl || undefined,
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

      {/* Hero Section Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hero Section Image
        </label>
        
        {heroImageUrl && (
          <div className="mb-4 relative rounded-lg overflow-hidden border border-gray-300">
            <img
              src={heroImageUrl}
              alt="Hero Image Preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error("Failed to load image:", heroImageUrl);
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveImage()}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-600 text-center">Drag and drop or click to select</p>
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
        <p className="mt-2 text-xs text-gray-500">
          Recommended size: 1200x400px or wider
        </p>
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
