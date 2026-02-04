import { Store, Heart, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

interface StorefrontFooterProps {
  storeName: string;
  slug: string;
}

export function StorefrontFooter({ storeName, slug }: StorefrontFooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">{storeName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Quality products curated with care. Your trusted source for premium items.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Shop All Products
                </a>
              </li>
              <li>
                <a href={`/stores/${slug}/about`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers and updates about new products.
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ ["--tw-ring-color" as string]: "var(--primary)" }}
              />
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:shadow-md"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Subscribe
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@store.com" className="hover:text-white transition-colors">info@store.com</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="h-4 w-4" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="h-4 w-4" />
                <span>123 Store Street, City, Country</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{" "}
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
