-- CreateEnum
CREATE TYPE "BloomKnowledgeType" AS ENUM ('FACTUAL', 'CONCEPTUAL', 'PROCEDURAL', 'METACOGNITIVE');

-- CreateEnum
CREATE TYPE "ObjectivePriority" AS ENUM ('MUST', 'SHOULD', 'NICE_TO_HAVE');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "gapKnowledge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gapSkill" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "objectives" ADD COLUMN     "audience" TEXT,
ADD COLUMN     "bloomKnowledge" "BloomKnowledgeType",
ADD COLUMN     "freeformText" TEXT,
ADD COLUMN     "linkedTriageItemId" TEXT,
ADD COLUMN     "objectivePriority" "ObjectivePriority",
ADD COLUMN     "requiresAssessment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verb" TEXT,
ADD COLUMN     "wiifm" TEXT;

-- CreateTable
CREATE TABLE "triage_items" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "column" TEXT NOT NULL DEFAULT 'must',
    "source" TEXT NOT NULL DEFAULT 'NA',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triage_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_tasks" (
    "id" TEXT NOT NULL,
    "parentItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "isNew" TEXT NOT NULL DEFAULT 'New',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "triage_items_courseId_idx" ON "triage_items"("courseId");

-- CreateIndex
CREATE INDEX "sub_tasks_parentItemId_idx" ON "sub_tasks"("parentItemId");

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_linkedTriageItemId_fkey" FOREIGN KEY ("linkedTriageItemId") REFERENCES "triage_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_items" ADD CONSTRAINT "triage_items_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_tasks" ADD CONSTRAINT "sub_tasks_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "triage_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
