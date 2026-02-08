# Phase 5: Merge and Post-Merge Verification

## Merge to Main
```powershell
git checkout main
git merge refactor/project-to-course-rename
```

If there are merge conflicts (unlikely since this is a rename-only branch), resolve by keeping the renamed versions.

## Post-Merge Verification

### 1. Database
```powershell
npx prisma studio
```
Confirm:
- `courses` table exists with data
- No `projects` table exists
- `courseId` columns on pages, tasks, objectives, deliverables, learning_blueprints, curriculum_courses

### 2. TypeScript
```powershell
npx tsc --noEmit
```
Should have zero rename-related errors.

### 3. Dev Server
```powershell
npm run dev
```
Walk through:
- Login → Dashboard loads
- Click workspace → courses and curricula display
- Sidebar: "+ New Course" button works
- Click a course → URL is /workspace/[id]/course/[courseId]
- Open storyboard → editor loads and saves
- Create a new course → appears in sidebar

### 4. Final Grep
```powershell
# Should return NO results outside of:
# - node_modules/
# - .next/
# - prisma/migrations/ (historical SQL)
# - CHANGELOG.md (historical entries)
Select-String -Path "app/**/*.ts","app/**/*.tsx","lib/**/*.ts","components/**/*.tsx" -Pattern "prisma\.project[^s]|projectId|assertProjectAccess|getProjectOverview" -Recurse
```

## Ready for Next Feature

You can now branch for archive/delete:
```powershell
git checkout -b feature/archive-delete
```

The Course model is clean and ready for the `archivedAt` field addition.
