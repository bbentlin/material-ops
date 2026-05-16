export type Role = "ADMIN" | "OPERATOR" | "VIEWER";

export type MovementType = "INBOUND" | "OUTBOUND" | "TRANSFER";

export type PurchaseOrderStatus = 
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "RECEIVED"
  | "CANCELLED";

export type DepartmentRef = {
  id: string;
  name: string;
  color: string;
};

export type UserRef = {
  id: string;
  name: string;
  email: string;
};

export type MaterialBase = {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  quantity: number;
  minQuantity?: number;
  unit?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  department?: DepartmentRef | null;
};

