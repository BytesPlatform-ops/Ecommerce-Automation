import { Heart, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

/** Only allow http/https URLs to prevent javascript: injection */
function safeSocialUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    // Invalid URL
  }
  return null;
}

interface StorefrontFooterProps {
  storeName: string;
  slug: string;
  aboutPath: string;
  contactPath: string;
  faqPath?: string;
  showFaq?: boolean;
  privacyPath?: string;
  showPrivacy?: boolean;
  shippingReturnsPath?: string;
  showShippingReturns?: boolean;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

export function StorefrontFooter({ 
  storeName, 
  slug, 
  aboutPath,
  contactPath,
  faqPath,
  showFaq,
  privacyPath,
  showPrivacy,
  shippingReturnsPath,
  showShippingReturns,
  instagramUrl,
  facebookUrl,
  twitterUrl,
  linkedinUrl,
  youtubeUrl,
}: StorefrontFooterProps) {
  const hasSocials = instagramUrl || facebookUrl || twitterUrl || linkedinUrl || youtubeUrl;

  // Sanitize all social URLs to prevent javascript: injection
  const safeInstagram = safeSocialUrl(instagramUrl);
  const safeFacebook = safeSocialUrl(facebookUrl);
  const safeTwitter = safeSocialUrl(twitterUrl);
  const safeLinkedin = safeSocialUrl(linkedinUrl);
  const safeYoutube = safeSocialUrl(youtubeUrl);

  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-serif text-lg tracking-tight mb-4">{storeName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Curated with intention. Every product selected for quality, design, and lasting value.
            </p>
            {hasSocials && (
              <div className="flex gap-4 mt-6">
                {safeInstagram && (
                  <a href={safeInstagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Instagram className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeFacebook && (
                  <a href={safeFacebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Facebook className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeTwitter && (
                  <a href={safeTwitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Twitter className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeLinkedin && (
                  <a href={safeLinkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeYoutube && (
                  <a href={safeYoutube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Youtube className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-overline mb-4">Navigation</p>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Shop
                </a>
              </li>
              <li>
                <a href={aboutPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-overline mb-4">Support</p>
            <ul className="space-y-3">
              {showShippingReturns && shippingReturnsPath && (
                <li>
                  <a href={shippingReturnsPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Shipping & Returns
                  </a>
                </li>
              )}
              {showFaq && faqPath && (
                <li>
                  <a href={faqPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    FAQ
                  </a>
                </li>
              )}
              {showPrivacy && privacyPath && (
                <li>
                  <a href={privacyPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
              )}
              <li>
                <a href={contactPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-overline mb-4">Stay Updated</p>
            <p className="text-sm text-muted-foreground mb-4">
              New arrivals and exclusive offers, delivered to your inbox.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 bg-background border border-border border-r-0 text-sm placeholder:text-muted-foreground focus:border-foreground transition-colors duration-200 min-w-0"
              />
              <button
                className="btn-luxury btn-primary-luxury !py-2.5 !px-4 !text-[11px] shrink-0"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {storeName}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Powered by
            <a
              href="/"
              target="_blank"
              className="text-foreground hover:opacity-70 transition-opacity duration-300 font-medium"
            >
              Chameleon
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
