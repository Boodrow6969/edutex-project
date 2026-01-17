# EDUTex Bugs & Enhancements Tracker

## Bugs

### BUG-001: Flash when creating new course
- **Location:** `components/modals/CreateProjectModal.tsx`
- **Issue:** Modal closes before navigation completes, causing brief flash of courses page
- **Fix:** Keep modal open until `router.push()` completes, or remove `onClose()` call since page navigation unmounts modal anyway
- **Priority:** Low (cosmetic)

### BUG-002: Objectives delete popup difficult to dismiss
- **Location:** Objectives Tab
- **Issue:** Deleting objectives triggers native JS confirm/alert window which is clunky and hard to click off
- **Fix:** Replace with custom modal component matching app design patterns
- **Priority:** Medium (UX friction)

### BUG-003: Custom blocks overwrite each other when inserted
- **Location:** lib/tiptap/extensions/*.ts (all custom node extensions)
- **Steps to reproduce:**
  1. Open a storyboard page
  2. Add any custom block (Course Information, Content Screen, or Learning Objectives)
  3. Add another custom block
  4. Observe: First block disappears
- **Expected:** All blocks should coexist
- **Priority:** High (blocks core workflow)
- **Status:** Fixed
- **Root Cause:** `commands.insertContent()` replaces the current selection. When the editor contains only atom nodes, focus/selection can inadvertently select existing atoms, causing them to be replaced.
- **Fix:** Updated all three custom node extensions (StoryboardMetadataNode, ContentScreenNode, LearningObjectivesImportNode) to use ProseMirror transaction API with `tr.insert(state.doc.content.size, node)` to append at document end instead of replacing selection.

### BUG-004: Adding custom block inserts extra space above topmost block
- **Location:** lib/tiptap/extensions/ (StoryboardMetadataNode.ts, ContentScreenNode.ts, LearningObjectivesImportNode.ts)
- **Steps to reproduce:**
  1. Open a storyboard page (empty or with existing blocks)
  2. Add any custom block (Storyboard Metadata, Content Screen, or Learning Objectives)
  3. Observe: An extra empty space/paragraph appears above the topmost block
- **Expected:** Block should insert without adding extra whitespace
- **Priority:** Low (cosmetic)
- **Status:** Backlog

## ENH-003: Blockquote styling missing italics
**Status:** Open
**Priority:** Low (cosmetic)
**Component:** Storyboard Editor (TipTap)

**Description:**
After the list styling fix, blockquotes no longer default to italic text. The gray background and left border work, but the text appears in normal weight.

**Expected:**
Blockquote text should be italicized by default (matching standard quote styling).

**Location:**
`components/tiptap/StoryboardEditor.tsx` - blockquote CSS styles

**Fix:**
Add `font-style: italic` to the blockquote styles, or use Tailwind's `italic` class.

---

## Enhancements

### ENH-001: ID Dashboard - My Projects Card
- **Location:** Instructional Designer Dashboard
- **Description:** Top card should display "My Projects" for quick access to active work
- **Priority:** Medium
- **Status:** Planned

### ENH-002: Role-Based Navigation
- **Location:** Sidebar/Navigation component
- **Description:** Sidebar buttons should change dynamically based on which role's dashboard is showing (ID vs SME vs Manager)
- **Priority:** Medium
- **Status:** Planned
- **Notes:** Foundation for multi-role support

### ENH-003: Course Tasks & Reminders
- **Location:** Individual Course view
- **Description:** Show upcoming tasks with tools to create/enhance those tasks. Central task management within course context.
- **Priority:** High
- **Status:** Planned

### ENH-004: Course GoLive Schedules
- **Location:** Individual Course view
- **Description:** Visual timeline with color-coded deadlines for course launch milestones
- **Priority:** Medium
- **Status:** Planned

### ENH-005: Design Sessions Management
- **Location:** Individual Course view
- **Description:** Schedule and track design sessions with SMEs, facilitators, and stakeholders
- **Priority:** Medium
- **Status:** Planned
- **Notes:** May combine with ENH-003 (Tasks & Reminders)

### ENH-006: Style Guide Access
- **Location:** SME Dashboard / Resources
- **Description:** Easy access to organizational style guides (e.g., SFS Style Guide). Use TTU style guide as reference example.
- **Priority:** Low
- **Status:** Planned
- **Notes:** Could be part of a broader "Resources" or "Settings" section

### ENH-007: Always-visible delete button on custom blocks
- **Location:** StoryboardMetadataComponent.tsx, ELearningScreenComponent.tsx
- **Description:** Trash can icon should always be visible, not just on hover
- **Priority:** Low (cosmetic/UX)
- **Status:** Backlog

### ENH-008: Reorganize Block Picker menu structure
- **Location:** components/tiptap/BlockPicker.tsx
- **Description:** Group basic text blocks (Heading, Paragraph, Bullet List, Numbered List, Quote) as a "Text Formatting" or "Basic" submenu/section, separate from instructional design blocks (Course Information, eLearning Screen). Currently all items are at the same level, which doesn't reflect their different purposes.
- **Priority:** Medium (UX)
- **Status:** Backlog

### ENH-009: Auto-resize textareas in storyboard blocks
- **Location:** components/tiptap/nodes/ (ContentScreenComponent.tsx, StoryboardMetadataComponent.tsx, and future block components)
- **Description:** All textareas in custom storyboard blocks should auto-expand based on content length using scrollHeight. Applies to any multi-line input field across all block types.
- **Priority:** Low (UX polish)
- **Status:** Backlog

### ENH-010: Revisit detailed/compact toggle for Learning Objectives Import block
- **Location:** components/tiptap/nodes/LearningObjectivesImportComponent.tsx
- **Description:** Review whether the detailed/compact display mode toggle is necessary or if one default view is sufficient. Consider removing or redesigning.
- **Priority:** Low (UX decision)
- **Status:** Backlog

### ENH-011: Reorder blocks in storyboard editor
- **Location:** components/tiptap/nodes/ (all custom block components), lib/tiptap/
- **Description:** Add up/down arrow buttons to custom blocks to allow reordering without drag-and-drop. Blocks should swap positions and persist the new order.
- **Priority:** Medium (workflow)
- **Status:** Backlog

### ENH-012: Access Content Assets from Storyboard editor
- **Location:** components/tiptap/nodes/ContentScreenComponent.tsx, new Content Assets module
- **Description:** Allow designers to browse and insert media (images, videos, audio files) from a Content Assets folder/library directly into Content Screen blocks. Assets could populate the visuals field or be attached to the block. Requires Content Assets module to be built first.
- **Dependencies:** Content Assets module (not yet built)
- **Priority:** Medium (workflow)
- **Status:** Backlog

### ENH-013: Workspace Chevron Toggle Collapse

**Description:** Allow the chevron arrow on an expanded workspace to collapse the submenu while staying on that workspace's detail page. Currently clicking anywhere on the row navigates + expands. User may want to collapse the submenu without navigating away.

**Proposed behavior:**
- Click workspace NAME → navigate + expand (current)
- Click CHEVRON on already-expanded workspace → collapse submenu only (stay on page)

**Priority:** Low
**Status:** Backlog

### ENH-014: Course Page Terminology Updates

**Date Added:** January 17, 2026

**Description:** Update terminology on Course detail page for clarity:

1. **Breadcrumb**: Currently shows "Workspaces / Project". Should show "Workspaces / [Workspace Name] / [Course Name]" or at minimum "Workspaces / Course"

2. **"Pages" section**: Rename to something more contextually appropriate for instructional design. Options:
   - "Course Components"
   - "Design Documents"
   - "Course Sections"
   - "Modules"

3. **"+ New Page" button**: Update label to match new section name (e.g., "+ New Component", "+ New Section")

**Affected file:** app/workspace/[workspaceId]/project/[projectId]/page.tsx

**Priority:** Low
**Status:** Backlog

---

And here's the corrected submenu order (courses/curricula first, then actions):
```
Dashboard          → /workspace
▼ Workspaces
  ├── [Workspace 1] ▼
  │   ├── 📘 Course A         ← Active content first
  │   ├── 📘 Course B
  │   ├── 📚 Curriculum 1
  │   ├── ─────────────       ← Divider
  │   ├── + New Course        ← Actions second
  │   ├── + New Curriculum
  │   ├── Add Learners
  │   └── Analytics & Reports
  └── [Workspace 2] ►
  └── + New Workspace
Content Assets     → /content
Feedback & QA      → /feedback
Settings (bottom)  → /settings
```

Add an enhancement to docs/EDUTEX_BUGS_ENHANCEMENTS.md:

### ENH-015: Node-based course flow visualization
- **Location:** New component (likely components/project/CourseFlowView.tsx or similar)
- **Description:** Visual map of course structure using React Flow library. Auto-generates from storyboard blocks. Shows section groupings, screen sequences, screen types (color-coded), and branching paths. Nodes clickable to jump to block in editor. Provides at-a-glance view of course architecture.
- **Dependencies:** React Flow library
- **Priority:** Medium (workflow/visualization)
- **Status:** Backlog

---

## Future / Phase 2

### FUT-001: Articulate Review 360 Integration
- **Location:** SME Dashboard
- **Description:** When eLearning is available for SME review in Articulate Review 360, display infocard with link. Track when SME has viewed the course. Alert ID to check SME comments (manual follow-up since no API for comment pull).
- **Complexity:** High (external integration, notification system, time tracking)
- **Status:** Backlog

### FUT-002: In-App Messaging System
- **Location:** SME Dashboard, ID Dashboard, Course pages
- **Description:** SME can message ID through Dashboard. Messages appear on ID Dashboard and specific Course page the SME belongs to.
- **Complexity:** High (messaging infrastructure, notifications)
- **Status:** Backlog

### FUT-003: Course Email Templates
- **Location:** Individual Course view
- **Description:** Tool for drafting course invite/reminder emails with templates that pull project data for prepopulation
- **Complexity:** Medium (email generation, data binding)
- **Status:** Backlog

---

## Completed

(None yet)

---

## Decision Notes

These items need decisions before becoming actionable:

- **AI Assistant Scope:** Determine which AI service(s) the assistant should connect to and what context it should have access to

---

*Last updated: January 17, 2026*
