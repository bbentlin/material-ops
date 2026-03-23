import { prisma } from "./db";

export async function logAudit({
  action,
  entity,
  entityId,
  details,
  userId,
}: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  userId?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: { action, entity, entityId, details, userId },
    });
  } catch {
    console.error("Failed to create audit log entry");
  }
}