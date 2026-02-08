# Phase 2A: Rename Project → Course — Directory Renames and Moved Files

## Context
We renamed the Prisma model from `Project` to `Course` and the database column `projectId` to `courseId` across all tables. The Prisma client is regenerated — `prisma.project` no longer exists, only `prisma.course`. This is a RENAME ONLY session — do not add features, do not refactor logic, do not change behavior. Only rename identifiers.

We are on branch `refactor/project-to-course-rename`.

## Rules
1. Every `prisma.project` → `prisma.course`
2. Every `projectId` variable/param/field → `courseId`
3. Every `params.projectId` → `params.courseId`
4. Every `project` variable name → `course` (when it refers to this model)
5. Every type reference `Project` → `Course` (when it refers to this model)
6. Every `projects` relation include → `courses`
7. Every `curriculumId_projectId` compound key → `curriculumId_courseId`
8. The field `projectType` on the Course model is now `courseType`
9. Do NOT rename anything related to `Workspace`, `Curriculum`, `StakeholderAccessToken`, or other models
10. Do NOT change any business logic or query structure — only identifiers

## Step 1: Rename API Route Directories

Move these directories and all their contents:

```
app/api/projects/route.ts                    → app/api/courses/route.ts
app/api/projects/[projectId]/               → app/api/courses/[courseId]/
```

The [projectId] directory contains these subdirectories that all move with it:
- route.ts
- blueprints/ (with [blueprintId]/objectives/[objectiveId]/ nested inside)
- curricula/
- objectives/
- overview/
- pages/

## Step 2: Rename Library Directory

```
lib/projects/getProjectOverview.ts → lib/courses/getCourseOverview.ts
```

Rename the exported function from `getProjectOverview` → `getCourseOverview`.

## Step 3: Fix All Moved Files

### app/api/courses/route.ts (was projects/route.ts)
- Lines 47, 199: `prisma.project` → `prisma.course`
- Line 84: parameter `project` → `course`
- Line 86: parameter `cc` — check if it references project, rename if so
- Line 151: `prisma.project` → `prisma.course`
- Line 179: `projectId` → `courseId` in PageCreateInput
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/route.ts (was projects/[projectId]/route.ts)
- Lines 31, 128, 177: `prisma.project` → `prisma.course`
- All `params.projectId` → `params.courseId`
- All `project` variables → `course`

### app/api/courses/[courseId]/blueprints/route.ts
- Line 51: `prisma.project` → `prisma.course`
- Line 123: `projectId` → `courseId` in LearningBlueprintCreate
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/blueprints/[blueprintId]/objectives/route.ts
- Lines 34, 84: `projectId` → `courseId` in LearningBlueprintSelect
- Lines 41, 91: `.projectId` → `.courseId`
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/blueprints/[blueprintId]/objectives/[objectiveId]/route.ts
- Lines 47, 160: `projectId` → `courseId` in LearningBlueprintSelect
- Lines 54, 167: `.projectId` → `.courseId`
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/curricula/route.ts
- Lines 33, 151, 168, 195: `projectId` → `courseId` in CurriculumCourseWhere
- Lines 62-69, 224-231: `.curriculum` property access — need to add `curriculum` to the select/include so it resolves
- Line 186: `projectId` → `courseId` in CurriculumCourseCreate
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/objectives/route.ts
- Line 31: `projectId` → `courseId` in ObjectiveWhereInput
- Line 130: `projectId` → `courseId` in ObjectiveCreate
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/pages/route.ts
- Lines 47, 143: `projectId` → `courseId` in PageWhereInput
- Line 155: `projectId` → `courseId` in PageCreate
- Line 176: `.projectId` → `.courseId`
- Lines 80, 179: `.createdBy` — check if this needs an include added
- All `params.projectId` → `params.courseId`

### app/api/courses/[courseId]/overview/route.ts
- All `projectId` → `courseId`
- All `params.projectId` → `params.courseId`

### lib/courses/getCourseOverview.ts (was lib/projects/getProjectOverview.ts)
- Line 79: `prisma.project` → `prisma.course`
- Lines 113, 119: `projectId` → `courseId` in ObjectiveWhereInput
- Lines 149, 155: `projectId` → `courseId` in TaskWhereInput
- Rename exported function: `getProjectOverview` → `getCourseOverview`

## Step 4: Update Imports

Search the ENTIRE codebase for:
- `from.*lib/projects` — update to `lib/courses`
- `getProjectOverview` — update to `getCourseOverview`
- `/api/projects/` in any fetch URL — update to `/api/courses/`

## Verification

Run: `npx tsc --noEmit`

Do NOT commit yet — Phase 2B will fix the remaining files. Just confirm the moved files compile.
