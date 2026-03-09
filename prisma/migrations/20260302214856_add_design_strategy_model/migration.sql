-- CreateEnum
CREATE TYPE "DesignStrategyStatus" AS ENUM ('DRAFT', 'STAKEHOLDER_REVIEW', 'APPROVED');

-- CreateTable
CREATE TABLE "design_strategies" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "businessChallenge" TEXT,
    "businessGoal" TEXT,
    "trainingPercent" INTEGER,
    "solutionComponents" JSONB,
    "evaluationPlan" JSONB,
    "objectivesSnapshot" JSONB,
    "lessonStubs" JSONB,
    "communicationPlan" JSONB,
    "status" "DesignStrategyStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "design_strategies_courseId_key" ON "design_strategies"("courseId");

-- AddForeignKey
ALTER TABLE "design_strategies" ADD CONSTRAINT "design_strategies_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
