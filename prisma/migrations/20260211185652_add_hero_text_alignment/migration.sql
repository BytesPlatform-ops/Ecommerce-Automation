-- CreateEnum
CREATE TYPE "HeroTextAlign" AS ENUM ('Left', 'Center', 'Right');

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "heroTextAlign" "HeroTextAlign" NOT NULL DEFAULT 'Center';
