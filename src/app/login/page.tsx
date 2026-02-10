import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
            Chameleon
          </Link>
          <h1 className="font-serif text-2xl text-foreground mt-8 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your store</p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground hover:opacity-70 transition-opacity duration-200 underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
