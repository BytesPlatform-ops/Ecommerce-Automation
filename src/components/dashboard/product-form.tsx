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
  product?: Product | (Omit<Product, 'price'> & { price: string });
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
          <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <X className="h-4 w-4 text-red-600" />
          </div>
          {error}
        </div>
      )}

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Product Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          placeholder="e.g. Premium Wireless Headphones"
        />
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Price
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            placeholder="29.99"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Image
        </label>

        {imageUrl ? (
          <div className="relative inline-block group">
            <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
              <Image
                src={imageUrl}
                alt="Product preview"
                width={240}
                height={240}
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg hover:scale-110 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all">
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
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
