import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
            Chameleon
          </Link>
          <h1 className="font-serif text-2xl text-foreground mt-8 mb-2">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">Start building your store today</p>
        </div>

        <SignupForm />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:opacity-70 transition-opacity duration-200 underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
