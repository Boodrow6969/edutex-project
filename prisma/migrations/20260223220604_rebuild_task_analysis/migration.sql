/*
  Warnings:

  - The values [ELEARNING_SCREEN] on the enum `BlockType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `taskAnalysisId` on the `learning_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `task_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `roleDescription` on the `task_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `tasks` on the `task_analyses` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskAnalysisType" AS ENUM ('PROCEDURAL', 'HIERARCHICAL', 'COGNITIVE');

-- CreateEnum
CREATE TYPE "InstructionalEvent" AS ENUM ('DEMONSTRATION', 'PRACTICE', 'DECISION_BRANCH', 'INFORMATION', 'EXAMPLE', 'CAUTION');

-- AlterEnum
BEGIN;
CREATE TYPE "BlockType_new" AS ENUM ('PARAGRAPH', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'BULLETED_LIST', 'NUMBERED_LIST', 'CALLOUT', 'PERFORMANCE_PROBLEM', 'INSTRUCTIONAL_GOAL', 'TASK_STEP', 'LEARNING_OBJECTIVE', 'ASSESSMENT_IDEA', 'STORYBOARD_FRAME', 'STORYBOARD_METADATA', 'CONTENT_SCREEN', 'LEARNING_OBJECTIVES_IMPORT', 'CHECKLIST', 'TABLE', 'FACILITATOR_NOTES', 'MATERIALS_LIST', 'IMAGE', 'VIDEO');
ALTER TABLE "blocks" ALTER COLUMN "type" TYPE "BlockType_new" USING ("type"::text::"BlockType_new");
ALTER TYPE "BlockType" RENAME TO "BlockType_old";
ALTER TYPE "BlockType_new" RENAME TO "BlockType";
DROP TYPE "public"."BlockType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "learning_tasks" DROP CONSTRAINT "learning_tasks_taskAnalysisId_fkey";

-- DropIndex
DROP INDEX "learning_tasks_taskAnalysisId_idx";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "dashboardStatuses" JSONB;

-- AlterTable
ALTER TABLE "learning_tasks" DROP COLUMN "taskAnalysisId";

-- AlterTable
ALTER TABLE "storyboards" ADD COLUMN     "deliveryMethod" TEXT NOT NULL DEFAULT 'eLearning',
ADD COLUMN     "duration" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "task_analyses" DROP COLUMN "jobTitle",
DROP COLUMN "roleDescription",
DROP COLUMN "tasks",
ADD COLUMN     "aiDrafted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "analysisType" "TaskAnalysisType" NOT NULL DEFAULT 'PROCEDURAL',
ADD COLUMN     "audiencePriorKnowledge" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "audienceRole" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "audienceTechComfort" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "constraints" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contextNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "criticalityScore" INTEGER,
ADD COLUMN     "dataSource" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "difficultyScore" INTEGER,
ADD COLUMN     "feasibilityScore" INTEGER,
ADD COLUMN     "frequencyScore" INTEGER,
ADD COLUMN     "objectiveId" TEXT,
ADD COLUMN     "sourceTaskId" TEXT,
ADD COLUMN     "taskGoal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "taskName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "universalityScore" INTEGER;

-- CreateTable
CREATE TABLE "procedural_steps" (
    "id" TEXT NOT NULL,
    "taskAnalysisId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isDecisionPoint" BOOLEAN NOT NULL DEFAULT false,
    "branchCondition" TEXT,
    "commonErrors" TEXT,
    "cues" TEXT,
    "toolsRequired" TEXT,
    "instructionalEvent" "InstructionalEvent",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedural_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "procedural_steps_taskAnalysisId_idx" ON "procedural_steps"("taskAnalysisId");

-- AddForeignKey
ALTER TABLE "task_analyses" ADD CONSTRAINT "task_analyses_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedural_steps" ADD CONSTRAINT "procedural_steps_taskAnalysisId_fkey" FOREIGN KEY ("taskAnalysisId") REFERENCES "task_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
