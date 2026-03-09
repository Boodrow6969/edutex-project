# EDUTex Project Status

Last Updated: March 9, 2026

---

## Current Version: 0.16.0

---

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
- Context-aware questioning across 4 training types (Performance Problem, Tool & Process, Compliance/Policy Change, Role Change/Expansion)
- Token-based stakeholder form with autosave, revision cycle, approval workflow
- 5-tab reconciled Analysis view with audience profiles, task/competency matrix, training decision
- Type-specific learner profiles for non-TOOL_AND_PROCESS types
- Stakeholder data flows into course-level analysis panels via section-title-based filtering
- QUESTION_MAP-driven tab architecture (dynamic, not hardcoded)

### Learning Objectives Wizard — Complete (v0.14.0)
- 6-screen wizard: Context & Gap Check, Content Priority, Task Breakdown, Objective Builder (Guided/Freeform), Validation Dashboard, Export & Downstream Handoff
- Guided/Freeform toggle with bidirectional data preservation
- Bloom's taxonomy alignment (classic 6-level + Anderson-Krathwohl 2D verb matrix)
- Gap classification with autosave
- NA Slide-Over with 5 QUESTION_MAP-driven tabs, training-type-aware labels
- Content Priority triage with coaching text, theory citations, directional move buttons
- Export: Word/PDF, Push to Storyboard, Push to Assessment Builder, Copy to Design Strategy
- Push to Storyboard / Assessment Builder buttons present but not yet wired

### Task Analysis — Rebuilt (v0.14.0)
- Procedural step decomposition with full field set (decision points, error modes, cues, tools, instructional events)
- Priority scoring panel (criticality, frequency, difficulty, universality, feasibility)
- Learner context fields (standalone or pre-populated from NA)
- Optional links to Learning Objectives
- Split-view layout with step builder as dominant workspace
- Non-training findings tracking with gap/intervention classification
- Bilateral sync placeholder only — not yet functional

### Storyboard Editor (TipTap) — Complete
- Rich text editor with block-based architecture
- Bottom toolbar for block insertion (Title/Intro, Content, Video, Practice, Assessment, Scenario, Learning Objectives)
- ContentScreen blocks with 6 type-specific field layouts
- Bidirectional sync layer (Block[] ↔ TipTap JSON)
- Autosave with 2-second debounce
- CourseInfoHeader (fixed above editor, pre-populated from course)
- Word export
- Content Assets integrated into Content, Title/Intro, and Video screen types

### Job Aids — Complete (v0.16.0)
- JobAid Prisma model with JobAidType and JobAidStatus enums
- CRUD API routes: /api/courses/[courseId]/job-aids and /api/courses/[courseId]/job-aids/[jobAidId]
- List/detail split-panel UI with autosave (1500ms debounce)
- Type badges (Checklist, Reference Card, Step Guide, Decision Tree, Other)
- Status tracking (Draft, Review, Approved)
- Content Asset attachment (up to 5 assets per job aid)
- Optional links to Learning Objectives and Task Analyses
- linkedTaskId stored as plain string (no FK) — consistent with TaskAnalysis.sourceTaskId pattern

### Content Assets — Complete (v0.11.0)
- ContentAsset Prisma model (workspace-scoped)
- Local file storage service with uploads/{YYYY}/{MM}/ structure
- Full CRUD API with search/tag/mimeType filters
- Reusable UI: SlideOver, AssetUploadZone, WorkspaceAssetBrowser, AssetAttachment

### Machine-Consumable Data Layer — Complete (v0.12.0)
- 9 string fields converted to Prisma enums across 5 models
- LearningTask model with enum-typed attributes and hierarchical decomposition
- AssessmentItem model with 9 assessment types (Quiz Builder foundation)
- Objective ↔ LearningTask and Objective ↔ AssessmentItem join tables
- Block content _type discriminators on all 13 content interfaces
- ContentScreen split into 6 typed sub-interfaces
- Design rationale fields on NeedsAnalysis and Storyboard
- DesignStrategy model (one per course, populated from LO Wizard export)

### Security
- Cryptographically secure stakeholder tokens
- Redis rate limiting on public endpoints
- Zod validation pattern across API routes
- Production guards on SKIP_AUTH

---

## What's Next (In Priority Order)

1. **Drag-and-drop** — Content Priority triage columns
2. **Quiz Builder** — no upstream dependencies, standalone module, schema foundation already exists (AssessmentItem model)
3. **Evaluation Plan** — standalone module, no dependencies
8. **Task Analysis bilateral sync** — currently placeholder only
9. **Storyboard testing** — needs end-to-end workflow validation

---

## Recently Completed

- **v0.16.0 (Mar 9, 2026):** Job Aids module — JobAid model with type/status enums, CRUD API, list/detail split-panel UI with autosave, content asset attachment (up to 5), objective and task analysis linking. Removed stale STATUS entries (objective autosave, ENH-027 — both already implemented).
- **v0.15.0 (Mar 8, 2026):** NA refinement sprint — shared ResponseValue renderer, NEW_SYSTEM → TOOL_AND_PROCESS rename, training type tab mappings for all 4 types, question rewrites (SYS_01/04), SYS_02 removed. Fixed BUG-016/017 (table rendering, conditional filtering), BUG-018/019 (training type label, audience JSON parsing).
- **v0.14.0 (Feb 28, 2026):** Learning Objectives Wizard (6-screen), NA Slide-Over redesign (QUESTION_MAP-driven), Content Priority triage coaching UX, Task Analysis UI overhaul. Fixed courseType missing from overview select and hardcoded validation labels.
- **v0.13.1 (Feb 21, 2026):** Needs Analysis Reconciliation — section-title-based stakeholder data filtering, migration history cleanup, course dashboard revamp merged to main.
- **v0.13.0 (Feb 17, 2026):** Full question system rewrite across 4 training types, type-specific learner profiles, reconciled analysis UI.
- **v0.12.0 (Feb 13, 2026):** Machine-consumability migration — 7 enums, LearningTask, AssessmentItem, link tables, block content contracts, design rationale fields.
- **v0.11.0 (Feb 9, 2026):** Content Assets Phase A+B.
- **v0.10.0 (Feb 8, 2026):** Archive/restore, delete modals, toast system, sidebar context menus.

---

## Backlogged Enhancements (Selected)

- ENH-009: Auto-resize textareas in ContentScreen
- ENH-011: Reorder blocks (up/down arrows)
- ENH-013: Workspace chevron collapse
- ENH-015: Collapsible Course Info & Learning Objectives header
- ENH-016: Delete block cursor behavior
- ENH-017: Sidebar hierarchy for course subsections
- ENH-018: Node-based course flow visualization
- ENH-023: Mixed training type support for stakeholder form
- ENH-028: NA page redesign
- ENH-032: Context Hotspots — contextual NA reference system

See docs/EDUTEX_BUGS_ENHANCEMENTS.md for full details.

---

## Open Bugs

| ID | Description | Priority | Status |
|----|-------------|----------|--------|
| BUG-004 | Extra space above topmost storyboard block | Low | Backlog |
| BUG-012 | Rapid block addition causes block overwrite | High | Deferred post-MVP |
| BUG-014 | NA dashboard badge shows "Not Started" when links are active | Medium | Open |
| BUG-016 | REPEATING_TABLE fields render as concatenated string in review panel | Minor | Fixed (v0.15.0) |
| BUG-017 | Duplicate conditional questions in review panel | Minor | Fixed (v0.15.0) |
| BUG-018 | New task accordion steals focus from Description field | Low | Open |
| BUG-019 | Copy Findings Summary button only visible in Non-Training filter | Low | Open |
| BUG-015 | NA only shows Stakeholder Data button after submission approval (no notice) | Low | Open |

---

## Security Backlog

1. **Input validation** — Add Zod to: `/pages/[pageId]/needs-analysis`, `/pages/[pageId]/course-analysis`, `/courses/[courseId]/task-analyses`, `/courses/[courseId]/triage-items/.../sub-tasks`
2. **Rate limiting** — Add to `/stakeholder/form/[token]/*` routes before any external deployment

---

## Tech Stack

- Framework: Next.js 15 + React 19
- Database: PostgreSQL + Prisma ORM
- Editor: TipTap (ProseMirror-based)
- Styling: Tailwind CSS
- Icons: Lucide React
- AI: Anthropic/OpenAI (MOCK_AI=true for dev)
- Auth: NextAuth
- Drag & Drop: @dnd-kit

---

## Key Documentation

- CHANGELOG.md (root) — release history
- docs/EDUTEX_BUGS_ENHANCEMENTS.md — bugs and enhancement backlog
- docs/edutex-dev-reference.md — condensed coding patterns cheat sheet
- claude.md (root) — Claude Code project rules

---

*EDUTex - The Instructional Design Analysis & Development Platform*
