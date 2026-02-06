import { Store, Heart, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Linkedin, Youtube } from "lucide-react";

interface StorefrontFooterProps {
  storeName: string;
  slug: string;
  aboutPath: string;
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
  instagramUrl,
  facebookUrl,
  twitterUrl,
  linkedinUrl,
  youtubeUrl,
}: StorefrontFooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800 mt-12 sm:mt-14 md:mt-16 lg:mt-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-white">{storeName}</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Quality products curated with care. Your trusted source for premium items.
            </p>
            {(facebookUrl || twitterUrl || instagramUrl || linkedinUrl || youtubeUrl) && (
              <div className="flex gap-3 sm:gap-4">
                {facebookUrl && (
                  <a 
                    href={facebookUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                )}
                {twitterUrl && (
                  <a 
                    href={twitterUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                )}
                {instagramUrl && (
                  <a 
                    href={instagramUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                )}
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                )}
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Shop All Products
                </a>
              </li>
              <li>
                <a href={aboutPath} className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="xs:col-span-2 sm:col-span-1">
            <h4 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">Stay Updated</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              Subscribe to get special offers and updates about new products.
            </p>
            <div className="flex gap-2 mb-4 sm:mb-6 flex-col xs:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ ["--tw-ring-color" as string]: "var(--primary)" }}
              />
              <button 
                className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium text-xs sm:text-sm transition-all hover:shadow-md whitespace-nowrap"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Subscribe
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <a href="mailto:info@store.com" className="hover:text-white transition-colors break-all">info@store.com</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a>
              </div>
              <div className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                <span>123 Store Street, City, Country</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            Made with <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500 flex-shrink-0" /> using{" "}
            <a
              href="/"
              target="_blank"
              className="font-semibold hover:underline transition-colors"
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
