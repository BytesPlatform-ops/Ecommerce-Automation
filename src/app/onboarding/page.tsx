import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has a store
  const existingStore = await prisma.store.findFirst({
    where: { ownerId: user.id },
  });

  if (existingStore) {
    redirect("/dashboard");
  }

  // Get available themes for selection
  const themes = await prisma.theme.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Store
          </h1>
          <p className="text-gray-600">
            Set up your storefront in under 60 seconds
          </p>
        </div>

        <OnboardingForm themes={themes || []} userId={user.id} />
      </div>
    </div>
  );
}
