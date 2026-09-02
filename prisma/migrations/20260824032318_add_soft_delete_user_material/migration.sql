-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleteById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3);
