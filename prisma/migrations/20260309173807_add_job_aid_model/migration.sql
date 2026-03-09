-- CreateEnum
CREATE TYPE "JobAidType" AS ENUM ('CHECKLIST', 'REFERENCE_CARD', 'STEP_GUIDE', 'DECISION_TREE', 'OTHER');

-- CreateEnum
CREATE TYPE "JobAidStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED');

-- CreateTable
CREATE TABLE "job_aids" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "JobAidType" NOT NULL DEFAULT 'CHECKLIST',
    "status" "JobAidStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "notes" TEXT,
    "linkedObjectiveId" TEXT,
    "linkedTaskId" TEXT,
    "assetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_aids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_aids_courseId_idx" ON "job_aids"("courseId");

-- AddForeignKey
ALTER TABLE "job_aids" ADD CONSTRAINT "job_aids_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_aids" ADD CONSTRAINT "job_aids_linkedObjectiveId_fkey" FOREIGN KEY ("linkedObjectiveId") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_aids" ADD CONSTRAINT "job_aids_linkedTaskId_fkey" FOREIGN KEY ("linkedTaskId") REFERENCES "learning_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
