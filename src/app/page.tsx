import Link from "next/link";
import { Zap, Palette, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Chameleon
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-luxury btn-primary-luxury !py-2 !px-5 !text-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 py-24 sm:py-32">
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          <p className="text-overline mb-6" style={{ color: "var(--primary, #1A1A1A)" }}>E-Commerce Platform</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-6 leading-[1.1] tracking-tight">
            Create Your Store
            <br />
            in 60 Seconds
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            A multi-tenant platform that lets you build a beautiful, customized
            e-commerce storefront instantly. Add products, choose a theme, start
            selling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-luxury btn-primary-luxury"
            >
              Start Building Free
            </Link>
            <Link
              href="/stores/demo"
              className="btn-luxury btn-outline-luxury"
            >
              View Demo Store
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-4xl mx-auto stagger-children">
          <div className="border border-border p-8 text-center">
            <div className="h-10 w-10 mx-auto mb-6 flex items-center justify-center">
              <Zap className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
              Lightning Fast
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Go from zero to a fully functional store in under a minute. No
              coding required.
            </p>
          </div>

          <div className="border border-border p-8 text-center">
            <div className="h-10 w-10 mx-auto mb-6 flex items-center justify-center">
              <Palette className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
              Beautiful Themes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose from professionally designed themes that make your store
              stand out.
            </p>
          </div>

          <div className="border border-border p-8 text-center">
            <div className="h-10 w-10 mx-auto mb-6 flex items-center justify-center">
              <Globe className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
              Your Unique URL
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get your own custom store URL instantly. Share it and start
              selling worldwide.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 py-12 mt-20 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-sm text-muted-foreground">Chameleon</span>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Chameleon. Built with Next.js &amp; Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
