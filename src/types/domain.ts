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

export type MovementBase = {
  id: string;
  type: MovementType;
  quantity: number;
  note?: string;
  createdAt: string;
};

export type MovementWithRefs = MovementBase & {
  material: { id?: string; name: string; partNumber: string };
  user: { name: string; email: string };
};

export type MaterialWithMovements = MaterialBase & {
  movements: Array<
    MovementBase & {
      user: { name: string; email: string };
    }
  >;
};

export type PurchaseOrderItem = {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number | null;
  receivedQty: number;
  material: { id: string; name: string; partNumber: string; unit: string };
};

export type PurchaseOrder = {
  id: string;
  orderNumber: string;
  status: PurchaseOrderStatus;
  supplier: string;
  notes?: string | null;
  expectedDate?: string | null;
  totalItems: number;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserRef;
  approvedBy?: { id: string; name: string } | null;
  items: PurchaseOrderItem[];
};