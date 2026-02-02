import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch store with theme
  const store = await prisma.store.findUnique({
    where: { subdomainSlug: username },
    include: { theme: true },
  });

  if (!store) {
    notFound();
  }

  // CSS variables for theming
  const themeStyles = store.theme
    ? ({
        "--primary": store.theme.primaryHex,
        "--secondary": store.theme.secondaryHex,
        "--font-family": store.theme.fontFamily,
      } as React.CSSProperties)
    : {};

  return (
    <div
      style={themeStyles}
      className="min-h-screen flex flex-col"
    >
      <style>{`
        :root {
          --primary: ${store.theme?.primaryHex || "#3b82f6"};
          --secondary: ${store.theme?.secondaryHex || "#8b5cf6"};
          --font-family: ${store.theme?.fontFamily || "Inter, sans-serif"};
        }
        .storefront {
          font-family: var(--font-family);
          background-color: #ffffff;
        }
        .storefront .btn-primary {
          background-color: var(--primary);
        }
        .storefront .btn-primary:hover {
          filter: brightness(0.9);
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
        <StorefrontNavbar storeName={store.storeName} slug={username} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter storeName={store.storeName} />
      </div>
    </div>
  );
}
