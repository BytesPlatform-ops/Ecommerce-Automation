import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Store } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Chameleon</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-600">Start building your store today</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
