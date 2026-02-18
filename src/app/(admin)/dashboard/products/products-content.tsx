"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, Package, Search } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  deletedAt: string | Date | null;
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} {searchQuery && 'found'}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
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
                  className="group rounded-xl border overflow-hidden hover:shadow-md transition-all bg-gray-50 border-gray-100 hover:border-gray-200"
                >
                  {/* Product Image */}
                  <div className="aspect-video relative bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold line-clamp-1 text-gray-900">{product.name}</h3>
                        <p className="text-lg font-bold mt-1 text-blue-600">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock} in stock
                        </p>
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 space-y-1">
                            {product.variants.map((variant) => (
                              <div key={variant.id} className="flex items-center justify-between">
                                <span className="font-medium">{variant.value} {variant.unit}</span>
                                <span className={variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {variant.stock} stock
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
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
        <div className="bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl border border-gray-100 shadow-sm p-20 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-8 shadow-md">
            <Package className="h-12 w-12 text-blue-600" />
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
