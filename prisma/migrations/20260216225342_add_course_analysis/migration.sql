-- CreateTable
CREATE TABLE "course_analyses" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "problemSummary" TEXT NOT NULL DEFAULT '',
    "currentStateSummary" TEXT NOT NULL DEFAULT '',
    "desiredStateSummary" TEXT NOT NULL DEFAULT '',
    "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assumptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learnerPersonas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stakeholders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isTrainingSolution" BOOLEAN,
    "nonTrainingFactors" TEXT,
    "solutionRationale" TEXT,
    "level1Reaction" TEXT NOT NULL DEFAULT '',
    "level2Learning" TEXT NOT NULL DEFAULT '',
    "level3Behavior" TEXT NOT NULL DEFAULT '',
    "level4Results" TEXT NOT NULL DEFAULT '',
    "aiAnalysis" TEXT,
    "aiRecommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_analyses_pageId_key" ON "course_analyses"("pageId");

-- AddForeignKey
ALTER TABLE "course_analyses" ADD CONSTRAINT "course_analyses_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
