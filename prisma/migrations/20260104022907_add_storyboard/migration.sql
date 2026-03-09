-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'STORYBOARD_FRAME';

-- CreateTable
CREATE TABLE "storyboards" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "linkedObjectiveIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storyboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storyboards_pageId_key" ON "storyboards"("pageId");

-- AddForeignKey
ALTER TABLE "storyboards" ADD CONSTRAINT "storyboards_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
