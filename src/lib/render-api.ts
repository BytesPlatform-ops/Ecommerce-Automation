/**
 * Render API Integration
 * Handles domain registration and SSL certificate management with Render's API
 */

const RENDER_API_BASE = "https://api.render.com/v1";
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

interface RenderDomainResponse {
  id: string;
  name: string;
  domainType: string;
  publicSuffix: string;
  redirectForName: string | null;
  verificationStatus: string;
  createdAt: string;
  server: {
    id: string;
    name: string;
  };
}

interface RenderErrorResponse {
  id: string;
  message: string;
}

/**
 * Add a custom domain to the Render service
 * This triggers Render to start generating an SSL certificate for the domain
 * 
 * @param domain - The domain to register (e.g., "example.com")
 * @returns The domain registration response or error
 */
export async function addDomainToRender(
  domain: string
): Promise<{ success: boolean; data?: RenderDomainResponse; error?: string }> {
  if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
    console.error("[Render API] RENDER_API_KEY or RENDER_SERVICE_ID is not set");
    return { success: false, error: "Render API not configured" };
  }

  try {
    console.log(`[Render API] Adding domain: ${domain} to service: ${RENDER_SERVICE_ID}`);

    const response = await fetch(
      `${RENDER_API_BASE}/services/${RENDER_SERVICE_ID}/custom-domains`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RENDER_API_KEY}`,
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as RenderErrorResponse;
      console.error(`[Render API] Error adding domain: ${errorData.message || response.statusText}`);
      return {
        success: false,
        error: errorData.message || `Failed to add domain (${response.status})`,
      };
    }

    console.log(`[Render API] Domain added successfully:`, data);
    return { success: true, data: data as RenderDomainResponse };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Render API] Exception while adding domain: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get domain status from Render
 * Can be used to check if SSL certificate is ready
 * 
 * @param domain - The domain to check
 * @returns The domain status or error
 */
export async function getDomainFromRender(
  domain: string
): Promise<{ success: boolean; data?: RenderDomainResponse; error?: string }> {
  if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
    console.error("[Render API] RENDER_API_KEY or RENDER_SERVICE_ID is not set");
    return { success: false, error: "Render API not configured" };
  }

  try {
    console.log(`[Render API] Getting domain status: ${domain}`);

    const response = await fetch(
      `${RENDER_API_BASE}/services/${RENDER_SERVICE_ID}/custom-domains/${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${RENDER_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Domain not found on Render" };
      }
      const errorData = await response.json() as RenderErrorResponse;
      console.error(`[Render API] Error getting domain: ${errorData.message || response.statusText}`);
      return {
        success: false,
        error: errorData.message || `Failed to get domain (${response.status})`,
      };
    }

    const data = await response.json();
    console.log(`[Render API] Domain status:`, data);
    return { success: true, data: data as RenderDomainResponse };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Render API] Exception while getting domain: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Remove a custom domain from the Render service
 * 
 * @param domain - The domain to remove
 * @returns Success or error
 */
export async function removeDomainFromRender(
  domain: string
): Promise<{ success: boolean; error?: string }> {
  if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
    console.error("[Render API] RENDER_API_KEY or RENDER_SERVICE_ID is not set");
    return { success: false, error: "Render API not configured" };
  }

  try {
    console.log(`[Render API] Removing domain: ${domain}`);

    const response = await fetch(
      `${RENDER_API_BASE}/services/${RENDER_SERVICE_ID}/custom-domains/${encodeURIComponent(domain)}`,
      {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${RENDER_API_KEY}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json() as RenderErrorResponse;
      console.error(`[Render API] Error removing domain: ${errorData.message || response.statusText}`);
      return {
        success: false,
        error: errorData.message || `Failed to remove domain (${response.status})`,
      };
    }

    console.log(`[Render API] Domain removed successfully`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Render API] Exception while removing domain: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
