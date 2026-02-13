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

  // Determine the correct back-to-shop URL
  // If store has a custom domain, we're on that domain and root is the shop page
  // Otherwise, we're on /stores/[username] path
  const backUrl = product.store.domain ? "/" : `/stores/${username}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Breadcrumb */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8 sm:mb-12 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          <span className="uppercase tracking-[0.08em]">Back to shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-start">
          {/* Product Image */}
          <div>
            <ProductImageGallery name={product.name} imageUrls={imageUrls} />

            {/* Product trust badges — inline */}
            <div className="flex gap-3">
              <div className="flex-1 py-3 border border-border text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Authentic</p>
              </div>
              <div className="flex-1 py-3 border border-border text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Brand New</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="mb-8">
              <p className="text-overline mb-3">Product</p>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight text-foreground mb-4 tracking-tight">
                {product.name}
              </h1>
              <p 
                className="text-xl sm:text-2xl font-medium"
                style={{ color: "var(--primary)" }}
              >
                ${Number(product.price).toFixed(2)}
              </p>
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
                />
              )}
            </div>

            {/* Trust Badges */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-foreground">Complimentary Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-foreground">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">Encrypted payment processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-foreground">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border-t border-border pt-10">
            <p className="text-overline mb-4">Details</p>
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
              <div className="border border-border p-4">
                <p className="text-overline mb-1">SKU</p>
                <p className="text-sm text-foreground">{product.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="border border-border p-4">
                <p className="text-overline mb-1">Availability</p>
                <p className="text-sm text-green-700">In Stock</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-10">
            <p className="text-overline mb-4">Why This Product</p>
            <ul className="space-y-3">
              {[
                "Premium quality materials",
                "Expertly crafted design",
                "Exceptional durability",
                "Great value for money",
                "Satisfaction guaranteed",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.5} />
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
