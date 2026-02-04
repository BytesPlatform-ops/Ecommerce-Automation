import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield, Truck, RotateCcw, Heart, Share2, Star, Check } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;

  // Fetch product by ID and verify it belongs to the correct store
  const product = await prisma.product.findFirst({
    where: {
      id,
      store: { subdomainSlug: username },
    },
    include: {
      store: {
        select: { id: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <Link
          href={`/stores/${username}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Product Image */}
          <div>
            <div className="aspect-square relative bg-white rounded-3xl overflow-hidden shadow-lg mb-6">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-xl font-medium">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Info */}
            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-xs text-gray-500 font-medium">100% Authentic</p>
              </div>
              <div className="flex-1 p-3 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-xs text-gray-500 font-medium">Brand New</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600">(128 reviews)</p>
            </div>

            {/* Title and Price */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4 mb-4">
                <p 
                  className="text-5xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  ${Number(product.price).toFixed(2)}
                </p>
                <p className="text-2xl text-gray-400 line-through">
                  ${(Number(product.price) * 1.2).toFixed(2)}
                </p>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Save 17%
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Check className="h-5 w-5" />
                In Stock (24 units available)
              </div>
            </div>

            {/* Color and Size Options */}
            <div className="space-y-6 mb-8 pb-8 border-b border-gray-200">
              {/* Add to Cart with Quantity */}
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  imageUrl: product.imageUrl,
                }}
                storeId={product.store.id}
                storeSlug={username}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              <div className="flex gap-3">
                <button className="flex-1 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
                <button className="flex-1 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Why Shop With Us?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% secure transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day money back guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  This premium product has been carefully selected to meet the highest quality standards. 
                  Each item is thoroughly inspected and tested to ensure exceptional performance and durability.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy the perfect blend of quality, style, and functionality with this must-have product.
                  Whether you're a first-time buyer or a loyal customer, you'll appreciate the attention to detail.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">SKU</p>
                  <p className="font-semibold text-gray-900">{product.id.slice(0, 8)}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Availability</p>
                  <p className="font-semibold text-green-600">In Stock</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose This?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Premium quality materials</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Expertly crafted design</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Exceptional durability</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Great value for money</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Customer satisfaction guaranteed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
