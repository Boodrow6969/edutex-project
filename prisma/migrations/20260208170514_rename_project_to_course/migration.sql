-- Migration: Rename Project → Course
-- EDUTex: refactor/project-to-course-rename
-- 
-- IMPORTANT: This is a HAND-WRITTEN migration.
-- Do NOT let Prisma auto-generate this migration or it will DROP the projects table
-- and CREATE a new courses table, destroying all data.
--
-- Steps to use:
--   1. Save updated schema.prisma
--   2. Run: npx prisma migrate dev --create-only --name rename-project-to-course
--   3. REPLACE the auto-generated SQL in the new migration folder with THIS file
--   4. Run: npx prisma migrate dev
--   5. Verify with: npx prisma studio
--
-- If something goes wrong, restore from your Git commit before this branch.

-- ============================================================
-- STEP 1: Rename the main table
-- ============================================================
ALTER TABLE "projects" RENAME TO "courses";

-- ============================================================
-- STEP 1b: Rename columns on the courses table itself
-- ============================================================
ALTER TABLE "courses" RENAME COLUMN "projectType" TO "courseType";

-- ============================================================
-- STEP 2: Rename FK columns on child tables that reference courses
-- ============================================================

-- curriculum_courses: projectId → courseId
ALTER TABLE "curriculum_courses" RENAME COLUMN "projectId" TO "courseId";

-- pages: projectId → courseId
ALTER TABLE "pages" RENAME COLUMN "projectId" TO "courseId";

-- tasks: projectId → courseId
ALTER TABLE "tasks" RENAME COLUMN "projectId" TO "courseId";

-- objectives: projectId → courseId
ALTER TABLE "objectives" RENAME COLUMN "projectId" TO "courseId";

-- deliverables: projectId → courseId
ALTER TABLE "deliverables" RENAME COLUMN "projectId" TO "courseId";

-- learning_blueprints: projectId → courseId
ALTER TABLE "learning_blueprints" RENAME COLUMN "projectId" TO "courseId";

-- ============================================================
-- STEP 3: Rename unique constraints and indexes
-- ============================================================

-- curriculum_courses unique constraint on (curriculumId, projectId)
-- Prisma names this based on the fields, so we need to drop and recreate
ALTER TABLE "curriculum_courses" DROP CONSTRAINT IF EXISTS "curriculum_courses_curriculumId_projectId_key";
ALTER TABLE "curriculum_courses" ADD CONSTRAINT "curriculum_courses_curriculumId_courseId_key" UNIQUE ("curriculumId", "courseId");

-- ============================================================
-- STEP 4: Rename foreign key constraints
-- ============================================================

-- curriculum_courses FK to courses
ALTER TABLE "curriculum_courses" DROP CONSTRAINT IF EXISTS "curriculum_courses_projectId_fkey";
ALTER TABLE "curriculum_courses" ADD CONSTRAINT "curriculum_courses_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- pages FK to courses
ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_projectId_fkey";
ALTER TABLE "pages" ADD CONSTRAINT "pages_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- tasks FK to courses
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_projectId_fkey";
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- objectives FK to courses
ALTER TABLE "objectives" DROP CONSTRAINT IF EXISTS "objectives_projectId_fkey";
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- deliverables FK to courses
ALTER TABLE "deliverables" DROP CONSTRAINT IF EXISTS "deliverables_projectId_fkey";
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- learning_blueprints FK to courses
ALTER TABLE "learning_blueprints" DROP CONSTRAINT IF EXISTS "learning_blueprints_projectId_fkey";
ALTER TABLE "learning_blueprints" ADD CONSTRAINT "learning_blueprints_courseId_fkey" 
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- courses FK to workspaces (just rename the constraint for consistency)
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "projects_workspaceId_fkey";
ALTER TABLE "courses" ADD CONSTRAINT "courses_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
