-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'MATCHING', 'ORDERING', 'SCENARIO_BASED', 'PERFORMANCE_CHECKLIST', 'ESSAY');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT;

-- AlterTable
ALTER TABLE "curricula" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT;

-- AlterTable
ALTER TABLE "objectives" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiReasoning" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "criteria" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT,
ADD COLUMN     "rationale" TEXT;

-- CreateTable
CREATE TABLE "assessment_items" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "stem" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB,
    "feedback" JSONB,
    "bloomLevel" "BloomLevel" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "externalId" TEXT,
    "rationale" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective_task_links" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "learningTaskId" TEXT NOT NULL,
    "relationship" TEXT,

    CONSTRAINT "objective_task_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective_assessment_links" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "assessmentItemId" TEXT NOT NULL,
    "bloomLevelAssessed" "BloomLevel" NOT NULL,
    "isAligned" BOOLEAN NOT NULL DEFAULT true,
    "alignmentNotes" TEXT,

    CONSTRAINT "objective_assessment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_items_courseId_idx" ON "assessment_items"("courseId");

-- CreateIndex
CREATE INDEX "assessment_items_courseId_bloomLevel_idx" ON "assessment_items"("courseId", "bloomLevel");

-- CreateIndex
CREATE UNIQUE INDEX "objective_task_links_objectiveId_learningTaskId_key" ON "objective_task_links"("objectiveId", "learningTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "objective_assessment_links_objectiveId_assessmentItemId_key" ON "objective_assessment_links"("objectiveId", "assessmentItemId");

-- CreateIndex
CREATE INDEX "courses_externalId_idx" ON "courses"("externalId");

-- CreateIndex
CREATE INDEX "curricula_externalId_idx" ON "curricula"("externalId");

-- CreateIndex
CREATE INDEX "objectives_externalId_idx" ON "objectives"("externalId");

-- AddForeignKey
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_task_links" ADD CONSTRAINT "objective_task_links_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_task_links" ADD CONSTRAINT "objective_task_links_learningTaskId_fkey" FOREIGN KEY ("learningTaskId") REFERENCES "learning_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_assessment_links" ADD CONSTRAINT "objective_assessment_links_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_assessment_links" ADD CONSTRAINT "objective_assessment_links_assessmentItemId_fkey" FOREIGN KEY ("assessmentItemId") REFERENCES "assessment_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
