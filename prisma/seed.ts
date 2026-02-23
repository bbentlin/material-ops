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
  console.log("✅ Admin user created:", admin.email);

  // Create first material
  const material = await prisma.material.upsert({
    where: { sku: "MAT-001" },
    update: {},
    create: {
      name: "Steel Rod 10mm",
      sku: "MAT-001",
      description: "10mm diameter steel rod, 1m length",
      quantity: 100,
      unit: "pieces",
      location: "Warehouse A - Shelf 1",
    },
  });
  console.log("✅ Material created:", material.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());