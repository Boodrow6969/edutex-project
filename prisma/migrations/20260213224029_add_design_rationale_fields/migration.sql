-- AlterTable
ALTER TABLE "needs_analyses" ADD COLUMN     "aiAnalysis" TEXT,
ADD COLUMN     "aiRecommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isTrainingSolution" BOOLEAN,
ADD COLUMN     "nonTrainingFactors" TEXT,
ADD COLUMN     "solutionRationale" TEXT;

-- AlterTable
ALTER TABLE "storyboards" ADD COLUMN     "designApproach" TEXT,
ADD COLUMN     "mediaSelectionNotes" TEXT;
