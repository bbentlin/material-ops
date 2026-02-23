import { getCurrentUser } from "./auth";
import { NextResponse } from "next/server";

type Role = "ADMIN" | "OPERATOR" | "VIEWER";

const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  ADMIN: 3,
};

export function hasRole(userRole: string, requireRole: Role): boolean {
  return (
    (ROLE_HIERARCHY[userRole as Role] ?? 0) >=
    (ROLE_HIERARCHY[requireRole] ?? 0)
  );
}

export async function requireAuth(requireRole: Role = "VIEWER") {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!hasRole(user.role, requireRole)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}