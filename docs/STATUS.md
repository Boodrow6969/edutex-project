# EDUTex Project Status

Last Updated: February 28, 2026

---

## Current Version: 0.14.0

---
## To do
- Storyboard needs testing and work
- Job Aids Module needs to be Built
- Refer to the claude chat Next feature: Job Aids module....

## What's Built

### Core Platform
- Authentication (NextAuth) — login, session management
- Workspace management — create, switch, archive/restore, delete (with name confirmation)
- Course management — create, archive/restore, delete (cascade)
- Curriculum management — hierarchical structure with course linking, archive/restore, delete
- Sidebar navigation with context menus (archive, restore, delete) and "Show archived" toggle
- Toast notification system with undo support
- Global Figma design system (primary #03428e, consistent styling)

### Needs Analysis Module — Complete
- Context-aware questioning across 4 training types (Performance Problem, New System/Software, Compliance/Policy Change, Role Change/Expansion)
- 5-tab interface with guided inputs
- AI extraction for responses (mock mode available)
- GuidancePanel component for tab instructions

### Learning Objectives Wizard — Complete (v0.14.0)
- 6-screen wizard: Context & Gap Check, Content Priority, Task Breakdown, Objective Builder (Guided/Freeform), Validation Dashboard, Export & Downstream Handoff
- Horizontal stepper with non-linear navigation and step status indicators
- NA Slide-Over with 5 tabs mapped from QUESTION_MAP sections, training-type-aware labels
- Content Priority triage with coaching text, directional move buttons, theory citations
- Bloom's taxonomy alignment (classic 6-level + Anderson-Krathwohl 2D verb matrix)
- Gap classification with autosave
- View toggle between Guided (ABCD) and Freeform modes
- Validation dashboard: traceability, Bloom's distribution, priority breakdown, assessment alignment

### Task Analysis UI — Rebuilt (v0.14.0)
- New components: TaskAnalysisHeader, TaskInfoBanner, ReferencePanel
- Rebuilt detail view with LearnerContextSection, PriorityScoringPanel, ProceduralStepBuilder

### Content Assets — Phase A Complete
- `ContentAsset` Prisma model (workspace-scoped, image metadata, tags, alt text)
- Local file storage service (`lib/storage/`) with `uploads/{YYYY}/{MM}/` structure
- Full CRUD API: upload, list (search/tag/mimeType filters), get, update metadata, delete
- Auth-checked file serving route with caching
- Reusable UI components: SlideOver, AssetUploadZone, WorkspaceAssetBrowser, AssetAttachment
- Phase B (complete): AssetAttachment integrated into Content, Title/Intro, and Video screen types in storyboard editor

### Storyboard Editor (TipTap) — Complete
- Rich text editor replacing old frame-based system
- Block Picker with 10 block types
- Custom blocks: CONTENT_SCREEN (6 screen types with dynamic fields), LEARNING_OBJECTIVES_IMPORT (auto-fetch + Quick Add), IMAGE, VIDEO
- Bidirectional sync (Block[] ↔ TipTap JSON)
- Autosave with 2-second debounce
- Markdown shortcuts (headings, lists, blockquotes)
- Word export

### Stakeholder Needs Analysis — COMPLETE
- 4 Prisma models: StakeholderAccessToken, StakeholderSubmission, StakeholderResponse, StakeholderChangeLog
- All models use workspaceId (migrated from projectId)
- 39 questions across 5 TypeScript constant files (shared: 11, performance: 6, newSystem: 9, compliance: 7, roleChange: 6)
- Three content layers per question: question text, ID notes, stakeholder guidance
- 10 questions with idNotesExtended (Kirkpatrick, RACI, Mager's diagnostic, etc.)
- 11 API endpoints with token-auth for stakeholder routes, session-auth for ID routes
- Public form UI at /stakeholder/form/[token] — attribution modal, section rendering, autosave (1.5s debounce), required-field validation, revision banner, thank-you state
- Stakeholder data flows into course-level Analysis tab with section-title-based filtering (works across all 4 training types)
- Needs Analysis Reconciliation merged to main (v0.13.1)

### Machine-Consumable Data Layer — Complete (v0.12.0)
- 9 string fields converted to proper Prisma enums across 5 models
- LearningTask model with enum-typed task analysis attributes and hierarchical decomposition
- AssessmentItem model with 9 assessment types (Quiz Builder foundation)
- Objective to LearningTask and Objective to AssessmentItem join tables with alignment tracking
- Objective extended with Mager's ABCD components, external taxonomy mapping, design rationale
- External ID fields on Course, Curriculum, Objective, LearningTask for LMS/taxonomy integration
- Block content _type discriminators on all 13 content interfaces
- ContentScreen split into 6 typed sub-interfaces matching sync.ts field sets
- Design rationale fields on NeedsAnalysis and Storyboard
- 4 database migrations, zero breaking changes

---

## What's Next (In Priority Order)

1. Objective autosave — wire up debounced save for objectives (gap classification pattern exists)
2. Training type tab mappings — define proper QUESTION_MAP mappings for PERFORMANCE_PROBLEM, COMPLIANCE, ROLE_CHANGE
3. Drag-and-drop for Content Priority triage columns
4. Quiz Builder — no dependencies, standalone module
5. Job Aids — uses Content Assets
6. Evaluation Plan — standalone module

## Recently Completed

- **v0.14.0 (Feb 28, 2026):** Learning Objectives Wizard — 6-screen wizard with Content Priority triage, NA Slide-Over redesign (QUESTION_MAP-driven tab mapping), training-type-aware labels, coaching UX. Task Analysis UI overhaul. Bugs fixed: courseType missing from overview select, hardcoded validation labels.
- **v0.13.1 (Feb 21, 2026):** Needs Analysis Reconciliation — section-title-based stakeholder data filtering for all training types, migration history cleanup for laptop environment, course dashboard revamp merged to main.
- **v0.12.0 (Feb 13, 2026):** Machine-consumability migration — 7 new enums, LearningTask model, AssessmentItem model, Objective link tables, block content contracts with _type discriminators, design rationale fields. 4 schema migrations, 5 workstreams, zero breaking changes.
- **v0.11.0 (Feb 9, 2026):** Content Assets Phase A+B — ContentAsset model, local storage service, full CRUD API, reusable components, storyboard integration (Content, Title/Intro, Video screens).
- **v0.10.0 (Feb 8, 2026):** Archive/restore for workspaces, courses, curricula. Delete confirmation modals. Toast notification system. Sidebar context menus. Enhanced workspace DELETE with name confirmation and transactional cascade.

---

## Backlogged Enhancements

- ENH-007: Auto-resize textareas in ContentScreen
- ENH-008: Revisit detailed/compact toggle
- ENH-009: Reorder blocks (up/down arrows)
- ENH-010: Access Content Assets from storyboard editor
- ENH-011: Mixed training type support for stakeholder form
- ENH-014: Delete block cursor behavior
- ENH-015: Collapsible Course Info & Learning Objectives header
- ENH-016: Sidebar hierarchy for course subsections
- BUG-004: Extra space above topmost block

See docs/EDUTEX_BUGS_ENHANCEMENTS.md for full details.

---

## Security Backlog

1. **Input validation** — Add Zod schema validation to: `/pages/[pageId]/needs-analysis`, `/pages/[pageId]/course-analysis`, `/courses/[courseId]/task-analyses`, `/courses/[courseId]/triage-items/.../sub-tasks`. Currently uses loose destructuring with defaults. Address when Zod pattern is established.

2. **Rate limiting** — Add rate limiting to `/stakeholder/form/[token]/*` routes (4 endpoints). These are public/unauthenticated. Required before any staging or external deployment. Suggested: upstash/ratelimit or a simple in-memory limiter for dev validation first.

---

## Tech Stack

- Framework: Next.js 15 + React 19
- Database: PostgreSQL + Prisma ORM
- Editor: TipTap (ProseMirror-based)
- Styling: Tailwind CSS
- Icons: Lucide React
- AI: Anthropic/OpenAI (MOCK_AI=true for dev, set false for production)
- Auth: NextAuth
- Drag & Drop: @dnd-kit

---

## Key Documentation

- CHANGELOG.md (root) — release history
- docs/EDUTEX_BUGS_ENHANCEMENTS.md — bugs and enhancement backlog
- docs/NEXT_STEPS.md — milestone roadmap
- docs/IMPLEMENTATION_SUMMARY.md — architecture and patterns
- docs/SETUP.md — dev environment setup
- docs/EDUTEX_QUICK_REFERENCE.md — one-page cheat sheet
- docs/edutex-stakeholder-*.md — stakeholder feature specs (5 files)
- claude.md (root) — Claude Code project rules

---

*EDUTex - The Instructional Design Analysis & Development Platform*
