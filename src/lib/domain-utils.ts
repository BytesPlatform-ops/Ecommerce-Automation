// Domain Status Constants
export const DOMAIN_STATUS = {
  PENDING: "Pending",
  VERIFYING: "Verifying",
  SECURING: "Securing",
  LIVE: "Live",
} as const;

export type DomainStatus = (typeof DOMAIN_STATUS)[keyof typeof DOMAIN_STATUS];

// Render Configuration
export const RENDER_CONFIG = {
  SERVICE_ID: process.env.RENDER_SERVICE_ID || "srv-d613777gi27c73e1loq0",
  // Standard Render IP for A Record
  IP_ADDRESS: "216.24.57.1",
  // CNAME target for www subdomain
  get CNAME_TARGET() {
    return `${this.SERVICE_ID}.onrender.com`;
  },
};

/**
 * Validates domain format (e.g., example.com, my-store.co.uk)
 * Allows alphanumeric characters, hyphens, and dots
 * Must have at least one dot and a valid TLD (2-63 chars)
 */
export function validateDomainFormat(domain: string): {
  valid: boolean;
  error?: string;
} {
  if (!domain || typeof domain !== "string") {
    return { valid: false, error: "Domain is required" };
  }

  // Remove any protocol or path
  const cleanDomain = normalizeDomain(domain);

  if (cleanDomain.length < 4) {
    return { valid: false, error: "Domain is too short" };
  }

  if (cleanDomain.length > 253) {
    return { valid: false, error: "Domain is too long (max 253 characters)" };
  }

  // Domain regex: alphanumeric and hyphens, dots as separators, valid TLD
  const domainRegex =
    /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,63}$/;

  if (!domainRegex.test(cleanDomain)) {
    return {
      valid: false,
      error:
        "Invalid domain format. Use format like: example.com or my-store.co.uk",
    };
  }

  // Check for consecutive dots
  if (cleanDomain.includes("..")) {
    return { valid: false, error: "Domain cannot have consecutive dots" };
  }

  // Check each label (part between dots)
  const labels = cleanDomain.split(".");
  for (const label of labels) {
    if (label.startsWith("-") || label.endsWith("-")) {
      return {
        valid: false,
        error: "Domain labels cannot start or end with hyphens",
      };
    }
  }

  return { valid: true };
}

/**
 * Normalizes domain by removing protocol, www, trailing slashes, and lowercasing
 */
export function normalizeDomain(domain: string): string {
  let normalized = domain.trim().toLowerCase();

  // Remove protocol (http://, https://)
  normalized = normalized.replace(/^https?:\/\//, "");

  // Remove www. prefix
  normalized = normalized.replace(/^www\./, "");

  // Remove trailing slash and path
  normalized = normalized.split("/")[0];

  // Remove port if present
  normalized = normalized.split(":")[0];

  return normalized;
}

/**
 * Get user-friendly status message for each domain status
 */
export function getStatusMessage(status: DomainStatus): string {
  switch (status) {
    case DOMAIN_STATUS.PENDING:
      return "Domain added. Please add the DNS records below to your domain registrar.";
    case DOMAIN_STATUS.VERIFYING:
      return "We're checking if your DNS records have propagated. This can take 15-60 minutes.";
    case DOMAIN_STATUS.SECURING:
      return "DNS verified! We're generating your SSL certificate. Your store will be live in 2-5 minutes.";
    case DOMAIN_STATUS.LIVE:
      return "Your custom domain is live and secured with SSL!";
    default:
      return "Unknown status";
  }
}

/**
 * Get status badge color classes for Tailwind
 */
export function getStatusColor(status: DomainStatus): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case DOMAIN_STATUS.PENDING:
      return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" };
    case DOMAIN_STATUS.VERIFYING:
      return { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" };
    case DOMAIN_STATUS.SECURING:
      return { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" };
    case DOMAIN_STATUS.LIVE:
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" };
  }
}
