# Phase 4: Update All Documentation for Project → Course Rename

## Context
We are on branch `refactor/project-to-course-rename`. Phases 2 and 3 are done and committed. The codebase now uses `Course` everywhere. Now update all documentation to match.

This is a DOCUMENTATION ONLY session — do not change any code files.

## Files to Update

### STATUS.md
- "Project creation" → "Course creation"
- Any "project" references that mean "course" in the What's Built section
- Update route paths: `/api/projects/` → `/api/courses/`, `/project/` → `/course/`

### NEXT_STEPS.md (in docs/ or root)
- "project" references that mean "course"
- "project blueprint" → "course blueprint" if applicable
- File paths referencing old structure

### CHANGELOG.md
Add a new entry AT THE TOP (do not modify existing historical entries):
```markdown
## [0.9.1] - 2026-02-08

### Changed
- **BREAKING: Renamed Project → Course throughout codebase**
  - Prisma model: `Project` → `Course`, database table: `projects` → `courses`
  - All `projectId` columns renamed to `courseId` across all tables
  - API endpoints: `/api/projects/[projectId]` → `/api/courses/[courseId]`
  - UI routes: `/workspace/[id]/project/[id]` → `/workspace/[id]/course/[id]`
  - Auth helper: `assertProjectAccess()` → `assertCourseAccess()`
  - Library: `lib/projects/getProjectOverview` → `lib/courses/getCourseOverview`
  - Legacy routes: `/projects/` → `/courses/`
  - All components, hooks, and types updated
```

### docs/EDUTEX_BUGS_ENHANCEMENTS.md
- Update any enhancement descriptions that reference "project"
- Update any file paths

### docs/IMPLEMENTATION_SUMMARY.md
- Update architecture references: model names, route paths, relation names

### docs/EDUTEX_QUICK_REFERENCE.md
- Update model names and route paths

### docs/edutex-stakeholder-*.md (all stakeholder spec files)
- These were already migrated from projectId to workspaceId, but check for stale "project" references
- Any mention of "project" as a concept should clarify it's now "course" or "workspace"

### docs/SETUP.md
- If it references seed data or example routes using project terminology, update

### claude.md (ROOT — this is critical)
- This file guides future Claude Code sessions
- Update ALL references to `Project` model → `Course`
- Update ALL references to `projectId` → `courseId`
- Update ALL route paths: `/api/projects/` → `/api/courses/`
- Update ALL UI paths: `/project/` → `/course/`
- Update function names: `assertProjectAccess` → `assertCourseAccess`
- Update library paths: `lib/projects/` → `lib/courses/`
- Add a note: "The Prisma model for courses was renamed from Project to Course on 2026-02-08. There is no Project model."

## Rules for Documentation Updates
- Do NOT modify dates or version numbers on existing entries (except adding the new CHANGELOG entry)
- Do NOT rewrite sections that are historically accurate (e.g., "In Phase 1 we created the Project model" is fine in a historical context — add a note like "(now renamed to Course)")
- DO update any instructions, references, or paths that someone would follow going forward

## Verification

Grep the docs for stale references:
```
Select-String -Path "*.md","docs/*.md","claude.md" -Pattern "projectId|prisma\.project|/api/projects|assertProjectAccess|getProjectOverview|lib/projects" -SimpleMatch
```

Any hits should be in historical CHANGELOG entries only.

## Commit
```
git add -A
git commit -m "docs: update all documentation for Project → Course rename"
```
