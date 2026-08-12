-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "SpyTask" ADD COLUMN     "keyword" TEXT;

-- Backfill keyword từ params JSON (dữ liệu cũ trước khi có cột riêng)
UPDATE "SpyTask" SET "keyword" = "params"->>'keyword' WHERE "keyword" IS NULL;

-- AlterTable
ALTER TABLE "SpyTask" ALTER COLUMN "keyword" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "SpyTask_keyword_idx" ON "SpyTask"("keyword");
