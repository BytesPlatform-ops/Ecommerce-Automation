"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions";
import { Product, ProductImage } from "@/types/database";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { X, Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
  storeId: string;
  product?: (Product | (Omit<Product, 'price'> & { price: string })) & {
    images?: ProductImage[];
  };
}

type SizeType = "VOLUME" | "WEIGHT" | "APPAREL_ALPHA" | "APPAREL_NUMERIC" | "FOOTWEAR" | "DIMENSION" | "COUNT" | "STORAGE";
type Unit = "ML" | "L" | "G" | "KG" | "XS" | "S" | "M" | "L_SIZE" | "XL" | "XXL" | "SIZE_28" | "SIZE_30" | "SIZE_32" | "SIZE_34" | "SIZE_36" | "SIZE_38" | "SIZE_40" | "SIZE_42" | "US_6" | "US_7" | "US_8" | "US_9" | "US_10" | "US_11" | "US_12" | "US_13" | "CM" | "METER" | "INCH" | "FEET" | "PCS" | "PACK" | "GB" | "TB";

interface Variant {
  id?: string;
  sizeType: SizeType | "";
  value: string;
  unit: Unit | "";
  price?: string; // Optional variant-specific price
  stock: number;
}

// Map of size types to their allowed units
const UNIT_OPTIONS: Record<SizeType, { value: Unit; label: string }[]> = {
  VOLUME: [
    { value: "ML", label: "ml" },
    { value: "L", label: "L" },
  ],
  WEIGHT: [
    { value: "G", label: "g" },
    { value: "KG", label: "kg" },
  ],
  APPAREL_ALPHA: [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L_SIZE", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ],
  APPAREL_NUMERIC: [
    { value: "SIZE_28", label: "28" },
    { value: "SIZE_30", label: "30" },
    { value: "SIZE_32", label: "32" },
    { value: "SIZE_34", label: "34" },
    { value: "SIZE_36", label: "36" },
    { value: "SIZE_38", label: "38" },
    { value: "SIZE_40", label: "40" },
    { value: "SIZE_42", label: "42" },
  ],
  FOOTWEAR: [
    { value: "US_6", label: "US 6" },
    { value: "US_7", label: "US 7" },
    { value: "US_8", label: "US 8" },
    { value: "US_9", label: "US 9" },
    { value: "US_10", label: "US 10" },
    { value: "US_11", label: "US 11" },
    { value: "US_12", label: "US 12" },
    { value: "US_13", label: "US 13" },
  ],
  DIMENSION: [
    { value: "CM", label: "cm" },
    { value: "METER", label: "m" },
    { value: "INCH", label: "in" },
    { value: "FEET", label: "ft" },
  ],
  COUNT: [
    { value: "PCS", label: "pcs" },
    { value: "PACK", label: "pack" },
  ],
  STORAGE: [
    { value: "GB", label: "GB" },
    { value: "TB", label: "TB" },
  ],
};

export function ProductForm({ storeId, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (product?.images && product.images.length > 0) {
      return [...product.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => image.url);
    }

    return product?.imageUrl ? [product.imageUrl] : [];
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEditing = !!product;

  // Initialize variants from product data when editing
  useEffect(() => {
    if (isEditing && product && 'variants' in product && product.variants) {
      const variants = (product.variants as any[]).map((v: any) => ({
        id: v.id,
        sizeType: v.sizeType || "",
        value: v.value || "",
        unit: v.unit || "",
        price: v.price ? v.price.toString() : "",
        stock: v.stock || 0,
      }));
      setVariants(variants);
    }
  }, [isEditing, product]);

  const addVariant = () => {
    setVariants([...variants, { sizeType: "", value: "", unit: "", price: "", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Reset unit when size type changes
    if (field === "sizeType") {
      updated[index].unit = "";
    }
    
    setVariants(updated);
  };

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
    
    // Round to 2 decimal places to prevent floating-point precision issues
    const roundedPrice = Math.round(priceNum * 100) / 100;
    if (roundedPrice > 999999.99) {
      setError("Price cannot exceed $999,999.99");
      return;
    }

    // Validate variants
    for (const variant of variants) {
      if (!variant.sizeType || !variant.unit) {
        setError("Please complete all variant fields or remove incomplete variants");
        return;
      }
      if (variant.stock < 0) {
        setError("Stock cannot be negative");
        return;
      }
      // Validate variant price if provided
      if (variant.price) {
        const variantPrice = parseFloat(variant.price);
        if (isNaN(variantPrice) || variantPrice < 0) {
          setError("Please enter a valid price for all variants or leave empty to use base price");
          return;
        }
        // Round to 2 decimal places
        const roundedVariantPrice = Math.round(variantPrice * 100) / 100;
        if (roundedVariantPrice > 999999.99) {
          setError("Variant price cannot exceed $999,999.99");
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (isEditing && product) {
        await updateProduct(product.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: roundedPrice,
          imageUrls,
          variants: variants.map(v => ({
            id: v.id,
            sizeType: v.sizeType as SizeType,
            value: v.value || undefined,
            unit: v.unit as Unit,
            price: v.price ? Math.round(parseFloat(v.price) * 100) / 100 : undefined,
            stock: v.stock,
          })),
        });
      } else {
        const result = await createProduct(storeId, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: roundedPrice,
          imageUrls,
          variants: variants.map(v => ({
            sizeType: v.sizeType as SizeType,
            value: v.value || undefined,
            unit: v.unit as Unit,
            price: v.price ? Math.round(parseFloat(v.price) * 100) / 100 : undefined,
            stock: v.stock,
          })),
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

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
          placeholder="Describe your product in detail..."
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
          <span className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500 font-medium">$</span>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            max="999999.99"
            value={price}
            onChange={(e) => {
              // Preserve the input value as-is to avoid browser rounding
              const inputValue = e.target.value;
              setPrice(inputValue);
            }}
            required
            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            placeholder="29.99"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Images
        </label>
        <p className="text-xs text-gray-500 mb-3">The first image is used as the primary image.</p>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {imageUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative group">
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    width={240}
                    height={240}
                    className="object-cover"
                  />
                </div>
                {index === 0 && (
                  <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide bg-white/90 text-gray-700 px-2 py-1 rounded-full shadow">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg hover:scale-110 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all">
          <UploadButton
            endpoint="productImage"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                setImageUrls((prev) => [...prev, ...res.map((item) => item.url)]);
              }
            }}
            onUploadError={(error: Error) => {
              setError(`Upload failed: ${error.message}`);
            }}
          />
        </div>
      </div>

      {/* Product Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Product Variants (Optional)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Add different sizes, volumes, or variations of this product
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>

        {variants.length > 0 && (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4"
              >
                {/* Header with Type and Remove Button */}
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Type
                    </label>
                    <select
                      value={variant.sizeType}
                      onChange={(e) =>
                        updateVariant(index, "sizeType", e.target.value)
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select type</option>
                      <option value="VOLUME">Volume</option>
                      <option value="WEIGHT">Weight</option>
                      <option value="APPAREL_ALPHA">Apparel (S/M/L)</option>
                      <option value="APPAREL_NUMERIC">Apparel (28/30/32)</option>
                      <option value="FOOTWEAR">Footwear</option>
                      <option value="DIMENSION">Dimension</option>
                      <option value="COUNT">Count</option>
                      <option value="STORAGE">Storage</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Value and Unit Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Value
                    </label>
                    <input
                      type="text"
                      value={variant.value}
                      onChange={(e) =>
                        updateVariant(index, "value", e.target.value)
                      }
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Unit
                    </label>
                    <select
                      value={variant.unit}
                      onChange={(e) => updateVariant(index, "unit", e.target.value)}
                      disabled={!variant.sizeType}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select unit</option>
                      {variant.sizeType &&
                        UNIT_OPTIONS[variant.sizeType as SizeType]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Price and Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Price (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500 text-sm font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999999.99"
                        value={variant.price || ""}
                        onChange={(e) => {
                          // Preserve the input value as-is to avoid browser rounding
                          const inputValue = e.target.value;
                          updateVariant(index, "price", inputValue);
                        }}
                        placeholder="Leave empty for base price"
                        className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Variant-specific price</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
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
