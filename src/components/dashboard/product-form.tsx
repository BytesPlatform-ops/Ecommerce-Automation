"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions";
import { Product } from "@/types/database";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { X } from "lucide-react";

interface ProductFormProps {
  storeId: string;
  product?: Product;
}

export function ProductForm({ storeId, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEditing = !!product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a product name");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && product) {
        await updateProduct(product.id, {
          name: name.trim(),
          price: priceNum,
          imageUrl: imageUrl || undefined,
        });
      } else {
        const result = await createProduct(storeId, {
          name: name.trim(),
          price: priceNum,
          imageUrl: imageUrl || undefined,
        });
        console.log("Product created:", result);
      }

      // Redirect after successful creation/update
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 500);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Product Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Amazing Product"
        />
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Price ($)
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="29.99"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>

        {imageUrl ? (
          <div className="relative inline-block">
            <Image
              src={imageUrl}
              alt="Product preview"
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="productImage"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                setImageUrl(res[0].ufsUrl);
              }
            }}
            onUploadError={(error: Error) => {
              setError(`Upload failed: ${error.message}`);
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}
