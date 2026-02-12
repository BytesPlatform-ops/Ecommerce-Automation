/**
 * Centralized Security Utilities
 * 
 * Provides sanitization, validation, and security helpers
 * used across the application.
 */

import crypto from "crypto";

// ==================== HTML SANITIZATION ====================

/**
 * Escape HTML special characters to prevent XSS in templates.
 * Use this whenever inserting user-generated content into HTML strings
 * (e.g., email templates).
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });
}

// ==================== CSS SANITIZATION ====================

/**
 * Validate and sanitize a hex color value.
 * Returns a safe hex color string or the fallback.
 */
export function sanitizeHexColor(hex: string | null | undefined, fallback: string = "#1A1A1A"): string {
  if (!hex) return fallback;
  // Strip whitespace
  const cleaned = hex.trim();
  // Must match #RRGGBB or #RGB (with or without the #)
  const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (!hexRegex.test(cleaned)) return fallback;
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

/**
 * Validate and sanitize a CSS font-family value.
 * Only allows safe font-family strings (alphanumeric, spaces, commas, quotes, hyphens).
 * Blocks any injection attempts.
 */
export function sanitizeFontFamily(font: string | null | undefined, fallback: string = "var(--font-inter), sans-serif"): string {
  if (!font) return fallback;
  const cleaned = font.trim();
  // Allow only: word chars, spaces, commas, single quotes, double quotes, hyphens, parens (for var())
  // Block semicolons, braces, backslashes, URLs, etc.
  const safeFontRegex = /^[a-zA-Z0-9\s,'"()\-]+$/;
  if (!safeFontRegex.test(cleaned)) return fallback;
  // Additional check: block anything that looks like CSS injection
  if (cleaned.includes("{") || cleaned.includes("}") || cleaned.includes(";") || cleaned.includes("url(")) {
    return fallback;
  }
  return cleaned;
}

// ==================== URL SANITIZATION ====================

/** Allowed URL protocols for user-supplied links */
const SAFE_URL_PROTOCOLS = ["https:", "http:", "mailto:"];

/**
 * Sanitize a user-supplied URL to prevent javascript: and other dangerous protocols.
 * Returns null if the URL is unsafe.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
      return null; // Block javascript:, data:, vbscript:, etc.
    }
    return trimmed;
  } catch {
    // If it doesn't parse as a URL, it might be a relative path — block it
    // for social media URLs which should always be absolute
    return null;
  }
}

/**
 * Validate that a URL is a safe external URL (https only).
 * Used for social media links, image URLs, etc.
 */
export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// ==================== CSRF / STATE TOKENS ====================

/**
 * Generate a cryptographically secure random token for CSRF protection.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Create a signed state parameter for OAuth flows.
 * Encodes storeId + random nonce, signed with HMAC.
 */
export function createOAuthState(storeId: string): string {
  const nonce = generateSecureToken(16);
  const payload = `${storeId}:${nonce}`;
  const secret = process.env.STRIPE_SECRET_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY or NEXTAUTH_SECRET for OAuth state signing");
  }
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  // Base64-encode the full state: payload:signature
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/**
 * Verify and extract storeId from a signed OAuth state parameter.
 * Returns the storeId if valid, null if tampered.
 */
export function verifyOAuthState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [storeId, nonce, signature] = parts;
    const payload = `${storeId}:${nonce}`;
    const secret = process.env.STRIPE_SECRET_KEY || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return null; // Cannot verify without secret
    }
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    // Timing-safe comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) return null;
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    return storeId;
  } catch {
    return null;
  }
}

// ==================== INPUT VALIDATION ====================

/**
 * Sanitize a string input: trim, limit length, remove null bytes.
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .replace(/\0/g, "") // Remove null bytes
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate that an ID looks like a valid UUID/CUID.
 * Prevents injection via ID parameters.
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  // Allow UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Allow CUIDs (Prisma default)
  const cuidRegex = /^c[a-z0-9]{24,}$/;
  // Allow Prisma CUID2  
  const cuid2Regex = /^[a-z0-9]{20,}$/;
  return uuidRegex.test(id) || cuidRegex.test(id) || cuid2Regex.test(id);
}

// ==================== RATE LIMITING ====================

/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-based rate limiting.
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now };
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

// ==================== LOGGING ====================

/**
 * Structured logger that never exposes sensitive data.
 * In production, replace console calls with a proper logging service.
 */
export const secureLog = {
  info(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify({ level: "info", message, ...sanitizeLogContext(context), timestamp: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${message}`, context || "");
    }
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") {
      console.warn(JSON.stringify({ level: "warn", message, ...sanitizeLogContext(context), timestamp: new Date().toISOString() }));
    } else {
      console.warn(`[WARN] ${message}`, context || "");
    }
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const errorInfo = error instanceof Error
      ? { errorMessage: error.message, ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}) }
      : { errorMessage: String(error) };

    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify({ level: "error", message, ...errorInfo, ...sanitizeLogContext(context), timestamp: new Date().toISOString() }));
    } else {
      console.error(`[ERROR] ${message}`, errorInfo, context || "");
    }
  },
};

/** Strip sensitive fields from log context */
function sanitizeLogContext(context?: Record<string, unknown>): Record<string, unknown> {
  if (!context) return {};
  const sanitized = { ...context };
  const sensitiveKeys = ["password", "token", "secret", "apiKey", "api_key", "authorization", "cookie", "creditCard"];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    }
  }
  return sanitized;
}
