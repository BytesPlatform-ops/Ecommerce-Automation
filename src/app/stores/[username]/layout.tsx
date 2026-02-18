import { notFound } from "next/navigation";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CartProvider } from "@/components/storefront/cart-context";
import { CheckoutSuccessHandler } from "@/components/storefront/checkout-success-handler";
import { sanitizeHexColor, sanitizeFontFamily } from "@/lib/security";
import { getStoreBySlug, getStoreSectionCounts, checkIsCustomDomain } from "@/lib/store-cache";

// Map theme font families to Google Fonts URL-safe names
function getGoogleFontUrl(fontFamily: string | null | undefined): string | null {
  if (!fontFamily) return null;
  const font = fontFamily.trim();
  // These are already loaded via next/font/google in root layout
  const preloaded = ["Inter", "Playfair Display"];
  if (preloaded.includes(font)) return null;
  // System fonts don't need loading
  const systemFonts = ["Georgia", "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana"];
  if (systemFonts.includes(font)) return null;
  // Build Google Fonts URL for the theme font
  const encoded = font.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700&display=swap`;
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const onCustomDomain = await checkIsCustomDomain();

  // Fetch store with theme and products (cached — shared with page.tsx)
  const store = await getStoreBySlug(username);

  if (!store) {
    notFound();
  }

  // Determine correct paths based on domain type
  const aboutPath = onCustomDomain ? "/about" : `/stores/${username}/about`;
  const homePath = onCustomDomain ? "/" : `/stores/${username}`;
  const productPath = onCustomDomain ? "/product" : `/stores/${username}/product`;
  const faqPath = onCustomDomain ? "/faq" : `/stores/${username}/faq`;
  const privacyPath = onCustomDomain ? "/privacy" : `/stores/${username}/privacy`;
  const shippingReturnsPath = onCustomDomain ? "/shipping-returns" : `/stores/${username}/shipping-returns`;
  const contactPath = onCustomDomain ? "/contact" : `/stores/${username}/contact`;

  // Parallelized & cached section counts
  const { faqCount, privacyCount, shippingReturnsCount } = await getStoreSectionCounts(store.id);

  // Convert Decimal prices to numbers for client component
  const plainProducts = store.products.map(p => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: Number(p.price),
  }));

  // Helper function to safely sanitize hex color values
  const primaryColor = sanitizeHexColor(store.theme?.primaryHex, "#1A1A1A");
  const secondaryColor = sanitizeHexColor(store.theme?.secondaryHex, "#737373");
  const fontFamily = sanitizeFontFamily(store.theme?.fontFamily);

  // Load theme font from Google Fonts if not already preloaded
  const googleFontUrl = getGoogleFontUrl(store.theme?.fontFamily);

  // CSS variables for theming (using sanitized values)
  const themeStyles = store.theme
    ? ({
        "--primary": primaryColor,
        "--secondary": secondaryColor,
        "--font-family": fontFamily,
      } as React.CSSProperties)
    : {};

  return (
    <div
      style={themeStyles}
      className="min-h-screen flex flex-col"
    >
      {/* Load theme font from Google Fonts */}
      {googleFontUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontUrl} rel="stylesheet" />
        </>
      )}
      <style>{`
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
          --font-family: ${fontFamily};
          --primary-light: ${primaryColor}15;
          --primary-medium: ${primaryColor}25;
          --secondary-light: ${secondaryColor}15;
          --secondary-medium: ${secondaryColor}25;
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
        .storefront .text-secondary {
          color: var(--secondary);
        }
        .storefront .bg-secondary {
          background-color: var(--secondary);
        }
        .storefront .border-secondary {
          border-color: var(--secondary);
        }
      `}</style>
      <div className="storefront flex flex-col min-h-screen">
        <CartProvider>
          <CheckoutSuccessHandler />
          <StorefrontNavbar 
            storeName={store.storeName} 
            storeLogoUrl={store.storeLogoUrl}
            slug={username} 
            storeId={store.id} 
            aboutPath={aboutPath} 
            contactPath={contactPath}
            homePath={homePath}
            products={plainProducts}
            productPath={productPath}
          />
          <main className="flex-1">{children}</main>
          <StorefrontFooter 
            storeName={store.storeName} 
            slug={username} 
            homePath={homePath}
            aboutPath={aboutPath}
            contactPath={contactPath}
            faqPath={faqPath}
            showFaq={faqCount > 0}
            privacyPath={privacyPath}
            showPrivacy={privacyCount > 0}
            shippingReturnsPath={shippingReturnsPath}
            showShippingReturns={shippingReturnsCount > 0}
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
