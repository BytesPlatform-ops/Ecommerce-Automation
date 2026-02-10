import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CartProvider } from "@/components/storefront/cart-context";
import { CheckoutSuccessHandler } from "@/components/storefront/checkout-success-handler";

// Check if we're on a custom domain
async function isCustomDomain() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const isRender = host.includes("ecommerce-automation-wt2l.onrender.com");
  return !isLocal && !isRender;
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const onCustomDomain = await isCustomDomain();

  // Fetch store with theme and products
  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
    include: { 
      theme: true,
      products: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!store) {
    notFound();
  }

  // Determine correct paths based on domain type
  const aboutPath = onCustomDomain ? "/about" : `/stores/${username}/about`;
  const homePath = onCustomDomain ? "/" : `/stores/${username}`;
  const productPath = onCustomDomain ? "/product" : `/stores/${username}/product`;
  const faqPath = onCustomDomain ? "/faq" : `/stores/${username}/faq`;
  const privacyPath = onCustomDomain ? "/privacy" : `/stores/${username}/privacy`;

  const faqCount = await prisma.storeFaq.count({
    where: { storeId: store.id, isPublished: true },
  });

  const privacyCount = await prisma.storePrivacySection.count({
    where: { storeId: store.id },
  });

  // Convert Decimal prices to numbers for client component
  const plainProducts = store.products.map(p => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: Number(p.price),
  }));

  // Helper function to ensure hex codes have # prefix
  const formatHex = (hex: string | null | undefined) => {
    if (!hex) return undefined;
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  // CSS variables for theming
  const themeStyles = store.theme
    ? ({
        "--primary": formatHex(store.theme.primaryHex),
        "--secondary": formatHex(store.theme.secondaryHex),
        "--font-family": store.theme.fontFamily,
      } as React.CSSProperties)
    : {};

  const primaryColor = formatHex(store.theme?.primaryHex) || "#1A1A1A";
  const secondaryColor = formatHex(store.theme?.secondaryHex) || "#737373";

  return (
    <div
      style={themeStyles}
      className="min-h-screen flex flex-col"
    >
      <style>{`
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
          --font-family: ${store.theme?.fontFamily || "var(--font-inter), sans-serif"};
        }
        .storefront {
          font-family: var(--font-family);
          background-color: var(--background);
          color: var(--foreground);
        }
        .storefront .btn-primary {
          background-color: var(--primary);
        }
        .storefront .btn-primary:hover {
          opacity: 0.85;
        }
        .storefront .text-primary {
          color: var(--primary);
        }
        .storefront .bg-primary {
          background-color: var(--primary);
        }
        .storefront .border-primary {
          border-color: var(--primary);
        }
      `}</style>
      <div className="storefront flex flex-col min-h-screen">
        <CartProvider>
          <CheckoutSuccessHandler />
          <StorefrontNavbar 
            storeName={store.storeName} 
            slug={username} 
            storeId={store.id} 
            aboutPath={aboutPath} 
            homePath={homePath}
            products={plainProducts}
            productPath={productPath}
          />
          <main className="flex-1">{children}</main>
          <StorefrontFooter 
            storeName={store.storeName} 
            slug={username} 
            aboutPath={aboutPath}
            faqPath={faqPath}
            showFaq={faqCount > 0}
            privacyPath={privacyPath}
            showPrivacy={privacyCount > 0}
            instagramUrl={(store as any).instagramUrl}
            facebookUrl={(store as any).facebookUrl}
            twitterUrl={(store as any).twitterUrl}
            linkedinUrl={(store as any).linkedinUrl}
            youtubeUrl={(store as any).youtubeUrl}
          />
        </CartProvider>
      </div>
    </div>
  );
}
