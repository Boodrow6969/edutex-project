-- CreateEnum
CREATE TYPE "GapType" AS ENUM ('KNOWLEDGE', 'SKILL', 'MOTIVATION', 'ENVIRONMENT', 'MIXED');

-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('TRAINING', 'JOB_AID', 'PRACTICE', 'PROCESS_CHANGE', 'TOOL_IMPROVEMENT', 'COACHING', 'NONE');

-- AlterTable
ALTER TABLE "learning_tasks" ADD COLUMN     "gapType" "GapType",
ADD COLUMN     "impactNote" TEXT,
ADD COLUMN     "intervention" "InterventionType",
ADD COLUMN     "interventionNotes" TEXT;
