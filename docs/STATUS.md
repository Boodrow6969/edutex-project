# EDUTex Project Status

Last Updated: February 9, 2026

---

## Current Version: 0.11.0

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

### Learning Objectives — Complete
- Manual creation and AI-generated objectives
- Bloom's taxonomy alignment
- Quick Add form
- Links to needs analysis data

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

### Stakeholder Needs Analysis — Steps 1-4 Complete, Step 5 Pending
- 4 Prisma models: StakeholderAccessToken, StakeholderSubmission, StakeholderResponse, StakeholderChangeLog
- All models use workspaceId (migrated from projectId)
- 39 questions across 5 TypeScript constant files (shared: 11, performance: 6, newSystem: 9, compliance: 7, roleChange: 6)
- Three content layers per question: question text, ID notes, stakeholder guidance
- 10 questions with idNotesExtended (Kirkpatrick, RACI, Mager's diagnostic, etc.)
- 11 API endpoints with token-auth for stakeholder routes, session-auth for ID routes
- Public form UI at /stakeholder/form/[token] — attribution modal, section rendering, autosave (1.5s debounce), required-field validation, revision banner, thank-you state
- All endpoints verified: GET form, POST identify, PUT responses, POST submit return 200
- Pending: Browser testing with real token, Step 5 (ID Review UI + dashboard integration)

---

## What's Next (In Priority Order)

1. Stakeholder needs analysis browser testing — create test token, full form walkthrough
2. DATE_WITH_TEXT component — hybrid text input with calendar toggle (Cursor prompt ready)
3. Step 5: ID Review UI — wire stakeholder feature into workspace dashboard
4. Quiz Builder — no dependencies, standalone module
5. Job Aids — uses Content Assets
7. Evaluation Plan — standalone module

## Recently Completed

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
