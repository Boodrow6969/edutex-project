-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlockType" ADD VALUE 'STORYBOARD_METADATA';
ALTER TYPE "BlockType" ADD VALUE 'ELEARNING_SCREEN';
ALTER TYPE "BlockType" ADD VALUE 'LEARNING_OBJECTIVES_IMPORT';
ALTER TYPE "BlockType" ADD VALUE 'CHECKLIST';
ALTER TYPE "BlockType" ADD VALUE 'TABLE';
ALTER TYPE "BlockType" ADD VALUE 'FACILITATOR_NOTES';
ALTER TYPE "BlockType" ADD VALUE 'MATERIALS_LIST';
