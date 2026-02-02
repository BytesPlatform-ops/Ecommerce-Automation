import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch store with products
  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!store) {
    notFound();
  }

  const products = store.products;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{store.storeName}</h1>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          Welcome to our store. Browse our collection of amazing products.
        </p>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/stores/${username}/product/${product.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative bg-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg opacity-70">No products available yet.</p>
        </div>
      )}
    </div>
  );
}
