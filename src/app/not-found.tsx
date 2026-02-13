import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <p className="text-overline mb-4" style={{ color: "var(--primary, #1A1A1A)" }}>
          404
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-4 tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-luxury btn-primary-luxury">
          Go Home
        </Link>
      </div>
    </div>
  );
}
