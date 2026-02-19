import Link from "next/link";
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
  homePath: string;
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
  homePath,
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
    <footer className="gradient-footer mt-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-serif text-xl tracking-tight mb-4 font-medium">{storeName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Curated with intention. Every product selected for quality, design, and lasting value.
            </p>
            {hasSocials && (
              <div className="flex gap-2.5 mt-6">
                {safeInstagram && (
                  <a href={safeInstagram} target="_blank" rel="noopener noreferrer" className="social-icon-btn-themed text-muted-foreground">
                    <Instagram className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeFacebook && (
                  <a href={safeFacebook} target="_blank" rel="noopener noreferrer" className="social-icon-btn-themed text-muted-foreground">
                    <Facebook className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeTwitter && (
                  <a href={safeTwitter} target="_blank" rel="noopener noreferrer" className="social-icon-btn-themed text-muted-foreground">
                    <Twitter className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeLinkedin && (
                  <a href={safeLinkedin} target="_blank" rel="noopener noreferrer" className="social-icon-btn-themed text-muted-foreground">
                    <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
                {safeYoutube && (
                  <a href={safeYoutube} target="_blank" rel="noopener noreferrer" className="social-icon-btn-themed text-muted-foreground">
                    <Youtube className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-overline mb-5">Navigation</p>
            <ul className="space-y-3.5">
              <li>
                <Link href={homePath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`${homePath}#products`} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
                  Shop
                </Link>
              </li>
              <li>
                <Link href={aboutPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-overline mb-5">Support</p>
            <ul className="space-y-3.5">
              {showShippingReturns && shippingReturnsPath && (
                <li>
                  <Link href={shippingReturnsPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Shipping & Returns
                  </Link>
                </li>
              )}
              {showFaq && faqPath && (
                <li>
                  <Link href={faqPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    FAQ
                  </Link>
                </li>
              )}
              {showPrivacy && privacyPath && (
                <li>
                  <Link href={privacyPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
              )}
              <li>
                <Link href={contactPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-overline mb-5">Stay Updated</p>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              New arrivals and exclusive offers, delivered to your inbox.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-background border border-border text-sm placeholder:text-muted-foreground transition-colors duration-200 min-w-0 footer-newsletter-input newsletter-input-themed"
              />
              <button
                className="btn-luxury btn-primary-luxury !py-3 !px-5 !text-[11px] shrink-0 footer-newsletter-btn !rounded-l-none"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="section-divider mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {storeName}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Powered by
            <a
              href="/"
              target="_blank"
              className="text-foreground hover:opacity-70 transition-opacity duration-300 font-semibold"
            >
              Bytescart
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
