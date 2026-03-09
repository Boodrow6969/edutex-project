-- CreateEnum
CREATE TYPE "TaskFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'RARELY');

-- CreateEnum
CREATE TYPE "TaskCriticality" AS ENUM ('CRITICAL', 'IMPORTANT', 'SUPPORTIVE');

-- CreateEnum
CREATE TYPE "TaskComplexity" AS ENUM ('SIMPLE', 'MODERATE', 'COMPLEX');

-- CreateEnum
CREATE TYPE "KnowledgeType" AS ENUM ('DECLARATIVE', 'PROCEDURAL', 'CONDITIONAL', 'METACOGNITIVE');

-- CreateTable
CREATE TABLE "learning_tasks" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "TaskFrequency" NOT NULL DEFAULT 'WEEKLY',
    "criticality" "TaskCriticality" NOT NULL DEFAULT 'IMPORTANT',
    "complexity" "TaskComplexity" NOT NULL DEFAULT 'MODERATE',
    "knowledgeType" "KnowledgeType" NOT NULL DEFAULT 'PROCEDURAL',
    "isStandardized" BOOLEAN NOT NULL DEFAULT true,
    "variationNotes" TEXT,
    "isFeasibleToTrain" BOOLEAN NOT NULL DEFAULT true,
    "feasibilityNotes" TEXT,
    "externalId" TEXT,
    "externalSource" TEXT,
    "parentTaskId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "rationale" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "taskAnalysisId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_tasks_courseId_idx" ON "learning_tasks"("courseId");

-- CreateIndex
CREATE INDEX "learning_tasks_externalId_idx" ON "learning_tasks"("externalId");

-- CreateIndex
CREATE INDEX "learning_tasks_taskAnalysisId_idx" ON "learning_tasks"("taskAnalysisId");

-- AddForeignKey
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "learning_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_taskAnalysisId_fkey" FOREIGN KEY ("taskAnalysisId") REFERENCES "task_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
