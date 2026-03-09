/*
  Warnings:

  - You are about to drop the column `projectId` on the `stakeholder_access_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `stakeholder_submissions` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `stakeholder_access_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `stakeholder_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stakeholder_access_tokens" DROP CONSTRAINT "stakeholder_access_tokens_projectId_fkey";

-- DropForeignKey
ALTER TABLE "stakeholder_submissions" DROP CONSTRAINT "stakeholder_submissions_projectId_fkey";

-- DropIndex
DROP INDEX "stakeholder_access_tokens_projectId_idx";

-- DropIndex
DROP INDEX "stakeholder_submissions_projectId_idx";

-- AlterTable
ALTER TABLE "stakeholder_access_tokens" DROP COLUMN "projectId",
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stakeholder_submissions" DROP COLUMN "projectId",
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "stakeholder_access_tokens_workspaceId_idx" ON "stakeholder_access_tokens"("workspaceId");

-- CreateIndex
CREATE INDEX "stakeholder_submissions_workspaceId_idx" ON "stakeholder_submissions"("workspaceId");

-- AddForeignKey
ALTER TABLE "stakeholder_access_tokens" ADD CONSTRAINT "stakeholder_access_tokens_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_submissions" ADD CONSTRAINT "stakeholder_submissions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
