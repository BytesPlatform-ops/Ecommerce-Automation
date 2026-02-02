interface StorefrontFooterProps {
  storeName: string;
}

export function StorefrontFooter({ storeName }: StorefrontFooterProps) {
  return (
    <footer className="border-t border-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="text-sm opacity-60">
            Powered by{" "}
            <a
              href="/"
              target="_blank"
              className="font-medium hover:opacity-100 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              Chameleon
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
