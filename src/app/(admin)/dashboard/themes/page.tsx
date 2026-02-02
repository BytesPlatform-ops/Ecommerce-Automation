import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ThemeSelector } from "@/components/dashboard/theme-selector";

export default async function ThemesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  });

  if (!store) {
    redirect("/onboarding");
  }

  const themes = await prisma.theme.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Theme</h1>
        <p className="text-gray-600 mt-1">Choose a look for your storefront</p>
      </div>

      <ThemeSelector
        themes={themes}
        currentThemeId={store.themeId}
        storeId={store.id}
      />
    </div>
  );
}
