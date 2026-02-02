import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={`/stores/${username}`}
        className="inline-flex items-center gap-2 text-sm mb-8 opacity-70 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-lg">No image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-8">
            ${product.price.toFixed(2)}
          </p>

          <button className="btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity">
            Add to Cart
          </button>

          <p className="mt-4 text-sm opacity-60">
            * Cart functionality coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
