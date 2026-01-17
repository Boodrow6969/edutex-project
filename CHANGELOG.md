# Changelog

All notable changes to EDUTex are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Role-based navigation (ID/SME/Manager dashboards)
- Course tasks and reminders system
- GoLive schedule visualization
- Custom delete confirmation modals

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
| 0.6.0 | Jan 2026 | TipTap Storyboard Editor (Milestone 2) - Custom Blocks |
| 0.5.0 | Jan 2026 | TipTap Storyboard Editor (Milestone 1) |
| 0.4.0 | Jan 2026 | Curriculum management |
| 0.3.0 | Dec 2025 | Course flow + Figma styling |
| 0.2.0 | Dec 2025 | Needs Analysis module |
| 0.1.0 | Dec 2025 | Platform foundation |
| 0.0.1 | Nov 2025 | Initial planning |

---

*EDUTex - The Instructional Design Analysis & Development Platform*
