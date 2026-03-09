-- AlterTable
ALTER TABLE "course_analyses" ADD COLUMN     "deliveryNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "existingMaterials" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "audience_profiles" (
    "id" TEXT NOT NULL,
    "courseAnalysisId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "headcount" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'Daily',
    "techComfort" TEXT NOT NULL DEFAULT 'Moderate',
    "trainingFormat" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audience_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_tasks" (
    "id" TEXT NOT NULL,
    "courseAnalysisId" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'ID-added',
    "complexity" TEXT NOT NULL DEFAULT 'Medium',
    "intervention" TEXT NOT NULL DEFAULT 'training',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "notes" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audience_profiles" ADD CONSTRAINT "audience_profiles_courseAnalysisId_fkey" FOREIGN KEY ("courseAnalysisId") REFERENCES "course_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_tasks" ADD CONSTRAINT "analysis_tasks_courseAnalysisId_fkey" FOREIGN KEY ("courseAnalysisId") REFERENCES "course_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
