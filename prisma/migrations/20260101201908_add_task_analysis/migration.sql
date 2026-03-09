-- CreateTable
CREATE TABLE "task_analyses" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "roleDescription" TEXT NOT NULL DEFAULT '',
    "tasks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_analyses_pageId_key" ON "task_analyses"("pageId");

-- AddForeignKey
ALTER TABLE "task_analyses" ADD CONSTRAINT "task_analyses_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
