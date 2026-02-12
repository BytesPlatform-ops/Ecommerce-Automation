/**
 * Audit Logging Utility
 *
 * Provides persistent, structured audit logging for all sensitive
 * mutations in the application. Audit log failures never break
 * the primary operation (fire-and-forget with error logging).
 */

import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import { secureLog } from "@/lib/security";

export { AuditAction };

export interface AuditLogEntry {
  action: AuditAction;
  actorId?: string | null;
  storeId?: string | null;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

/**
 * Write an audit log entry to the database.
 * This is fire-and-forget — errors are logged but never thrown,
 * so audit failures never break the primary operation.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId ?? null,
        storeId: entry.storeId ?? null,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        metadata: entry.metadata ?? undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Never throw — audit failures must not break business logic
    secureLog.error("[Audit] Failed to write audit log", error, {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
    });
  }
}

/**
 * Extract client IP address from a NextRequest.
 * Checks x-forwarded-for, x-real-ip, then falls back to "unknown".
 */
export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
