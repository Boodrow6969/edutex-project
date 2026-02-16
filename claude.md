# EDUTex – Claude Code Project Rules

## Identity
- EDUTex: instructional design analysis & development platform
- Stack: Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL
- Project root: D:\Dropbox\Dropbox\EduTex\app\

### Important: Project → Course Rename (2026-02-08)
- The Prisma model for courses was renamed from `Project` to `Course`. There is no `Project` model.
- Database table: `courses` (was `projects`). All FKs: `courseId` (was `projectId`).
- API routes: `/api/courses/[courseId]` (was `/api/projects/[projectId]`)
- UI routes: `/workspace/[id]/course/[id]` (was `/workspace/[id]/project/[id]`)
- Auth helper: `assertCourseAccess()` (was `assertProjectAccess()`)
- Library: `lib/courses/getCourseOverview` (was `lib/projects/getProjectOverview`)
- If you see any remaining `Project` model references in code, they are stale and should be updated.

## Rules for Conceptualizing UI
- Instead of the ID needing to know the theory to fill out the form, the form teaches the theory by walking through the decision.
- A junior ID can follow the prompts and arrive at the right completed design.
- An experienced ID moves through it fast because the cards are quick to click.

## Absolute Rules — Never Break These

### File Safety
- Never create files outside app/, components/, lib/, or docs/
- Never delete anything in prisma/ or lib/config/
- Never modify schema.prisma without explicit approval — say "This requires a schema change. Here's what I need to do and why:" and WAIT
- Never modify middleware.ts without explicit approval
- Never modify auth.ts or auth.config.ts without explicit approval
- Never modify layout.tsx without explicit approval
- Never touch .env files

### Architecture Safety
- Never rewrite global state or context providers
- Never modify NextAuth configuration
- Never modify Sidebar.tsx or TopBar.tsx without explicit approval
- Never install new npm packages unless explicitly requested — suggest first, wait for approval
- Never run large refactors (5+ files) without listing every file and getting a green light

### Required Behavior
- Use existing code patterns only — check how similar features are built before writing new code
- Always show diffs before applying changes
- Always ask before creating new folders
- When creating a new feature, it must live in its own folder under the appropriate directory
- Every feature branch must be named feature/[descriptive-name] or fix/[descriptive-name]

### Before Writing Any Code
- Show the spec: what you're building and why
- List every file you will create or modify (the impact list)
- Provide the step-by-step build sequence
- Wait for approval before proceeding

### Before Touching More Than 2 Files
- Simulate the behavior first:
  - Show how the module will appear in the UI
  - List data flow from frontend to backend
  - List required API calls
  - Show failure modes (what breaks if X goes wrong)

### Database Rules
- All Prisma schema changes require manual review, line by line
- Never run prisma migrate without explicit approval
- Never modify seed.ts without approval
- Show the exact SQL or schema diff before any database operation

### Documentation
- After completing a feature, update the relevant docs:
  - CHANGELOG.md (root) — what was done
  - docs/EDUTEX_BUGS_ENHANCEMENTS.md — new bugs found or enhancements identified
  - docs/STATUS.md — current state
- Never modify docs without showing the changes first

### Key Directories
- app/ — Next.js App Router (routes, pages, API routes)
- components/ — React components organized by feature
- lib/ — Business logic, hooks, types, utilities
- lib/tiptap/ — TipTap editor extensions and sync
- lib/questions/ — Stakeholder needs analysis question constants
- lib/types/ — TypeScript type definitions
- prisma/ — Database schema and migrations (PROTECTED)
- docs/ — All project documentation
- docs/prompts/ — Reusable Claude Code prompts

### Environment
- MOCK_AI=true in .env skips real API calls during development
- Set MOCK_AI=false when ready for production AI features
- Dev server: npm run dev
- Build check: npm run build
- Prisma generate: npx prisma generate
