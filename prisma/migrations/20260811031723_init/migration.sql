-- CreateEnum
CREATE TYPE "SpyTaskStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpyTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerTaskId" TEXT NOT NULL,
    "status" "SpyTaskStatus" NOT NULL DEFAULT 'PENDING',
    "params" JSONB NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "SpyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpyTaskItem" (
    "id" TEXT NOT NULL,
    "spyTaskId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "shopName" TEXT,
    "category" TEXT,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "currency" TEXT NOT NULL,
    "soldCount" INTEGER,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpyTaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderRequestLog" (
    "id" TEXT NOT NULL,
    "spyTaskId" TEXT,
    "endpoint" TEXT NOT NULL,
    "httpStatus" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "SpyTask_userId_createdAt_idx" ON "SpyTask"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpyTask_provider_providerTaskId_key" ON "SpyTask"("provider", "providerTaskId");

-- CreateIndex
CREATE INDEX "SpyTaskItem_spyTaskId_idx" ON "SpyTaskItem"("spyTaskId");

-- CreateIndex
CREATE INDEX "SpyTaskItem_provider_externalId_capturedAt_idx" ON "SpyTaskItem"("provider", "externalId", "capturedAt" DESC);

-- CreateIndex
CREATE INDEX "ProviderRequestLog_spyTaskId_idx" ON "ProviderRequestLog"("spyTaskId");

-- AddForeignKey
ALTER TABLE "SpyTask" ADD CONSTRAINT "SpyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpyTaskItem" ADD CONSTRAINT "SpyTaskItem_spyTaskId_fkey" FOREIGN KEY ("spyTaskId") REFERENCES "SpyTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderRequestLog" ADD CONSTRAINT "ProviderRequestLog_spyTaskId_fkey" FOREIGN KEY ("spyTaskId") REFERENCES "SpyTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
