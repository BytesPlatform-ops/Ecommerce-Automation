"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, Package, Search, Tag } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";

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
}

export default function ProductsPageContent({ products: initialProducts }: ProductsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);

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
      {/* Header */}
      <div className="dash-animate-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} {searchQuery && 'found'}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
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
          <p className="text-gray-600 mb-1 max-w-md mx-auto leading-relaxed">
            Get started by adding your first product to your store using the button above
          </p>
        </div>
      )}
    </div>
  );
}
