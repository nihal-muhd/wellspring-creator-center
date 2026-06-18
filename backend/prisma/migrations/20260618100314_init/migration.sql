-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'VIDEO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PROGRAM_CREATED', 'PROGRAM_UPDATED', 'PROGRAM_DELETED', 'SESSION_CREATED', 'SESSION_UPDATED', 'SESSION_DELETED', 'SESSION_REORDERED', 'BULK_IMPORT_CREATED', 'UPLOAD_URL_REQUESTED');

-- CreateEnum
CREATE TYPE "TargetEntity" AS ENUM ('PROGRAM', 'SESSION', 'BULK_IMPORT', 'UPLOAD');

-- CreateEnum
CREATE TYPE "BulkImportStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "creators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "instructorName" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaType" "MediaType",
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_imports" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "clientImportId" TEXT NOT NULL,
    "status" "BulkImportStatus" NOT NULL,
    "resultJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulk_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetEntity" "TargetEntity" NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_creatorId_idx" ON "users"("creatorId");

-- CreateIndex
CREATE INDEX "programs_creatorId_idx" ON "programs"("creatorId");

-- CreateIndex
CREATE INDEX "programs_creatorId_id_idx" ON "programs"("creatorId", "id");

-- CreateIndex
CREATE INDEX "sessions_creatorId_idx" ON "sessions"("creatorId");

-- CreateIndex
CREATE INDEX "sessions_creatorId_programId_idx" ON "sessions"("creatorId", "programId");

-- CreateIndex
CREATE INDEX "sessions_programId_position_idx" ON "sessions"("programId", "position");

-- CreateIndex
CREATE INDEX "bulk_imports_creatorId_idx" ON "bulk_imports"("creatorId");

-- CreateIndex
CREATE INDEX "bulk_imports_programId_idx" ON "bulk_imports"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_imports_creatorId_clientImportId_key" ON "bulk_imports"("creatorId", "clientImportId");

-- CreateIndex
CREATE INDEX "audit_logs_creatorId_idx" ON "audit_logs"("creatorId");

-- CreateIndex
CREATE INDEX "audit_logs_creatorId_createdAt_idx" ON "audit_logs"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_creatorId_action_createdAt_idx" ON "audit_logs"("creatorId", "action", "createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_imports" ADD CONSTRAINT "bulk_imports_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_imports" ADD CONSTRAINT "bulk_imports_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
