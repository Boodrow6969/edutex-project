/*
  Warnings:

  - The `status` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phase` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `courseType` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `curricula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `storyboards` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `bloomLevel` on the `blueprint_objectives` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priority` on the `blueprint_objectives` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `constraints` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'IN_REVIEW', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CoursePhase" AS ENUM ('INTAKE', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'IMPLEMENTATION', 'EVALUATION');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('PERFORMANCE_PROBLEM', 'NEW_SYSTEM', 'COMPLIANCE', 'ROLE_CHANGE', 'ONBOARDING', 'PROFESSIONAL_DEVELOPMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "StoryboardStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "CurriculumStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConstraintType" AS ENUM ('TIME', 'BUDGET', 'TECHNOLOGY', 'AUDIENCE', 'REGULATORY', 'ORGANIZATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "BlueprintPriority" AS ENUM ('MUST_HAVE', 'SHOULD_HAVE', 'NICE_TO_HAVE');

-- AlterTable
ALTER TABLE "blueprint_objectives" DROP COLUMN "bloomLevel",
ADD COLUMN     "bloomLevel" "BloomLevel" NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "BlueprintPriority" NOT NULL;

-- AlterTable
ALTER TABLE "constraints" DROP COLUMN "type",
ADD COLUMN     "type" "ConstraintType" NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "status",
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "phase",
ADD COLUMN     "phase" "CoursePhase" NOT NULL DEFAULT 'INTAKE',
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "courseType",
ADD COLUMN     "courseType" "CourseType";

-- AlterTable
ALTER TABLE "curricula" DROP COLUMN "status",
ADD COLUMN     "status" "CurriculumStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "storyboards" DROP COLUMN "status",
ADD COLUMN     "status" "StoryboardStatus" NOT NULL DEFAULT 'DRAFT';
