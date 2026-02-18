import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield, Truck, RotateCcw, Check } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductVariantSelector } from "@/components/storefront/product-variant-selector";
import { ProductImageGallery } from "@/components/storefront/product-image-gallery";

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
      deletedAt: null, // Exclude soft-deleted products
      store: { subdomainSlug: username },
    },
    include: {
      store: {
        select: { id: true, domain: true },
      },
      variants: {
        orderBy: { createdAt: 'asc' },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const imageUrls = product.images.length > 0
    ? product.images.map((image) => image.url)
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const mainImageUrl = imageUrls[0];

  // Always redirect back to the store page we're on
  const backUrl = `/stores/${username}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 animate-fade-in">
        {/* Breadcrumb */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-xs transition-colors duration-300 mb-8 sm:mb-12 group px-4 py-2 rounded-xl bg-primary-light border border-primary-light"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          <span className="uppercase tracking-[0.08em] font-medium">Back to shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-start">
          {/* Product Image */}
          <div>
            <ProductImageGallery name={product.name} imageUrls={imageUrls} />

            {/* Product trust badges — inline */}
            <div className="flex gap-3 mt-4">
              <div className="flex-1 py-3.5 rounded-xl text-center bg-primary-light border border-primary-light">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium" style={{ color: "var(--primary)" }}>Authentic</p>
              </div>
              <div className="flex-1 py-3.5 rounded-xl text-center bg-secondary-light border border-secondary-light">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium" style={{ color: "var(--secondary)" }}>Brand New</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="mb-8">
              <span className="section-badge mb-3">Product</span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight text-foreground mb-4 tracking-tight">
                {product.name}
              </h1>
              {product.variants.length === 0 && (
                <>
                  <p 
                    className="text-xl sm:text-2xl font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <p className={`text-sm mt-2 font-medium ${
                    product.stock > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                </>
              )}
            </div>

            {/* Variant Selection / Add to Cart */}
            <div className="space-y-6 mb-8 pb-8 border-b border-border">
              {product.variants.length > 0 ? (
                <ProductVariantSelector
                  variants={product.variants.map(v => ({
                    id: v.id,
                    sizeType: v.sizeType,
                    value: v.value,
                    unit: v.unit,
                    price: v.price ? Number(v.price) : null,
                    stock: v.stock,
                  }))}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: mainImageUrl || null,
                  }}
                  storeId={product.store.id}
                  storeSlug={username}
                />
              ) : (
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: mainImageUrl || null,
                  }}
                  storeId={product.store.id}
                  storeSlug={username}
                  stock={product.stock}
                />
              )}
            </div>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-primary-light border border-primary-light">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                  <Truck className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Complimentary Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-secondary-light border border-secondary-light">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--secondary)", color: "white" }}>
                  <Shield className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">Encrypted payment processing</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-primary-light border border-primary-light">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                  <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 pt-10">
            <div className="accent-line w-16 mb-6" />
            <span className="section-badge mb-4">Details</span>
            <div className="prose max-w-none">
              {product.description ? (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This product has been carefully selected to meet the highest standards of quality and craftsmanship. 
                  Each item is thoroughly inspected to ensure exceptional performance and lasting value.
                </p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-xl bg-primary-light border-primary-light">
                <p className="text-overline mb-1" style={{ color: "var(--primary)" }}>SKU</p>
                <p className="text-sm font-medium text-foreground">{product.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="border p-4 rounded-xl bg-secondary-light border-secondary-light">
                <p className="text-overline mb-1" style={{ color: "var(--secondary)" }}>Availability</p>
                <p className={`text-sm font-medium ${
                  product.stock > 0 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <div className="accent-line w-12 mb-6" />
            <span className="section-badge mb-4">Why This Product</span>
            <ul className="space-y-3 mt-4">
              {[
                "Premium quality materials",
                "Expertly crafted design",
                "Exceptional durability",
                "Great value for money",
                "Satisfaction guaranteed",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "var(--primary)" }}>
                    <Check className="h-3 w-3 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
