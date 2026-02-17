import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductSearch } from "@/components/storefront/product-search";
import { ContactSection } from "@/components/storefront/contact-section";
import { ShippingLocationsDisplay } from "@/components/storefront/shipping-locations-display";
import { getStoreBySlug, checkIsCustomDomain } from "@/lib/store-cache";

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const onCustomDomain = await checkIsCustomDomain();

  // Fetch store with products (cached — shared with layout.tsx, single DB hit)
  const store = await getStoreBySlug(username);

  if (!store) {
    notFound();
  }

  const heroImageUrl = store.heroImageUrl;
  const defaultHeroHeadline = "Curated for\nthe discerning";
  const defaultHeroDescription =
    "Discover our collection of thoughtfully selected products, crafted with quality and care.";
  const heroHeadline =
    store.heroHeadline && store.heroHeadline.trim().length > 0
      ? store.heroHeadline
      : defaultHeroHeadline;
  const heroDescription =
    store.heroDescription && store.heroDescription.trim().length > 0
      ? store.heroDescription
      : defaultHeroDescription;
  const heroHeadlineLines = heroHeadline.split("\n");

  // Determine alignment classes and width constraints based on heroTextAlign
  const getAlignmentClasses = () => {
    switch (store.heroTextAlign) {
      case "Center":
        return { wrapper: "text-center flex flex-col items-center", textWidth: "max-w-3xl" };
      case "Right":
        return { wrapper: "text-right flex flex-col items-end", textWidth: "max-w-2xl" };
      default:
        return { wrapper: "text-left", textWidth: "max-w-2xl" };
    }
  };

  const alignmentClasses = getAlignmentClasses();

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
          <div className={`relative h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] flex items-center ${store.heroTextAlign === "Center" ? "justify-center" : store.heroTextAlign === "Right" ? "justify-end" : ""}`}>
            <Image
              src={heroImageUrl}
              alt={store.storeName}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
            <div className={`relative px-6 sm:px-8 ${store.heroTextAlign === "Center" ? "" : store.heroTextAlign === "Right" ? "" : "w-full max-w-[1200px] mx-auto"}`}>
              <div className={`${alignmentClasses.wrapper} ${alignmentClasses.textWidth}`}>
                <p className="text-overline !text-white/60 mb-5 sm:mb-7 tracking-[0.2em]">Welcome to {store.storeName}</p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-7 tracking-tight font-medium">
                  {heroHeadlineLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < heroHeadlineLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-base sm:text-lg text-white/75 mb-10 sm:mb-12 leading-relaxed font-light max-w-xl">
                  {heroDescription}
                </p>
                <a 
                  href="#products"
                  className="btn-luxury !bg-white !text-foreground hover:!opacity-90 !rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className={`h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] flex items-center ${store.heroTextAlign === "Center" ? "justify-center" : store.heroTextAlign === "Right" ? "justify-end" : ""}`}>
            <div className={`px-6 sm:px-8 ${store.heroTextAlign === "Center" ? "" : store.heroTextAlign === "Right" ? "" : "w-full max-w-[1200px] mx-auto"}`}>
              <div className={`${alignmentClasses.wrapper} ${alignmentClasses.textWidth}`}>
                <p className="text-overline mb-5 sm:mb-7 tracking-[0.2em]">Welcome to {store.storeName}</p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] mb-7 tracking-tight font-medium">
                  {heroHeadlineLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < heroHeadlineLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-10 sm:mb-12 leading-relaxed max-w-xl">
                  {heroDescription}
                </p>
                <div className={`flex ${store.heroTextAlign === "Center" ? "justify-center" : store.heroTextAlign === "Right" ? "justify-end" : "flex-col sm:flex-row"} gap-4`}>
                  <a 
                    href="#products"
                    className="btn-luxury btn-primary-luxury"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="trust-badge">
              <span className="trust-icon">
                <Truck className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </span>
              <div>
                <span className="text-sm font-medium text-foreground">Free Shipping</span>
                <p className="text-xs text-muted-foreground mt-0.5">On all orders</p>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">
                <Shield className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </span>
              <div>
                <span className="text-sm font-medium text-foreground">Secure Checkout</span>
                <p className="text-xs text-muted-foreground mt-0.5">Encrypted payments</p>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">
                <RotateCcw className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </span>
              <div>
                <span className="text-sm font-medium text-foreground">30-Day Returns</span>
                <p className="text-xs text-muted-foreground mt-0.5">Hassle-free policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 sm:mb-14">
              <div>
                <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>Featured</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight font-medium">
                  New Arrivals
                </h2>
              </div>
              {products.length > 4 && (
                <Link
                  href="#products"
                  className="text-sm text-muted-foreground hover:text-foreground link-underline transition-colors duration-300 hidden sm:flex items-center gap-1.5"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 stagger-children">
              {featuredProducts.map((product) => {
                const primaryImageUrl = product.imageUrl ?? product.images?.[0]?.url;
                const secondaryImageUrl = product.images?.[1]?.url;

                return (
                  <div
                    key={product.id}
                    className="product-card group border border-border/60 bg-background overflow-hidden"
                  >
                    <Link href={`${productPath}/${product.id}`} className="block">
                      <div className="aspect-[3/4] relative bg-muted overflow-hidden rounded-t-[var(--radius-lg)]">
                        {primaryImageUrl ? (
                          <>
                            <Image
                              src={primaryImageUrl}
                              alt={product.name}
                              fill
                              className="object-cover product-image transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {secondaryImageUrl && (
                              <Image
                                src={secondaryImageUrl}
                                alt={`${product.name} alternate view`}
                                fill
                                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="text-sm sm:text-base text-foreground mb-2 line-clamp-1 font-medium">
                          {product.name}
                        </h3>
                        <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
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
                        stock={product.stock}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── All Products ─── */}
      <section id="products" className="py-16 sm:py-20 lg:py-28 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>Collection</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight mb-4 font-medium">
              All Products
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7 stagger-children">
              {products.map((product) => {
                const primaryImageUrl = product.imageUrl ?? product.images?.[0]?.url;
                const secondaryImageUrl = product.images?.[1]?.url;

                return (
                  <div
                    key={product.id}
                    className="product-card group border border-border/60 bg-background overflow-hidden"
                  >
                    <Link href={`${productPath}/${product.id}`} className="block">
                      <div className="aspect-[3/4] relative bg-muted overflow-hidden rounded-t-[var(--radius-lg)]">
                        {primaryImageUrl ? (
                          <>
                            <Image
                              src={primaryImageUrl}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover product-image transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {secondaryImageUrl && (
                              <Image
                                src={secondaryImageUrl}
                                alt={`${product.name} alternate view`}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="text-sm text-foreground mb-1.5 line-clamp-1 font-medium">
                          {product.name}
                        </h3>
                        <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
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
                        stock={product.stock}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-border bg-background">
              <p className="text-muted-foreground text-sm mb-1">No products yet</p>
              <p className="text-xs text-muted-foreground">Check back soon for new arrivals</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      {store.testimonials && store.testimonials.length > 0 && (
        <section id="testimonials" className="py-16 sm:py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>Testimonials</p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight font-medium">
                What Our Clients Say
              </h2>
            </div>

            <div className={store.testimonials.length === 1 ? "flex justify-center" : store.testimonials.length === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto" : "grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"}>
              {store.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className={`testimonial-card ${store.testimonials.length === 1 ? 'w-full md:w-1/2 lg:w-2/5' : ''}`}
                >
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-6">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: "var(--primary)" }}>
                      {testimonial.customerName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{testimonial.customerName}</p>
                      <p className="text-xs text-muted-foreground">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Shipping Locations ─── */}
      {store.shippingLocations && store.shippingLocations.length > 0 && (
        <ShippingLocationsDisplay locations={store.shippingLocations} />
      )}

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
      <section className="py-20 sm:py-28 lg:py-36">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center py-16 sm:py-20 px-6 sm:px-12 rounded-3xl bg-muted/50">
            <div className="w-10 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-5 font-medium">
              Begin your journey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-10 sm:mb-12 max-w-md mx-auto leading-relaxed">
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
        </div>
      </section>
    </div>
  );
}
