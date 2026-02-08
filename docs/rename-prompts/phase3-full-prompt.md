# Phase 3: Rename Project → Course in UI Routes, Components, Hooks, and Types

## Context
We are on branch `refactor/project-to-course-rename`. Phase 2 (API routes, libraries, auth helpers) is done and committed. The Prisma model is `Course` with `courseId`. API endpoints are now at `/api/courses/[courseId]/...`. Auth helper is now `assertCourseAccess()`. Library is now `lib/courses/getCourseOverview.ts`.

This is a RENAME ONLY session — do not add features, do not refactor logic, do not change behavior. Only rename identifiers.

## Rules
1. Every URL path segment `/project/` → `/course/`
2. Every URL path segment `/projects/` → `/courses/` (in fetch calls)
3. Every `projectId` variable → `courseId`
4. Every `projectName` prop → `courseName`
5. Every `project` variable → `course` (when referring to this model)
6. Every `Project` type → `Course`
7. Do NOT rename Workspace, Curriculum, or Stakeholder references

## Part A: Page Route Directory Renames

Rename these directories (move all files, preserving contents):

```
app/workspace/[workspaceId]/project/[projectId]/          → app/workspace/[workspaceId]/course/[courseId]/
app/workspace/[workspaceId]/project/[projectId]/page/     → app/workspace/[workspaceId]/course/[courseId]/page/
app/workspace/[workspaceId]/project/[projectId]/page/[pageId]/ → app/workspace/[workspaceId]/course/[courseId]/page/[pageId]/
```

After moving, update every file inside:
- `params.projectId` → `params.courseId`
- Fetch URLs `/api/projects/` → `/api/courses/`
- Variable names `project`/`projectId` → `course`/`courseId`
- URL construction `/project/${projectId}` → `/course/${courseId}`

## Part B: Legacy Routes

These are under `app/projects/` (top-level, outside workspace). They have TypeScript errors:

```
app/projects/page.tsx
app/projects/[id]/page.tsx
app/projects/[id]/blueprints/page.tsx
app/projects/[id]/blueprints/new/page.tsx
app/projects/[id]/blueprints/[blueprintId]/page.tsx
app/projects/[id]/blueprints/[blueprintId]/objectives/page.tsx
```

Rename the entire directory tree:
```
app/projects/ → app/courses/
```

Then update every file inside:
- `prisma.project` → `prisma.course`
- `projectId` → `courseId`
- `.project` property access → `.course`
- `params.id` — if this was used as projectId, add a comment noting it's courseId
- All fetch URLs from `/api/projects/` → `/api/courses/`
- Page titles/labels: "Project" → "Course"

### Specific errors to fix in app/courses/ (was app/projects/):

#### app/courses/page.tsx (was app/projects/page.tsx)
- Lines 28, 44: `prisma.project` → `prisma.course`
- Line 174: parameter `project` → `course`

#### app/courses/[id]/page.tsx (was app/projects/[id]/page.tsx)
- Lines 22, 39: `prisma.project` → `prisma.course`

#### app/courses/[id]/blueprints/page.tsx
- Line 21: `prisma.project` → `prisma.course`
- Line 37: `projectId` → `courseId` in LearningBlueprintWhereInput

#### app/courses/[id]/blueprints/[blueprintId]/page.tsx
- Line 16: `project` → `course` in LearningBlueprintInclude
- Line 57: `.projectId` → `.courseId`
- Lines 127-239: Multiple `.performanceNeeds`, `.objectives`, `.constraints`, `.activityInstances` — these are failing because the include isn't bringing them in. The `project` include needs to become `course` include, but also verify the blueprint query includes its relations.

## Part C: Hook Updates

### lib/hooks/useWorkspacesTree.ts

This is the main data hook for the sidebar. Rename:
- `createProject` function → `createCourse`
- Any `Project` type/interface → `Course` (if it defines one for the course entity)
- `workspace.projects` → `workspace.courses` in return types and data access
- Fetch URL `/api/projects` → `/api/courses` (in any fetch calls)
- `projectId` params → `courseId`
- The exported `Workspace` type: if it has a `projects` field, rename to `courses`

### Any other hooks in lib/hooks/
Search for `project` references and rename to `course`.

## Part D: Component Updates

### components/Sidebar.tsx

State variables:
- `showCreateProject` → `showCreateCourse`
- `newProjectName` → `newCourseName`
- `creatingProject` → `creatingCourse`

Functions:
- `handleCreateProject` → `handleCreateCourse`
- `createProject` (from hook) → `createCourse`

Template:
- `isCreatingProjectHere` → `isCreatingCourseHere`
- `workspace.projects.map(...)` → `workspace.courses.map(...)`
- Inside the map: `project` variable → `course`
- URL: `/workspace/${workspace.id}/project/${project.id}` → `/workspace/${workspace.id}/course/${course.id}`
- `pathname?.includes(project.id)` → `pathname?.includes(course.id)`

### components/TopBar.tsx

- `projectName` prop → `courseName`
- `TopBarProps` interface: `projectName?: string` → `courseName?: string`
- Any parent page passing `projectName={...}` → `courseName={...}`

## Part E: Page Components

### app/workspace/[workspaceId]/page.tsx
If this page lists projects or links to `/project/`:
- Change data fetching: `/api/projects` → `/api/courses`
- Change links: `/project/` → `/course/`
- Change variable names: `project` → `course`, `projects` → `courses`
- Change display labels: "Project" → "Course" (in headings, buttons, etc.)

### app/workspace/[workspaceId]/workspace-detail-page.tsx
Same treatment — likely has project references in fetch calls, links, and display.

### app/workspace/courses/page.tsx
Update internal fetch URLs and variable names.

### app/workspace/curriculum/page.tsx
If it references projects (for linking courses to curricula), update.

### app/workspace/[workspaceId]/curriculum/[curriculumId]/page.tsx
If it shows linked courses using project variable names, update.

### app/workspace/[workspaceId]/course/[courseId]/page.tsx (moved from project/)
All internal references should already be updated from Part A, but verify.

## Part F: Type Definitions

### lib/types/ directory
Search all files for:
- `Project` interface/type → `Course`
- `projectId` field → `courseId`
- `projectType` field → `courseType`

## Part G: Global Search

After all fixes, search the ENTIRE codebase (excluding node_modules, .next, prisma/migrations) for:
- `projectId` — should only appear in migration SQL files and CHANGELOG history
- `projectName` — should not appear anywhere
- `/project/` in URL strings — should be `/course/`
- `/api/projects` in fetch calls — should be `/api/courses`
- `createProject` — should be `createCourse` (except in unrelated contexts)
- `"Project"` as a UI label — should not appear user-facing
- `lib/projects/` in imports — should be `lib/courses/`
- `assertProjectAccess` — should be `assertCourseAccess`
- `getProjectOverview` — should be `getCourseOverview`

## Verification

### Step 1: TypeScript
```
npx tsc --noEmit
```
Fix any remaining rename-related errors. Ignore pre-existing unrelated errors.

### Step 2: Manual browser check
1. Start the dev server: `npm run dev`
2. Navigate to the workspace dashboard — confirm it loads
3. Click a workspace — confirm courses list renders
4. Click a course — confirm URL is `/workspace/[id]/course/[id]` (not `/project/`)
5. Open a storyboard page within a course — confirm it loads
6. Check the sidebar — "New Course" button works, creates a course

### Step 3: Commit
```
git add -A
git commit -m "refactor: rename Project → Course in UI routes, components, hooks, and types"
```
