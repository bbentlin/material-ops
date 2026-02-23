import { PrismaClient } from "../src/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@materialops.com" },
    update: {},
    create: {
      email: "admin@materialops.com",
      name: "Admin",
      password: hashSync("admin123", 10),
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create sample materials
  const materials = [
    {
      name: "Steel Rod 10mm",
      sku: "MAT-001",
      description: "10mm diameter steel rod, 1m length",
      quantity: 100,
      unit: "pieces",
      location: "Warehouse A - Shelf 1",
    },
    {
      name: "Copper Wire 2mm",
      sku: "MAT-002",
      description: "2mm copper wire, 50m spool",
      quantity: 50,
      unit: "spools",
      location: "Warehouse A - Shelf 3",
    },
    {
      name: "Aluminum Sheet",
      sku: "MAT-003",
      description: "1mm thick aluminum sheet, 1m x 2m",
      quantity: 25,
      unit: "sheets",
      location: "Warehouse B - Rack 2",
    },
  ];

  for (const mat of materials) {
    const material = await prisma.material.upsert({
      where: { sku: mat.sku },
      update: {},
      create: mat,
    });
    console.log("Material created:", material.name);
  }

  // Create a sample movement
  const firstMaterial =  await prisma.material.findUnique({
    where: { sku: "MAT-001" },
  });

  if (firstMaterial) {
    await prisma.movement.create({
      data: {
        type: "IN",
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