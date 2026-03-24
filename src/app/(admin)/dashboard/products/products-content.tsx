"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Package, Search, Tag, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { createSampleProducts } from "@/lib/actions";
import { useRouter } from "next/navigation";

const CONFETTI_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#f43f5e","#8b5cf6","#14b8a6"];

function ConfettiPiece({ color, left, delay, duration, size }: { color: string; left: number; delay: number; duration: number; size: number }) {
  return (
    <div
      className="confetti-piece"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        width: size,
        height: size,
        animationDuration: `${duration}s, ${duration * 0.6}s`,
        animationDelay: `${delay}s, ${delay}s`,
      }}
    />
  );
}

function Celebration({ onDone, storeSlug }: { onDone: () => void; storeSlug: string }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setHiding(true), 3800);
    const doneTimer = setTimeout(onDone, 4200);
    return () => { clearTimeout(hideTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.5 + Math.random() * 2,
    size: 6 + Math.round(Math.random() * 8),
  }));

  return (
    <>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} color={p.color} left={p.left} delay={p.delay} duration={p.duration} size={p.size} />
      ))}
      <div className={`product-toast${hiding ? " toast-hiding" : ""}`}>
        <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Product added to your store!</p>
            <p className="text-xs text-gray-400 mt-0.5">Your store is now live for customers.</p>
          </div>
          <a
            href={`/stores/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 shrink-0 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 whitespace-nowrap"
          >
            View store →
          </a>
        </div>
      </div>
    </>
  );
}

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  deletedAt: string | Date | null;
  categoryName?: string | null;
  variants?: Array<{
    id: string;
    sizeType: string | null;
    value: string | null;
    unit: string | null;
    stock: number;
    price: string | null;
  }>;
}

interface ProductsPageContentProps {
  products: Product[];
  storeId: string;
  storeSlug: string;
}

export default function ProductsPageContent({ products: initialProducts, storeId, storeSlug }: ProductsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("newProduct") === "1") {
      setShowCelebration(true);
      window.history.replaceState({}, "", "/dashboard/products");
    }
  }, []);

  const handleCelebrationDone = useCallback(() => setShowCelebration(false), []);

  const handleProductDeleted = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const filteredProducts = useMemo(() => {
    // Filter out deleted products
    const activeProducts = products.filter((p) => !p.deletedAt);
    
    if (!searchQuery.trim()) return activeProducts;

    const query = searchQuery.toLowerCase();
    return activeProducts.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  return (
    <div className="space-y-6">
      {showCelebration && <Celebration onDone={handleCelebrationDone} storeSlug={storeSlug} />}
      {/* Header */}
      <div className="dash-animate-in flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} {searchQuery && 'found'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="dash-product-card group"
                >
                  {/* Product Image */}
                  <div className="image-wrapper aspect-video relative bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    {/* Stock indicator overlay */}
                    <div className="absolute top-2 right-2">
                      <span className={`dash-badge ${product.stock > 10 ? 'dash-badge-success' : product.stock > 0 ? 'dash-badge-warning' : 'dash-badge-danger'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-1 text-gray-900">{product.name}</h3>
                        {product.categoryName && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Tag className="h-3 w-3" />
                            {product.categoryName}
                          </span>
                        )}
                        <p className="text-lg font-bold mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 space-y-1">
                            {product.variants.map((variant) => (
                              <div key={variant.id} className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1">
                                <span className="font-medium">{variant.value} {variant.unit}</span>
                                <span className={`font-semibold ${variant.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {variant.stock}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                      <DeleteProductButton 
                        productId={product.id} 
                        onSuccess={handleProductDeleted}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery.trim() 
                    ? `No products match "${searchQuery}". Try adjusting your search.`
                    : "No products available"}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="dash-empty-state bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl border border-gray-100 shadow-sm p-16">
          <div className="icon-container">
            <Package className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No products yet</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto leading-relaxed">
            Add your own product or load sample products to see how your store looks.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
            <button
              onClick={async () => {
                setLoadingSamples(true);
                try {
                  await createSampleProducts(storeId);
                  router.refresh();
                } catch {
                  // Silently fail — most likely store already has products
                } finally {
                  setLoadingSamples(false);
                }
              }}
              disabled={loadingSamples}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSamples ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding samples...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Load Sample Products
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
