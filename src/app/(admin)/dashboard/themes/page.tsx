import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { ThemeSelector } from "@/components/dashboard/theme-selector";

export default async function ThemesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch store (cached) and themes in parallel
  const [store, themes] = await Promise.all([
    getOwnerStore(user.id),
    prisma.theme.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!store) {
    redirect("/onboarding");
  }

  return (
    <div>
      <div className="mb-8 dash-animate-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">Store Theme</h1>
        <p className="text-gray-500 mt-1">Choose a look for your storefront</p>
      </div>

      <ThemeSelector
        themes={themes}
        currentThemeId={store.themeId}
        storeId={store.id}
      />
    </div>
  );
}
