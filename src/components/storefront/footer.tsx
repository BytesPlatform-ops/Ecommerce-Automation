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
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
              <div 
                className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Store className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-bold text-sm sm:text-lg text-white">{storeName}</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
              Quality products curated with care. Your trusted source for premium items.
            </p>
            {(facebookUrl || twitterUrl || instagramUrl || linkedinUrl || youtubeUrl) && (
              <div className="flex sm:gap-3">
                {facebookUrl && (
                  <a 
                    href={facebookUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </a>
                )}
                {twitterUrl && (
                  <a 
                    href={twitterUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </a>
                )}
                {instagramUrl && (
                  <a 
                    href={instagramUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Instagram className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </a>
                )}
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </a>
                )}
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Youtube className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
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
            <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-1.5 sm:space-y-2">
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
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-white mb-2.5 sm:mb-4 text-sm sm:text-base">Stay Updated</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-2.5 sm:mb-3">
              Subscribe to get special offers and updates about new products.
            </p>
            <div className="flex gap-1.5 mb-3 sm:mb-4 flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ ["--tw-ring-color" as string]: "var(--primary)" }}
              />
              <button 
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white font-medium text-xs sm:text-sm transition-all hover:shadow-md whitespace-nowrap"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Subscribe
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-start sm:items-center gap-2 text-gray-400 text-xs">
                <Mail className="h-3 w-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                <a href="mailto:info@store.com" className="hover:text-white transition-colors break-all">info@store.com</a>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-gray-400 text-xs">
                <Phone className="h-3 w-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-gray-400 text-xs">
                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span>123 Store Street, City, Country</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4 sm:pt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1 flex-wrap">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 flex-shrink-0" />
            <span>using</span>
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center font-semibold hover:underline transition-colors"
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
