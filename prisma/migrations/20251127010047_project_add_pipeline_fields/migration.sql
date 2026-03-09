-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'intake',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "projectType" TEXT,
ADD COLUMN     "targetGoLive" TIMESTAMP(3);
