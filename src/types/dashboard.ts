export type Material = {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  quantity: number;
  minQuantity?: number;
  unit?: string;
  location?: string;
  createdAt?: string;
  department?: { id: string; name: string; color: string } | null;
};

export type Movement = {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  type: string;
  createdAt: string;
  material: { name: string; partNumber: string };
  user: { name: string; email: string };
};

export type SortKey = "name" | "partNumber" | "quantity" | "unit" | "location" | "department";
export type SortDir = "asc" | "desc";

export type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

export type StatsData = {
  totalMaterials: number;
  totalStock: number;
  lowStockCount: number;
  stockByDepartment: { name: string; color: string; total: number }[];
};

export type TrendDay = {
  label: string;
  inbound: number;
  outbound: number;
};

export type LowStockAlert = {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location?: string;
  department?: { id: string; name: string; color: string } | null;
  deficit: number;
  severity: "CRITICAL" | "LOW";
  percentOfThreshold: number;
};

export type WidgetData = {
  poSummary: Record<string, number>;
  recentPOs: {
    id: string;
    orderNumber: string;
    supplier: string;
    status: string;
    totalItems: number;
    createdAt: string;
  }[];
  topMovers: {
    id: string;
    name: string;
    partNumber: string;
    totalMovement: number;
    inbound: number;
    outbound: number;
  }[];
  stockVelocity: {
    totalInbound: number;
    totalOutbound: number;
    totalTransfers: number;
    periodDays: number;
  };
  inventoryHealth: {
    total: number;
    healthy: number;
    low: number;
    critical: number;
    healthPercent: number;
  };
};