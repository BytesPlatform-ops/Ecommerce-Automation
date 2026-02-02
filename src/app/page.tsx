import Link from "next/link";
import { Store, Zap, Palette, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Chameleon</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Your Store in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              60 Seconds
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A multi-tenant SaaS platform that lets you build a beautiful,
            customized e-commerce storefront instantly. Just add your products
            and choose a theme.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-600/25"
            >
              Start Building Free
            </Link>
            <Link
              href="/stores/demo"
              className="text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              View Demo Store →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Lightning Fast Setup
            </h3>
            <p className="text-gray-600">
              Go from zero to a fully functional store in under a minute. No
              coding required, no complex configurations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Palette className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Beautiful Themes
            </h3>
            <p className="text-gray-600">
              Choose from professionally designed themes that make your store
              stand out. Switch themes instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Globe className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Your Unique URL
            </h3>
            <p className="text-gray-600">
              Get your own custom store URL instantly. Share it anywhere and
              start selling to customers worldwide.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-gray-400" />
            <span className="text-gray-600 font-medium">Chameleon</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Chameleon. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
