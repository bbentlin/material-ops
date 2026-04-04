import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  partNumber: z.string().min(1).max(100),
  description: z.string().max(1000).optional().default(""),
  quantity: z.number().int().min(0).default(10),
  minQuantity: z.number().int().min(0).default(10),
  unit: z.string().max(50).optional().default("ea"),
  location: z.string().max(200).optional().default(""),
  departmentId: z.string().nullable().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const createMovementSchema = z.object({
  type: z.enum(["INBOUND", "OUTBOUND", "TRANSFER"]),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  note: z.string().max(500).optional().default(""),
  materialId: z.string().min(1),
  destinationMaterialId: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]).optional().default("VIEWER"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]).optional(),
});

export const createPurchaseOrderSchema = z.object({
  supplier: z.string().min(1).max(300),
  notes: z.string().max(1000).optional(),
  expectedDate: z.string().optional(), 
  items: z.array(z.object({
    materialId: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0).nullable().optional(),
  })).min(1, "At least one item is required"),
});

export const updatePurchaseOrderSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "RECEIVED", "CANCELLED"]).optional(),
  supplier: z.string().min(1).max(300).optional(),
  notes: z.string().max(1000).nullable().optional(),
  expectedDate: z.string().nullable().optional(),
  items: z.array(z.object({
    materialId: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0).nullable().optional(),
  })).optional(),
});

export const importMaterialSchema = z.object({
  materials: z.array(z.object({
    name: z.string(),
    partNumber: z.string(),
    description: z.string().optional(),
    quantity: z.string().or(z.number()).optional(),
    minQuantity: z.string().or(z.number()).optional(),
    unit: z.string().optional(),
    location: z.string().optional(),
    department: z.string().optional(),
  })).min(1),
});