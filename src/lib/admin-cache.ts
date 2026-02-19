import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Deduplicated auth check — React cache() ensures getUser() is called
 * only once per request even if both layout.tsx and page.tsx invoke it.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Deduplicated store fetch — called by both the admin layout and
 * dashboard page, but the DB hit happens only once per request.
 */
export const getOwnerStore = cache(async (ownerId: string) => {
  return prisma.store.findFirst({
    where: { ownerId },
    include: { theme: true },
  });
});
