import { prisma } from "@/lib/db";
import type { z } from "zod";
import { purchaseOrderItemSchema } from "@/lib/validations";

type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;

export async function validatePurchaseOrderItems(
  items: PurchaseOrderItemInput[],
): Promise<string | null> {
  const catalogIds = items.flatMap((item) => 
    item.kind === "catalog" ? [item.materialId] : [],
  );

  const catalogMaterials = catalogIds.length
    ? await prisma.material.findMany({
      where: { id: { in: catalogIds }, deletedAt: null },
      select: { id: true, partNumber: true },
    })
  : [];

  const activeById = new Map(catalogMaterials.map((material) => [material.id, material]));

  for (const id of catalogIds) {
    if (!activeById.has(id)) return `Material ${id} not found or archived`;
  }

  const newPartNumbers = items.flatMap((item) =>
    item.kind === "new" ? [item.newMaterialPartNumber] : [];
  );

  if (new Set(newPartNumbers).size !== newPartNumbers.length) {
    return "Each new material must have a unique part number";
  }

  const existingParts = newPartNumbers.length 
    ? await prisma.material.findMany({
      where: { partNumber: { in: newPartNumbers } },
      select: { partNumber: true },
    })
  : [];

  const existingPartNumbers = new Set(existingParts.map((material) => material.partNumber));

  for (const partNumber of newPartNumbers) {
    if (existingPartNumbers.has(partNumber)) {
      return `Part number ${partNumber} is already in use`;
    }
  }

  const catalogPartNumbers = new Set(
    catalogMaterials.map((material) => material.partNumber),
  );

  for (const partNumber of newPartNumbers) {
    if (catalogPartNumbers.has(partNumber)) {
      return `Part number ${partNumber} is already on this order as a catalog material`;
    }
  }

  return null;
}