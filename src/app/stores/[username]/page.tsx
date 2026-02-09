import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Star, TrendingUp, Award, Zap, Package, Clock, Shield } from "lucide-react";
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

  // Cast store to include heroImageUrl for now (Prisma types being updated)
  const storeWithHero = store as any;
  const heroImageUrl = storeWithHero.heroImageUrl;

  const products = store.products;
  const featuredProducts = products.slice(0, 6);
  const latestProducts = products.slice(0, 12);

  // Simple URL pattern based on domain type
  const productPath = onCustomDomain ? "/product" : `/stores/${username}/product`;
  const storePath = onCustomDomain ? "/" : `/stores/${username}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-6 sm:py-10 md:py-12 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={store.storeName}
              fill
              className="object-cover absolute inset-0"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <>
            <div 
              className="absolute inset-0 opacity-5"
              style={{ 
                background: `radial-gradient(circle at 30% 50%, var(--primary) 0%, transparent 50%), 
                             radial-gradient(circle at 70% 80%, var(--secondary) 0%, transparent 50%)` 
              }}
            />
            <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 -z-10" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20 -z-10" />
          </>
        )}
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-6 backdrop-blur-md border border-white/50"
              style={{ backgroundColor: "var(--primary)", color: "white", opacity: 0.95 }}
            >
              ✨ Welcome to our store
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r mb-3 sm:mb-6 leading-tight ${
              heroImageUrl 
                ? "from-white via-white to-gray-200" 
                : "from-gray-900 via-gray-800 to-gray-600"
            }`}>
              {store.storeName}
            </h1>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-2 sm:mb-4 leading-relaxed font-light ${
              heroImageUrl ? "text-white" : "text-gray-600"
            }`}>
              Discover our curated collection of premium products crafted with quality and care
            </p>
            <p className={`text-xs sm:text-sm max-w-2xl mx-auto mb-5 sm:mb-8 ${
              heroImageUrl ? "text-gray-200" : "text-gray-500"
            }`}>
              Shop with confidence from a trusted storefront with thousands of satisfied customers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <a 
                href="#products"
                className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-white font-bold text-sm sm:text-base transition-all hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto justify-center"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a 
                href="#testimonials"
                className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all border-2 hover:bg-gray-50 active:scale-95 bg-white w-full sm:w-auto justify-center"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                See Reviews
                <Star className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-6 sm:py-10 md:py-16 lg:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <div 
                  className="p-2 sm:p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                Trending Now
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Our most popular picks right now</p>
            </div>
            {products && products.length > 4 && (
              <Link
                href="#products"
                className="text-xs sm:text-sm font-bold transition-all hover:scale-105 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
                style={{ color: "var(--primary)" }}
              >
                View All →
              </Link>
            )}
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 lg:gap-6">
              {featuredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <Link
                    href={`${productPath}/${product.id}`}
                    className="block"
                  >
                    <div className="aspect-square relative bg-gray-100 overflow-hidden">
                      {idx === 0 && (
                        <div 
                          className="absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-bold text-white z-10 shadow-lg"
                          style={{ backgroundColor: "var(--primary)" }}
                        >
                          🔥 Hot
                        </div>
                      )}
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-125 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 font-medium">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <div className="p-3 sm:p-4 md:p-5 pb-2 md:pb-3">
                      <h3 className="font-bold text-base sm:text-lg md:text-lg text-gray-900 mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
                        {product.name}
                      </h3>
                      <p 
                        className="text-lg sm:text-xl md:text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
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
          ) : null}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 sm:py-10 md:py-16 border-y border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 mb-1">
                {products?.length || 0}+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Premium Products</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-1" style={{ color: "var(--primary)" }}>
                4.9★
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Customer Rating</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 mb-1">
                10K+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 mb-1">
                100%
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section id="products" className="py-6 sm:py-10 md:py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center justify-center gap-2">
              <div 
                className="p-1.5 sm:p-2.5 rounded-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Award className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              All Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto px-2">
              Explore our complete collection of premium items
            </p>
          </div>

          {/* Product Search */}
          <div className="mb-5 sm:mb-8 max-w-2xl mx-auto">
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

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 lg:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <Link
                    href={`${productPath}/${product.id}`}
                    className="block"
                  >
                    <div className="aspect-square relative bg-gray-100 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 font-medium">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="p-2.5 sm:p-3 md:p-4 pb-1.5 md:pb-2">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p 
                        className="text-sm sm:text-base font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-2.5 sm:px-3 md:px-4 pb-2.5 sm:pb-3 md:pb-4">
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
            <div className="text-center py-12 sm:py-16 md:py-20 bg-white rounded-2xl border border-gray-100">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">No products yet</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">Check back soon for amazing products!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-6 sm:py-10 md:py-16 lg:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">What Our Customers Say</h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto px-2">
              Join thousands of satisfied customers who love shopping with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                name: "Sarah Anderson",
                role: "Verified Buyer",
                content: "Amazing quality products and excellent customer service. Highly recommend!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Verified Buyer",
                content: "Fast shipping and the products exceeded my expectations. Will definitely order again.",
                rating: 5,
              },
              {
                name: "Emma Thompson",
                role: "Verified Buyer",
                content: "Great selection and competitive prices. The best online shopping experience!",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-2 sm:mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">\"{testimonial.content}\"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection
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

      {/* CTA Section */}
      <section className="py-6 sm:py-10 md:py-16 lg:py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: "var(--primary)", opacity: 0.95 }}
        />
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 50%, white 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-white rounded-full blur-3xl opacity-10 -mr-10 sm:-mr-20 md:-mr-40 -mt-10 sm:-mt-20 md:-mt-40" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-white rounded-full blur-3xl opacity-10 -ml-10 sm:-ml-20 md:-ml-40 -mb-10 sm:-mb-20 md:-mb-40" />
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 leading-tight">
              Ready to explore?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mb-5 sm:mb-8 font-light px-2">
              Browse our collection and find your next favorite product
            </p>
            <a 
              href="#products"
              className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white font-bold text-xs sm:text-sm md:text-base transition-all hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg"
              style={{ color: "var(--primary)" }}
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
