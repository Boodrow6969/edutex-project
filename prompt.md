Do three things:

1. Update docs/STATUS.md:
   - Change version to 0.16.0
   - Move "Job Aids" from "What's Next" to "What's Built" section
   - Add this entry under What's Built:

### Job Aids — Complete (v0.16.0)
- JobAid Prisma model with JobAidType and JobAidStatus enums
- CRUD API routes: /api/courses/[courseId]/job-aids and /api/courses/[courseId]/job-aids/[jobAidId]
- List/detail split-panel UI with autosave (1500ms debounce)
- Type badges (Checklist, Reference Card, Step Guide, Decision Tree, Other)
- Status tracking (Draft, Review, Approved)
- Content Asset attachment (up to 5 assets per job aid)
- Optional links to Learning Objectives and Task Analyses
- linkedTaskId stored as plain string (no FK) — consistent with TaskAnalysis.sourceTaskId pattern

   - Remove ENH-027 and objective autosave stale entries from What's Next (both verified complete)
   - Update "Recently Completed" to add v0.16.0 entry

2. Update CHANGELOG.md — add new entry at the top:

## [0.16.0] - 2026-03-09

### Added
- JobAid model: JobAidType enum (CHECKLIST, REFERENCE_CARD, STEP_GUIDE, DECISION_TREE, OTHER), JobAidStatus enum (DRAFT, REVIEW, APPROVED)
- CRUD API: /api/courses/[courseId]/job-aids (GET, POST) and /api/courses/[courseId]/job-aids/[jobAidId] (GET, PUT, DELETE)
- JobAidsView component: list/detail split panel, type and status badge toggles, autosave, asset attachment, objective and task linking
- Content Asset attachment support (up to 5 assets, reuses existing AssetAttachment component)
- Linked Objective dropdown (FK to Objective model)
- Linked Task dropdown (plain string reference to TaskAnalysis — no FK, consistent with sourceTaskId pattern)

### Fixed
- Objective autosave confirmed working (STATUS.md entry was stale — implemented in ObjectivesWizard.tsx lines 131–236)
- ENH-027 confirmed resolved (NA panels already pull from stakeholder submissions via StakeholderReference toggle)

### Changed
- JobAid linkedTaskId stored as plain String? with no FK constraint — migration 20260309205548_remove_job_aid_task_fk drops the original FK

3. Run these git commands and report output:
git add -A
git commit -m "feat: Job Aids module — model, API, UI, asset attachment, task/objective linking (v0.16.0)"
git push origin main