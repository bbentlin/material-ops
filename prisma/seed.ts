import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@materialops.com" },
    update: {
      password: hashSync(process.env.ADMIN_PASSWORD || "Admin!Change#Me2026", 10),
    },
    create: {
      email: "admin@materialops.com",
      name: "Admin",
      password: hashSync(process.env.ADMIN_PASSWORD || "Admin!Change#Me2026", 10),
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  if (!process.env.ADMIN_PASSWORD) {
    console.warn("⚠️ Using default admin password. Set ADMIN_PASSWORD env var for production.");
  }

  // Create an operator user
  const operator = await prisma.user.upsert({
    where: { email: "operator@materialops.com" },
    update: {
      password: hashSync(process.env.OPERATOR_PASSWORD || "Operator!Change#Me2026", 10),
    },
    create: {
      email: "operator@materialops.com",
      name: "Operator",
      password: hashSync(process.env.OPERATOR_PASSWORD || "Operator!Change#Me2026", 10),
      role: "OPERATOR",
    },
  });
  console.log("Operator user created:", operator.email);

  if (!process.env.OPERATOR_PASSWORD) {
    console.warn("⚠️ Using default operator password. Set OPERATOR_PASSWORD env var for production.");
  }

  // Create departments
  const departments = [
    { name: "Sidewalls", description: "Sidewall assembly", color: "#6366F1" },
    { name: "Front Walls", description: "Front wall assembly", color: "#F59E0B" },
    { name: "Rear Frames", description: "Assembly & welding rear frame components", color: "#10B981" },
    { name: "Swing Doors", description: "Fab & assembly of rear/side swing doors", color: "#EF4444" },
    { name: "Roofs", description: "Roof assembly", color: "#0EA5E9" },
    { name: "Doors", description: "Rear roll up door assembly & installation", color: "#8B5CF6" },
    { name: "Undercarriage", description: "Body undercarriage fab & welding", color: "#F43F5E" },
    { name: "Floors", description: "Floor installation", color: "#F97316" },
    { name: "Mounting/Liftgates", description: "Mounting of body to chassis and installation of liftgate", color: "#14B8A6" },
    { name: "Skirts/Sliders", description: "Fab/installation custom skirting/slider doors", color: "#475569" },
    { name: "Wiring", description: "Body wiring, camera, utility lighting installation, etc.", color: "#F8FAFC" },
    { name: "Finishing", description: "Clean, paint and finish bodies; undercoat chassis/undercarriage; sand & finish mover floors/Final inspection", color: "#1E293B" },
    { name: "Maintenance", description: "Maintain and repair tools & equipment/groundskeeping" },
    { name: "Janitorial", description: "Clean manufacturing facility", color: "#7C3AED"}
  ];

  const deptMap: Record<string, string> = {};
  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    deptMap[dept.name] = department.id;
    console.log("Department created:", department.name);
  }

  // Create sample materials
  const materials = [
    {
      name: "Steel Rod 10mm",
      partNumber: "MAT-001",
      description: "10mm diameter steel rod, 1m length",
      quantity: 100,
      minQuantity: 20,
      unit: "pieces",
      location: "Warehouse A - Shelf 1",
    },
    {
      name: "Copper Wire 2mm",
      partNumber: "MAT-002",
      description: "2mm copper wire, 50m spool",
      quantity: 50,
      minQuantity: 10,
      unit: "spools",
      location: "Warehouse A - Shelf 3",
    },
    {
      name: "Aluminum Sheet",
      partNumber: "MAT-003",
      description: "1mm thick aluminum sheet, 1m x 2m",
      quantity: 25,
      minQuantity: 5,
      unit: "sheets",
      location: "Warehouse B - Rack 2",
    },
  ];

  for (const mat of materials) {
    const material = await prisma.material.upsert({
      where: { partNumber: mat.partNumber },
      update: {},
      create: mat,
    });
    console.log("Material created:", material.name);
  }

  // Create sample movements
  const firstMaterial = await prisma.material.findUnique({
    where: { partNumber: "MAT-001" },
  });

  if (firstMaterial) {
    await prisma.movement.create({
      data: {
        type: "INBOUND",
        quantity: 100,
        note: "Initial stock intake",
        materialId: firstMaterial.id,
        userId: admin.id,
      },
    });
    console.log("Sample movement created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());