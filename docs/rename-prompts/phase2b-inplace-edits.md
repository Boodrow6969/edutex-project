# Phase 2B: Rename Project → Course — In-Place File Edits

## Context
Phase 2A renamed the directories and fixed the moved files. This prompt fixes all REMAINING files that reference `projectId`, `prisma.project`, or `projects` but were NOT moved — they live under other route trees. Same rules apply: rename only, no logic changes.

We are on branch `refactor/project-to-course-rename`.

## Rules (same as 2A)
1. Every `prisma.project` → `prisma.course`
2. Every `projectId` variable/param/field → `courseId`
3. Every `project` variable → `course` (when it refers to this model)
4. Every `projects` relation include → `courses`
5. Every `curriculumId_projectId` compound key → `curriculumId_courseId`
6. Do NOT rename Workspace, Curriculum, or Stakeholder references
7. Do NOT change any business logic — only identifiers

## Files to Fix

### app/api/ai/analyzeNeeds/route.ts
- Line 51: `projectId` → `courseId` in PageSelect

### app/api/ai/generateObjectives/route.ts
- Line 61: `prisma.project` → `prisma.course`

### app/api/ai/generateObjectivesFromAnalysis/route.ts
- Lines 51, 69: `projectId` → `courseId` in PageSelect
- Lines 57, 239: `.projectId` → `.courseId` property access
- Lines 121-124: `.project` → `.course` property access on page include result

### app/api/curricula/[curriculumId]/courses/route.ts
- Lines 39, 68-80: `project` → `course` in select and property access
- Line 144: `prisma.project` → `prisma.course`
- Line 181: `projectId` → `courseId` in create data
- Line 185: `project` → `course` in include
- Lines 211-221: `.project` → `.course` in property access
- Line 236: `prisma.project` → `prisma.course`
- Lines 266, 348: `curriculumId_projectId` → `curriculumId_courseId`
- Line 284: `projectId` → `courseId` in create data

### app/api/curricula/[curriculumId]/courses/reorder/route.ts
- Line 64: `projectId` → `courseId` in CurriculumCourseSelect
- Line 67: `.projectId` → `.courseId`
- Line 82: `curriculumId_projectId` → `curriculumId_courseId`
- Lines 99, 117-122: `project` → `course` in select and property access

### app/api/curricula/[curriculumId]/route.ts
- Line 50: `project` → `course` in CurriculumCourseSelect

### app/api/objectives/[objectiveId]/route.ts
- Line 29: `project` → `course` in ObjectiveInclude
- Line 40: `.projectId` → `.courseId`
- Line 57: `.project` → `.course`

### app/api/pages/[pageId]/route.ts
- Lines 30, 157: `projectId` → `courseId` in PageSelect
- Line 90: `.projectId` → `.courseId`

### app/api/pages/[pageId]/blocks/route.ts
- Line 57: `projectId` → `courseId` in PageSelect

### app/api/pages/[pageId]/blocks/[blockId]/route.ts
- Line 52: `projectId` → `courseId` in PageSelect

### app/api/pages/[pageId]/blocks/reorder/route.ts
- Line 32: `projectId` → `courseId` in PageSelect

### app/api/pages/[pageId]/export/route.ts
- Line 40: `project` → `course` in PageInclude
- Line 78: `.project` → `.course` property access

### app/api/pages/[pageId]/needs-analysis/route.ts
- Line 26: `projectId` → `courseId` in PageSelect

### app/api/pages/[pageId]/storyboard/route.ts
- Line 31: `projectId` → `courseId` in PageSelect

### app/api/pages/[pageId]/task-analysis/route.ts
- Line 26: `projectId` → `courseId` in PageSelect

### app/api/storyboards/[storyboardId]/route.ts
- Line 31: `projectId` → `courseId` in PageSelect

### app/api/workspaces/route.ts
- Lines 30, 113: `projects` → `courses` in WorkspaceInclude
- Lines 64, 141: `.projects` → `.courses` property access

### app/api/workspaces/[workspaceId]/route.ts
- Lines 62, 83: `projects` → `courses` in count/select
- Lines 143, 170: `projects` → `courses` in include/access

### app/api/workspaces/[workspaceId]/workspace-api-route.ts
- Lines 51, 72: `projects` → `courses` in count/select

### lib/auth-helpers.ts
- Lines 204, 230: `prisma.project` → `prisma.course`
- Line 354: `projectId` → `courseId` in PageSelect
- Lines 363-367: `.projectId` → `.courseId`
- Rename function `assertProjectAccess` → `assertCourseAccess`
- Search the entire codebase for any callers of `assertProjectAccess` and update them to `assertCourseAccess`

### lib/tasks/createTasksFromAnalysis.ts
- Line 51: `projectId` → `courseId` in TaskWhereInput
- Line 79: `projectId` → `courseId` in TaskCreate

### prisma/seed.ts
- Line 54: `prisma.project` → `prisma.course`
- Line 96: `projectId` → `courseId`

## Global Search

After fixing all files above, do a global text search across app/ and lib/ for these patterns and fix any remaining:
- `prisma.project` (should be `prisma.course`)
- `projectId` (should be `courseId`)
- `assertProjectAccess` (should be `assertCourseAccess`)
- `getProjectOverview` (should be `getCourseOverview`)
- `lib/projects/` in import statements (should be `lib/courses/`)
- `/api/projects/` in fetch URLs (should be `/api/courses/`)

Do NOT change:
- Files in `node_modules/`, `.next/`, or `prisma/migrations/`
- Historical entries in CHANGELOG.md

## Verification

Run:
```
npx tsc --noEmit
```

Fix any remaining TypeScript errors that are related to the Project → Course rename. Ignore pre-existing unrelated errors.

## Commit (Phase 2A + 2B together)

```
git add -A
git commit -m "refactor: rename Project → Course in all API routes, libraries, and auth helpers"
```
