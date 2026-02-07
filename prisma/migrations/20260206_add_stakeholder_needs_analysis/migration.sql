-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('PERFORMANCE_PROBLEM', 'NEW_SYSTEM', 'COMPLIANCE', 'ROLE_CHANGE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REVISION_REQUESTED');

-- AlterEnum
BEGIN;
CREATE TYPE "BlockType_new" AS ENUM ('PARAGRAPH', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'BULLETED_LIST', 'NUMBERED_LIST', 'CALLOUT', 'PERFORMANCE_PROBLEM', 'INSTRUCTIONAL_GOAL', 'TASK_STEP', 'LEARNING_OBJECTIVE', 'ASSESSMENT_IDEA', 'STORYBOARD_FRAME', 'STORYBOARD_METADATA', 'CONTENT_SCREEN', 'LEARNING_OBJECTIVES_IMPORT', 'CHECKLIST', 'TABLE', 'FACILITATOR_NOTES', 'MATERIALS_LIST', 'IMAGE', 'VIDEO');
ALTER TABLE "blocks" ALTER COLUMN "type" TYPE "BlockType_new" USING ("type"::text::"BlockType_new");
ALTER TYPE "BlockType" RENAME TO "BlockType_old";
ALTER TYPE "BlockType_new" RENAME TO "BlockType";
DROP TYPE "public"."BlockType_old";
COMMIT;

-- AlterTable
ALTER TABLE "storyboards" ADD COLUMN     "deliveryMethod" TEXT NOT NULL DEFAULT 'eLearning',
ADD COLUMN     "duration" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "stakeholder_access_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "trainingType" "TrainingType" NOT NULL,
    "createdById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "stakeholderName" TEXT,
    "stakeholderEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder_submissions" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "trainingType" "TrainingType" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "revisionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder_responses" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder_change_logs" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stakeholder_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stakeholder_access_tokens_token_key" ON "stakeholder_access_tokens"("token");

-- CreateIndex
CREATE INDEX "stakeholder_access_tokens_token_idx" ON "stakeholder_access_tokens"("token");

-- CreateIndex
CREATE INDEX "stakeholder_access_tokens_projectId_idx" ON "stakeholder_access_tokens"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "stakeholder_submissions_tokenId_key" ON "stakeholder_submissions"("tokenId");

-- CreateIndex
CREATE INDEX "stakeholder_submissions_projectId_idx" ON "stakeholder_submissions"("projectId");

-- CreateIndex
CREATE INDEX "stakeholder_submissions_status_idx" ON "stakeholder_submissions"("status");

-- CreateIndex
CREATE INDEX "stakeholder_responses_submissionId_idx" ON "stakeholder_responses"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "stakeholder_responses_submissionId_questionId_key" ON "stakeholder_responses"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "stakeholder_change_logs_submissionId_idx" ON "stakeholder_change_logs"("submissionId");

-- CreateIndex
CREATE INDEX "stakeholder_change_logs_submissionId_questionId_idx" ON "stakeholder_change_logs"("submissionId", "questionId");

-- AddForeignKey
ALTER TABLE "stakeholder_access_tokens" ADD CONSTRAINT "stakeholder_access_tokens_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_access_tokens" ADD CONSTRAINT "stakeholder_access_tokens_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_submissions" ADD CONSTRAINT "stakeholder_submissions_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "stakeholder_access_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_submissions" ADD CONSTRAINT "stakeholder_submissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_submissions" ADD CONSTRAINT "stakeholder_submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_responses" ADD CONSTRAINT "stakeholder_responses_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "stakeholder_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_change_logs" ADD CONSTRAINT "stakeholder_change_logs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "stakeholder_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
