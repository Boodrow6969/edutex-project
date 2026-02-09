# Changelog

All notable changes to EDUTex are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Role-based navigation (ID/SME/Manager dashboards)
- Course tasks and reminders system
- GoLive schedule visualization

---

## [0.11.0] - 2026-02-09

### Added
- **Content Assets — Phase A (Backend + Components)**
  - `ContentAsset` Prisma model with workspace scope, file metadata, tags, and alt text
  - `LocalStorageService` in `lib/storage/` — stores files to `uploads/{YYYY}/{MM}/{uuid}-{name}`
  - Upload + List API: `POST/GET /api/workspaces/[workspaceId]/assets`
  - Single asset API: `GET/PUT/DELETE /api/workspaces/[workspaceId]/assets/[assetId]`
  - File serving API: `GET /api/assets/[assetId]/file` (auth-checked, cached)
  - `SlideOver` component (`components/ui/SlideOver.tsx`) — portal-based right-side panel with escape/backdrop close
  - `AssetUploadZone` — drag-and-drop upload with client-side validation (10 MB, image types only)
  - `WorkspaceAssetBrowser` — searchable thumbnail grid with tag filter chips, collapsible upload zone
  - `AssetAttachment` — inline attach/detach control that opens SlideOver browser
  - Test page at `/test-assets?workspaceId={id}` (to be removed before merge)

### New Files
- `lib/storage/storage-service.ts`
- `lib/storage/index.ts`
- `app/api/workspaces/[workspaceId]/assets/route.ts`
- `app/api/workspaces/[workspaceId]/assets/[assetId]/route.ts`
- `app/api/assets/[assetId]/file/route.ts`
- `components/ui/SlideOver.tsx`
- `components/assets/AssetUploadZone.tsx`
- `components/assets/WorkspaceAssetBrowser.tsx`
- `components/assets/AssetAttachment.tsx`
- `components/assets/index.ts`
- `app/test-assets/page.tsx`

### Changed
- `prisma/schema.prisma` — added ContentAsset model + reverse relations on Workspace and User
- `.gitignore` — added `/uploads/`
- `app/globals.css` — added slide-in-right animation for SlideOver

---

## [0.10.0] - 2026-02-08

### Added
- **Archive/Restore System**
  - `archivedAt` filters on all list endpoints (workspaces, courses, curricula)
  - `?includeArchived=true` query param to include archived items
  - PATCH archive endpoints: `/api/workspaces/[id]/archive`, `/api/courses/[id]/archive`, `/api/curricula/[id]/archive`
  - Body: `{ "action": "archive" | "restore" }`
  - Workspace archive: any member; Course/Curriculum archive: ADMINISTRATOR or MANAGER
- **Toast Notification System** (`components/Toast.tsx`)
  - `ToastProvider` context with `useToast()` hook
  - Auto-dismiss after 8 seconds, optional action button (Undo)
  - `role="status"` and `aria-live="polite"` for accessibility
  - CSS slide-up animation (`@keyframes toast-in` in globals.css)
- **Sidebar Context Menus**
  - Three-dot menu on hover for workspaces, courses, and curricula
  - Archive/Restore option (toggles based on item state)
  - Delete option (red, opens confirmation modal)
  - Click-outside to close
- **"Show Archived" Toggle**
  - Toggle at bottom of workspace list in sidebar
  - Archived items render with `opacity-60` + "Archived" badge
  - Context menu shows "Restore" for archived items
  - Archived items still navigable by click
- **Delete Confirmation Modals**
  - `DeleteWorkspaceModal` — requires typing workspace name to confirm; shows course/curriculum/member counts
  - `DeleteCourseModal` — shows page/task/objective counts
  - `DeleteCurriculumModal` — notes that linked courses are preserved
  - `DeletePageModal` — shows block count
  - All follow existing modal pattern (fixed overlay, white card, header/body/footer)
- **Enhanced Workspace DELETE** (`app/api/workspaces/[workspaceId]/route.ts`)
  - Requires `{ confirmName: string }` body matching workspace name exactly
  - Uses `$transaction` to explicitly delete courses and curricula before workspace

### Changed
- `useWorkspacesTree` hook: added `archivedAt` to interfaces, `archiveItem()`, `deleteItem()`, `showArchived`/`setShowArchived` state
- Workspace GET list endpoint now returns `curricula` alongside `courses`
- `app/workspace/layout.tsx` wrapped with `<ToastProvider>`

### Fixed
- Context menu disappearing when hovering from three-dot button to dropdown (forced opacity-100 when menu is open)
- Context menu appearing transparent on archived items (moved opacity-60 from parent container to visual element only)
- Context menu rendering behind sibling items (added z-40 to item with open menu)

### New Files
- `app/api/workspaces/[workspaceId]/archive/route.ts`
- `app/api/courses/[courseId]/archive/route.ts`
- `app/api/curricula/[curriculumId]/archive/route.ts`
- `components/Toast.tsx`
- `components/modals/DeleteWorkspaceModal.tsx`
- `components/modals/DeleteCourseModal.tsx`
- `components/modals/DeleteCurriculumModal.tsx`
- `components/modals/DeletePageModal.tsx`

---

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

---

## [0.8.0] - 2026-01-21

### Added
- **Storyboard Export to Word (.docx)**
  - Export button in storyboard editor header
  - API endpoint: GET /api/pages/[pageId]/export
  - Converts blocks to professional Word document format
  - Uses `docx` library

### Changed
- **ELEARNING_SCREEN → CONTENT_SCREEN refactor**
  - Renamed block type and all references
  - Added expanded fields: screenType, onScreenText, voiceoverScript, interactionType, interactionDetails, designerNotes, developerNotes
  - Updated Prisma schema, sync layer, extensions, components

### Fixed
- BUG-003: Blocks overwriting each other on insert (used ProseMirror transactions)

---

## [0.7.0] - 2026-01-17

### Added
- **TipTap Storyboard Editor (Milestone 2.5) - Media Support**
  - IMAGE block using @tiptap/extension-image with custom blockId attribute
  - VIDEO block (custom node) supporting YouTube, Vimeo, and file URLs
  - VideoComponent.tsx with embed preview and URL input
  - Block Picker dropdown replacing test buttons
  - LEARNING_OBJECTIVES_IMPORT block with project objectives auto-fetch

### New Files
- `lib/tiptap/extensions/VideoNode.ts`
- `components/tiptap/nodes/VideoComponent.tsx`
- `components/tiptap/nodes/LearningObjectivesImportComponent.tsx`
- `components/tiptap/BlockPicker.tsx`
- `lib/export/storyboard-to-docx.ts`
- `components/storyboard/ExportButton.tsx`
- `app/api/pages/[pageId]/export/route.ts`

---

## [0.6.0] - 2026-01-15

### Added
- **TipTap Storyboard Editor (Milestone 2) - Custom Block Nodes**
  - `STORYBOARD_METADATA` block: Course info header with title, audience, duration, delivery method
  - `ELEARNING_SCREEN` block: Two-column visuals/script layout matching professional storyboard templates
  - Custom TipTap Node extensions with React components (`ReactNodeViewRenderer`)
  - Collapsible developer/designer notes section in eLearning screens
  - Delete buttons on custom blocks (hover to reveal, uses `deleteNode` from NodeViewProps)
  - Test buttons for inserting custom blocks (temporary, pending Block Picker)

### Changed
- Updated `lib/types/blocks.ts` with mapping constants for M2 and M3 block types
- Extended sync layer (`lib/tiptap/sync.ts`) for bidirectional conversion of custom blocks
- Added `lucide-react` icon library for block component icons

### Fixed
- Duplicate block creation bug: blockId now assigned after create operation
- React `flushSync` timing error: wrapped content updates in `queueMicrotask`
- Added `VALID_BLOCK_TYPES` validation in API route for new block types

### New Files
- `lib/tiptap/extensions/StoryboardMetadataNode.ts` - Course info block extension
- `lib/tiptap/extensions/ELearningScreenNode.ts` - eLearning screen block extension
- `components/tiptap/nodes/StoryboardMetadataComponent.tsx` - Course info React component
- `components/tiptap/nodes/ELearningScreenComponent.tsx` - Screen block React component

---

## [0.5.0] - 2026-01-04

### Added
- **TipTap Storyboard Editor (Milestone 1)**
  - TipTap rich text editor integration for STORYBOARD pages
  - Block sync layer (`blocksToTipTap` / `tipTapToBlocks`) for bidirectional conversion
  - Autosave with 2-second debounce
  - Markdown shortcuts: `#` headings, `-` bullet lists, `1.` numbered lists, `>` blockquotes, triple backtick code blocks
  - Basic block types: Paragraph, Heading 1/2/3, Bullet List, Numbered List, Blockquote/Callout
  - Save status indicator with word count
  - Replaced old frame-based `StoryboardView` component

### New Files
- `lib/types/blocks.ts` - Block content TypeScript interfaces
- `lib/tiptap/sync.ts` - Block[] <-> TipTap JSONContent conversion
- `lib/tiptap/extensions/index.ts` - TipTap extension configuration
- `lib/hooks/useStoryboardEditor.ts` - Editor hook with autosave
- `components/tiptap/StoryboardEditor.tsx` - Main editor component

### Dependencies Added
- `@tiptap/react` - React bindings for TipTap
- `@tiptap/starter-kit` - Core TipTap extensions
- `@tiptap/extension-placeholder` - Placeholder text support
- `@tiptap/pm` - ProseMirror dependencies
- `@tailwindcss/typography` - Prose styling for rich text

---

## [0.4.0] - 2026-01-02

### Added
- **Curriculum Management System**
  - Curriculum model with many-to-many course relationships
  - Courses can belong to multiple curricula
  - Bidirectional linking (from curriculum and from course)
  - Create course within curriculum (auto-joins)
  - Curriculum-level pages (Program Needs Analysis, Program Map, Assessment Strategy, Evaluation)
  - Reorder courses within curriculum
  - Curriculum list and detail pages
- Dashboard create buttons for both Course and Curriculum
- "Part of Curricula" field on course editing

### Changed
- Page model now supports belonging to either Project or Curriculum
- Sidebar updated with Curriculum navigation item

---

## [0.3.0] - 2025-12-30

### Added
- **Unified Course Creation Flow**
  - `/workspace/courses` page with styled project cards
  - `CreateProjectModal` component
  - `ProjectCard` component with status badges
  - Auto-creation of 5 default tabs on new course
- **Figma Design System Implementation**
  - Primary brand color: `#03428e`
  - Dark navy sidebar with updated navigation
  - Consistent page headers and breadcrumbs
  - Status badge color system (draft, in-progress, published)
  - AI Assistant floating button (placeholder)
  - Role dropdown in top bar

### Changed
- Sidebar completely restyled to match Figma mockups
- All course tabs now accessible from unified workspace

---

## [0.2.0] - 2025-12-28

### Added
- **Needs Analysis Module (Complete)**
  - 4-tab structure: Problem, Stakeholders, Performance, Success Metrics
  - `GuidancePanel` component with collapsible ID talking notes
  - `MultiInput` component for list fields (constraints, assumptions, personas, etc.)
  - `SubTabBar` component for horizontal tab navigation
  - AI extraction via "Import from Notes" modal
  - Save/Load persistence to database
  - Context-aware questioning for three project types:
    - Performance Problem
    - Software Deployment
    - Compliance/Policy
- API endpoint: `POST/GET /api/projects/[projectId]/needs-analysis`

### Changed
- `NeedsAnalysisView.tsx` refactored from stub to full implementation
- Added helper text to MultiInput ("Press Enter or click + to add")

---

## [0.1.0] - 2025-12-15

### Added
- **Core Platform Foundation**
  - Next.js 15 + React 19 + TypeScript setup
  - Prisma ORM with PostgreSQL
  - Docker development environment
  - Authentication system with dev bypass mode
- **Data Models**
  - User, Workspace, WorkspaceMember
  - Project (Course) with status tracking
  - Page model with multiple page types
  - Learning objectives with Bloom's taxonomy
- **Basic UI**
  - Workspace creation flow
  - Project/Course list view
  - Tab-based course workspace
  - Sidebar navigation
- **AI Integration**
  - Anthropic/OpenAI endpoint scaffolding
  - `MOCK_AI=true` flag for development
  - `analyzeNeeds` API endpoint

### Infrastructure
- Seed script for test data (dev user, demo workspace, sample course)
- Dev auth bypass with database user upsert
- Environment configuration (.env patterns)

---

## [0.0.1] - 2025-11-13

### Added
- Initial project architecture and planning
- MVP blueprint with 4-week development timeline
- Prisma schema design (first draft)
- Shared TypeScript types
- Cursor IDE integration guide
- Development workflow documentation

---

## Version History Summary

| Version | Date | Focus |
|---------|------|-------|
| 0.11.0 | Feb 2026 | Content Assets Phase A — backend + components |
| 0.10.0 | Feb 2026 | Archive/restore, delete modals, toast system |
| 0.9.1 | Feb 2026 | Project → Course rename |
| 0.8.0 | Jan 2026 | Storyboard Export + CONTENT_SCREEN refactor |
| 0.7.0 | Jan 2026 | TipTap Storyboard Editor (Milestone 2.5) - Media Support |
| 0.6.0 | Jan 2026 | TipTap Storyboard Editor (Milestone 2) - Custom Blocks |
| 0.5.0 | Jan 2026 | TipTap Storyboard Editor (Milestone 1) |
| 0.4.0 | Jan 2026 | Curriculum management |
| 0.3.0 | Dec 2025 | Course flow + Figma styling |
| 0.2.0 | Dec 2025 | Needs Analysis module |
| 0.1.0 | Dec 2025 | Platform foundation |
| 0.0.1 | Nov 2025 | Initial planning |

---

*EDUTex - The Instructional Design Analysis & Development Platform*
