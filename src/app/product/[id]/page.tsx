import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function ProductRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Get the domain from request headers
  const headersList = await headers();
  const hostname = headersList.get("host");

  if (!hostname) {
    redirect("/");
  }

  // Normalize domain (remove www., lowercase, etc.)
  let normalizedDomain = hostname.toLowerCase().trim();
  normalizedDomain = normalizedDomain.replace(/^www\./, "");
  normalizedDomain = normalizedDomain.split(":")[0];

  // Look up the store by domain with normalized variations
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { domain: normalizedDomain },
        { domain: `www.${normalizedDomain}` },
        { domain: hostname.toLowerCase() },
      ],
    },
    select: {
      subdomainSlug: true,
      domainStatus: true,
    },
  });

  if (!store) {
    // Store not found for this domain
    redirect("/");
  }

  // Redirect to the correct store product page
  // This allows domain-based access to work even if middleware rewrite fails
  redirect(`/stores/${store.subdomainSlug}/product/${id}`);
}
