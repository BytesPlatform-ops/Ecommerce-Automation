import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Star, TrendingUp, Award, Zap, Package, Clock, Shield } from "lucide-react";

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

  const products = store.products;
  const featuredProducts = products.slice(0, 6);
  const latestProducts = products.slice(0, 12);

  // Simple URL pattern based on domain type
  const productPath = onCustomDomain ? "/product" : `/stores/${username}/product`;
  const storePath = onCustomDomain ? "/" : `/stores/${username}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-40 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            background: `radial-gradient(circle at 30% 50%, var(--primary) 0%, transparent 50%), 
                         radial-gradient(circle at 70% 80%, var(--secondary) 0%, transparent 50%)` 
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold mb-6 backdrop-blur-md border border-white/50"
              style={{ backgroundColor: "var(--primary)", color: "white", opacity: 0.95 }}
            >
              ✨ Welcome to our store
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 mb-6 leading-tight">
              {store.storeName}
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto mb-4 leading-relaxed font-light">
              Discover our curated collection of premium products crafted with quality and care
            </p>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-8">
              Shop with confidence from a trusted storefront with thousands of satisfied customers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-all hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </a>
              <a 
                href="#testimonials"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all border-2 hover:bg-gray-50 active:scale-95 bg-white"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                See Reviews
                <Star className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                Trending Now
              </h2>
              <p className="text-gray-600">Our most popular picks right now</p>
            </div>
            {products && products.length > 4 && (
              <Link
                href="#products"
                className="text-sm font-bold transition-all hover:scale-105 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                style={{ color: "var(--primary)" }}
              >
                View All →
              </Link>
            )}
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`${productPath}/${product.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
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
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        ${Number(product.price).toFixed(2)}
                      </p>
                      <span 
                        className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
                        style={{ color: "var(--primary)" }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-y border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {products?.length || 0}+
              </p>
              <p className="text-gray-600 font-medium">Premium Products</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold" style={{ color: "var(--primary)" }}>
                4.9★
              </p>
              <p className="text-gray-600 font-medium">Customer Rating</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                10K+
              </p>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                100%
              </p>
              <p className="text-gray-600 font-medium">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section id="products" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Award className="h-7 w-7 text-white" />
              </div>
              All Products
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Explore our complete collection of premium items
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`${productPath}/${product.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p 
                        className="text-xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        ${Number(product.price).toFixed(2)}
                      </p>
                      <span 
                        className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--primary)" }}
                      >
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500">Check back soon for amazing products!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Join thousands of satisfied customers who love shopping with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: "var(--primary)", opacity: 0.95 }}
        />
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 50%, white 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl opacity-10 -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl opacity-10 -ml-40 -mb-40" />
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to explore?
            </h2>
            <p className="text-white/90 text-lg mb-8 font-light">
              Browse our collection and find your next favorite product
            </p>
            <a 
              href="#products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white font-bold text-lg transition-all hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg"
              style={{ color: "var(--primary)" }}
            >
              Start Shopping
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
