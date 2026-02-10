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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <span className="font-serif text-2xl tracking-tight text-foreground">Chameleon</span>
          <h1 className="font-serif text-3xl text-foreground mt-8 mb-3">
            Create Your Store
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your storefront in under 60 seconds
          </p>
        </div>

        <OnboardingForm themes={themes || []} userId={user.id} />
      </div>
    </div>
  );
}
