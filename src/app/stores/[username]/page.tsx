import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductSearch } from "@/components/storefront/product-search";
import { ContactSection } from "@/components/storefront/contact-section";

// Check if we're on a custom domain
async function isCustomDomain() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const isRender = host.includes("ecommerce-automation-wt2l.onrender.com");
  return !isLocal && !isRender;
}

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const onCustomDomain = await isCustomDomain();

  // Fetch store with products
  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
    include: { 
      products: { orderBy: { createdAt: "desc" } },
      theme: true,
    },
  });

  if (!store) {
    notFound();
  }

  const storeWithHero = store as any;
  const heroImageUrl = storeWithHero.heroImageUrl;

  const products = store.products;
  const featuredProducts = products.slice(0, 4);
  const latestProducts = products.slice(0, 12);

  const productPath = onCustomDomain ? "/product" : `/stores/${username}/product`;
  const storePath = onCustomDomain ? "/" : `/stores/${username}`;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {heroImageUrl ? (
          <div className="relative min-h-[85vh] flex items-center">
            <Image
              src={heroImageUrl}
              alt={store.storeName}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-2xl">
                <p className="text-overline !text-white/70 mb-4 sm:mb-6">Welcome to {store.storeName}</p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 tracking-tight">
                  Curated for
                  <br />
                  the discerning
                </h1>
                <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 leading-relaxed max-w-lg font-light">
                  Discover our collection of thoughtfully selected products, crafted with quality and care.
                </p>
                <a 
                  href="#products"
                  className="btn-luxury btn-primary-luxury !bg-white !text-foreground hover:!opacity-90"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[80vh] flex items-center border-b border-border">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full py-24 sm:py-32">
              <div className="max-w-2xl">
                <p className="text-overline mb-4 sm:mb-6">Welcome to {store.storeName}</p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6 tracking-tight">
                  Curated for
                  <br />
                  the discerning
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed max-w-lg">
                  Discover our collection of thoughtfully selected products, crafted with quality and care.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="#products"
                    className="btn-luxury btn-primary-luxury"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                  <a 
                    href="#about"
                    className="btn-luxury btn-outline-luxury"
                  >
                    Our Story
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="border-b border-border py-8 sm:py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-center gap-3 justify-center">
              <Truck className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Complimentary Shipping</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Shield className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <RotateCcw className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">30-Day Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 sm:mb-12">
              <div>
                <p className="text-overline mb-2">Featured</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight">
                  New Arrivals
                </h2>
              </div>
              {products.length > 4 && (
                <Link
                  href="#products"
                  className="text-sm text-muted-foreground hover:text-foreground link-underline transition-colors duration-300 hidden sm:block"
                >
                  View All
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card group border border-border bg-background overflow-hidden"
                >
                  <Link href={`${productPath}/${product.id}`} className="block">
                    <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover product-image"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-sm sm:text-base text-foreground mb-1.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <AddToCartButton 
                      product={{
                        ...product,
                        price: Number(product.price),
                      }}
                      storeId={store.id}
                      storeSlug={username}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── All Products ─── */}
      <section id="products" className="py-16 sm:py-20 lg:py-24 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-overline mb-2" style={{ color: "var(--primary)" }}>Collection</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight mb-4">
              All Products
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Browse our complete selection of carefully curated items
            </p>
          </div>

          {/* Search */}
          <div className="mb-10 sm:mb-12 max-w-md mx-auto">
            <ProductSearch 
              products={products.map(p => ({
                id: p.id,
                name: p.name,
                imageUrl: p.imageUrl,
                price: Number(p.price),
              }))} 
              productPath={productPath}
            />
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="product-card group border border-border bg-background overflow-hidden"
                >
                  <Link href={`${productPath}/${product.id}`} className="block">
                    <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover product-image"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm text-foreground mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <AddToCartButton 
                      product={{
                        ...product,
                        price: Number(product.price),
                      }}
                      storeId={store.id}
                      storeSlug={username}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-border">
              <p className="text-muted-foreground text-sm mb-1">No products yet</p>
              <p className="text-xs text-muted-foreground">Check back soon for new arrivals</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-24 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-overline mb-2" style={{ color: "var(--primary)" }}>Testimonials</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Anderson",
                content: "The quality is exceptional. Every piece feels considered and beautifully made. This is my go-to for thoughtful purchases.",
              },
              {
                name: "Michael Chen",
                content: "Impeccable packaging and fast delivery. The products are even better in person than the photos suggest.",
              },
              {
                name: "Emma Thompson",
                content: "A truly curated selection. You can feel the care that goes into every product. Outstanding experience from start to finish.",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="border border-border p-6 sm:p-8 transition-colors duration-400 hover:border-foreground"
              >
                <p className="text-sm text-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="text-overline !text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Verified Buyer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <div id="contact">
        <ContactSection
          storeId={store.id}
          storeName={store.storeName}
          contactEmail={(store as any).contactEmail}
          contactPhone={(store as any).contactPhone}
          whatsappNumber={(store as any).whatsappNumber}
          instagramUrl={(store as any).instagramUrl}
          facebookUrl={(store as any).facebookUrl}
          twitterUrl={(store as any).twitterUrl}
          linkedinUrl={(store as any).linkedinUrl}
          youtubeUrl={(store as any).youtubeUrl}
          supportedQueryTypes={(store as any).supportedQueryTypes}
        />
      </div>

      {/* ─── CTA Section ─── */}
      <section className="py-20 sm:py-28 lg:py-32 border-t" style={{ borderTopColor: "var(--primary)" }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-px mx-auto mb-8" style={{ backgroundColor: "var(--primary)" }} />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-5">
            Begin your journey
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto">
            Explore our collection and find something exceptional
          </p>
          <a 
            href="#products"
            className="btn-luxury btn-primary-luxury"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Shop Now
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </section>
    </div>
  );
}
