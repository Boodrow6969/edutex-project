# EDUTex Bugs & Enhancements Tracker

## Bugs

### BUG-001: Flash when creating new course
- **Location:** `components/modals/CreateCourseModal.tsx` (renamed from CreateProjectModal)
- **Issue:** Modal closes before navigation completes, causing brief flash of courses page
- **Fix:** Keep modal open until `router.push()` completes, or remove `onClose()` call since page navigation unmounts modal anyway
- **Priority:** Low (cosmetic)
- **Status:** Open

### BUG-002: Objectives delete popup difficult to dismiss
- **Location:** Objectives Tab
- **Issue:** Deleting objectives triggers native JS confirm/alert window which is clunky and hard to click off
- **Fix:** Replace with custom modal component matching app design patterns
- **Priority:** Medium (UX friction)
- **Status:** Open

### BUG-004: Adding custom block inserts extra space above topmost block
- **Location:** lib/tiptap/extensions/ (ContentScreenNode.ts, LearningObjectivesImportNode.ts)
- **Steps to reproduce:**
  1. Open a storyboard page (empty or with existing blocks)
  2. Add any custom block (Content Screen or Learning Objectives)
  3. Observe: An extra empty space/paragraph appears above the topmost block
- **Expected:** Block should insert without adding extra whitespace
- **Priority:** Low (cosmetic)
- **Status:** Backlog
- **Note:** Originally referenced StoryboardMetadataNode.ts, which was replaced by the CourseInfoHeader component in Phase 1. Bug may still apply to remaining custom block types.

### BUG-005: Workspace sidebar toggle doesn't collapse on second click
- **Location:** Sidebar workspace/course menu component
- **Description:** Clicking a workspace in the sidebar expands it to show its courses, but clicking the same workspace again does not collapse it. The only way to collapse an expanded workspace is to click a different workspace, which expands the new one and collapses the previous. Expected behavior: clicking an expanded workspace should toggle it closed.
- **Priority:** Low (UX)
- **Status:** Open

### BUG-006: Blockquote styling missing italics
- **Location:** `components/tiptap/StoryboardEditor.tsx` — blockquote CSS styles
- **Description:** After the list styling fix, blockquotes no longer default to italic text. The gray background and left border work, but the text appears in normal weight.
- **Expected:** Blockquote text should be italicized by default (matching standard quote styling).
- **Fix:** Add `font-style: italic` to the blockquote styles, or use Tailwind's `italic` class.
- **Priority:** Low (cosmetic)
- **Status:** Open

### BUG-012: Rapid block addition causes block overwrite (CRITICAL)
- **Location:** lib/hooks/useStoryboardEditor.ts, lib/tiptap/sync.ts
- **Severity:** High
- **Status:** Deferred to post-MVP
- **Description:** Adding multiple blocks rapidly causes the first block to be deleted when the second saves. Originally documented as occurring within the 2-second autosave window, but confirmed to occur even after save completes and "Saved" indicator shows.
- **Root Cause:** The `blockId` attribute isn't being preserved through TipTap's `setContent()` roundtrip. The sync layer sees blocks without blockId and marks them for deletion.
- **Workaround:** Wait for "Saved" indicator AND 1-2 additional seconds before adding another block.
- **Proper Fix (future):**
  1. Add explicit blockId attribute handling to TipTap extensions (parseHTML/renderHTML)
  2. Use ProseMirror transactions instead of setContent() for blockId writeback
  3. Or implement client-side temporary IDs at block creation time
- **Affected Block Types:** All custom block types
- **Note:** Originally documented as most noticeable with IMAGE and VIDEO blocks. IMAGE/VIDEO standalone extensions have since been removed, but the underlying race condition still applies to CONTENT_SCREEN and other blocks.

### BUG-013: Course created from Dashboard "+Add Course" does not appear in sidebar
- **Location:** Workspace Dashboard (`app/workspace/[workspaceId]/workspace-detail-page.tsx`) and sidebar (`components/Sidebar.tsx` / `lib/hooks/useWorkspacesTree.ts`)
- **Description:** Creating a course via the "+Add Course" button on the Workspace Dashboard successfully creates the course and displays it on the dashboard, but the sidebar workspace tree does not update to show the new course. Creating a course via the sidebar "+ New Course" link works correctly and appears immediately. The dashboard creation path likely does not trigger the sidebar's data refresh/mutation.
- **Priority:** High (functional)
- **Status:** Open

---

## Enhancements

### ENH-001: ID Dashboard - My Courses Card
- **Location:** Instructional Designer Dashboard
- **Description:** Top card should display "My Courses" for quick access to active work
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
- **Location:** ContentScreenComponent.tsx, StoryboardMetadataComponent.tsx
- **Description:** Trash can icon should always be visible, not just on hover
- **Priority:** Low (cosmetic/UX)
- **Status:** Backlog

### ENH-008: Reorganize Block Picker menu structure
- **Location:** components/tiptap/BlockPicker.tsx
- **Description:** Group basic text blocks (Heading, Paragraph, Bullet List, Numbered List, Quote) as a "Text Formatting" or "Basic" submenu/section, separate from instructional design blocks. Currently all items are at the same level, which doesn't reflect their different purposes.
- **Priority:** Medium (UX)
- **Status:** ⚠️ Likely obsolete — BlockPicker was replaced by StoryboardToolbar in Phase 2. Verify if BlockPicker is still used on non-storyboard pages before closing.

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
- **Location:** Sidebar workspace/course menu component
- **Description:** Allow the chevron arrow on an expanded workspace to collapse the submenu while staying on that workspace's detail page. Currently clicking anywhere on the row navigates + expands. User may want to collapse the submenu without navigating away.
- **Proposed behavior:**
  - Click workspace NAME → navigate + expand (current)
  - Click CHEVRON on already-expanded workspace → collapse submenu only (stay on page)
- **Priority:** Low
- **Status:** Backlog

### ENH-014: Course Page Terminology Updates
- **Date Added:** January 17, 2026
- **Location:** app/workspace/[workspaceId]/course/[courseId]/page.tsx (renamed from project/[projectId])
- **Description:** Update terminology on Course detail page for clarity:
  1. **Breadcrumb**: Should show "Workspaces / [Workspace Name] / [Course Name]"
  2. **"Pages" section**: Rename to something more contextually appropriate for instructional design. Options: "Course Components", "Design Documents", "Course Sections", "Modules"
  3. **"+ New Page" button**: Update label to match new section name (e.g., "+ New Component", "+ New Section")
- **Priority:** Low
- **Status:** Backlog

### ENH-015: Collapsible Course Information & Learning Objectives header
- **Location:** components/storyboard/CourseInfoHeader.tsx, new LO header component
- **Description:** Course Information and Learning Objectives should both appear as fixed header sections above the TipTap editor. Both should auto-minimize/collapse by default so they don't take up too much room. Expandable on click to view/edit details. Learning Objectives pulls from course, Course Information pulls from course name and saves to Storyboard model.
- **Priority:** Medium
- **Status:** Backlog
- **Note:** CourseInfoHeader exists but does not yet have collapse behavior. Learning Objectives header not yet built.

### ENH-016: Delete block cursor behavior
- **Location:** Storyboard editor (TipTap)
- **Description:** When deleting a block in the storyboard editor, the cursor/focus jumps down the page. It should stay in place or move to the previous block.
- **Priority:** Low
- **Status:** Backlog

### ENH-017: Sidebar hierarchy for course subsections
- **Location:** Sidebar component
- **Description:** When viewing a course subsection (Storyboard, Needs Analysis, etc.), the sidebar should show the course hierarchy instead of breadcrumbs at top. Example: Workspace > Course > [Pages list with current page highlighted]. See screenshot reference.
- **Priority:** Medium
- **Status:** Backlog

### ENH-018: Node-based course flow visualization
- **Location:** New component (likely components/course/CourseFlowView.tsx or similar)
- **Description:** Visual map of course structure using React Flow library. Auto-generates from storyboard blocks. Shows section groupings, screen sequences, screen types (color-coded), and branching paths. Nodes clickable to jump to block in editor. Provides at-a-glance view of course architecture.
- **Dependencies:** React Flow library
- **Priority:** Medium (workflow/visualization)
- **Status:** Backlog

### ENH-019: Retrieval risk flags in Objectives Builder
- **Location:** Objectives Builder (LearningBlueprint wizard, Screen 3)
- **Description:** Flag objectives with high "forgetting risk" based on characteristics: information-dense/abstract content, low emotional salience, infrequent use, weak contextual anchors. When flagged, prompt designer: "This objective has characteristics associated with rapid forgetting. Consider retrieval practice, spacing, or job aid strategy."
- **Priority:** Medium (learning theory integration)
- **Status:** Backlog

### ENH-020: Retrieval practice patterns in Activity Pattern library
- **Location:** ActivityPattern definitions (LearningBlueprint wizard, Screen 5)
- **Description:** Extend pattern library with explicit retrieval practice patterns distinct from assessment. Include: retrieval quiz with feedback, spaced retrieval challenges, generation exercises (produce vs. recognize). Patterns should include rationale text citing testing effect research.
- **Priority:** Medium (learning theory integration)
- **Status:** Backlog

### ENH-021: Interleaving recommendations in Activity Pattern sequencing
- **Location:** ActivityPattern sequencing (LearningBlueprint wizard, Screen 5/6)
- **Description:** Detect when designer has blocked similar practice activities together and suggest interleaving. Example prompt: "You've sequenced all customer objection scenarios back-to-back. Research suggests mixing these with product knowledge checks would improve retention and transfer." Include toggle to accept/dismiss recommendation.
- **Priority:** Medium (learning theory integration)
- **Status:** Backlog

### ENH-022: Post-Training Reinforcement Plan output
- **Location:** Blueprint summary and outputs (LearningBlueprint wizard, Screen 6)
- **Description:** Add "Reinforcement Plan" to export options. Based on objective priority and retrieval risk, generate interval schedule spec (e.g., day 1 → day 3 → day 7 → day 14 → day 30) with retrieval challenge suggestions at each interval. Output as handoff document for LMS, email system, or manager follow-up.
- **Priority:** Medium (learning theory integration)
- **Status:** Backlog

### ENH-023: Mixed training type support for needs analysis
- **Location:** lib/questions/, app/api/stakeholder/, components/stakeholder-form/
- **Description:** Support combined training types (e.g., new system FOR compliance). Replace single TrainingType select with "check all that apply." Dynamically render questions from selected types. Future state: AI-assisted question curation that merges selected types while staying theoretically and practically relevant — avoids simply concatenating all questions where overlap exists in intent or ideas.
- **Priority:** Medium (feature expansion)
- **Status:** Backlog

### ENH-024: Per-Entry Revision Notes on Submission Review
- **Location:** components/stakeholder/SubmissionDetailPanel.tsx
- **Description:** When requesting revision, allow the ID to add notes on individual question responses (inline note icon or expandable field per entry in the slide-over panel), in addition to the existing general revision notes field. Stakeholder sees both — specific notes next to the relevant questions, plus the general note at the top of the revision banner. Change log should track which entries received notes.
- **Priority:** Medium (Feature)
- **Status:** Backlog

### ENH-025: Add description field to sidebar course creation
- **Location:** `components/Sidebar.tsx`
- **Description:** The sidebar "+ New Course" inline creation only captures a course name. Add an optional description field or a follow-up prompt/modal that allows entering a description at creation time.
- **Priority:** Low (UX)
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
- **Description:** Tool for drafting course invite/reminder emails with templates that pull course data for prepopulation
- **Complexity:** Medium (email generation, data binding)
- **Status:** Backlog

### FUT-004: Spaced Practice Campaign Scheduler
- **Location:** New module or extension of Reinforcement Plan
- **Description:** Full spaced practice scheduler with calculated intervals based on forgetting curve research. Features: automatic interval optimization based on content complexity and learner context, microlearning retrieval challenge generator, integration hooks for common LMS and marketing automation tools (email sequences), campaign tracking dashboard showing reinforcement touchpoints.
- **Complexity:** High (algorithm design, integrations, new UI)
- **Status:** Next MVP

---

## Completed

### BUG-003: Custom blocks overwrite each other when inserted
- **Status:** Fixed (January 17, 2026)
- **Fix:** Updated custom node extensions to use ProseMirror transaction API

### Storyboard Phase 1: CourseInfoHeader
- **Status:** Complete (February 2026)
- **Description:** Fixed Course Information header above TipTap editor with title, target audience, duration, delivery method. Pre-populates from course. Saves to Storyboard model with 500ms debounced autosave.

### Storyboard Phase 2: Bottom Toolbar (StoryboardToolbar)
- **Status:** Complete (February 2026)
- **Description:** Replaced BlockPicker with fixed bottom toolbar. Buttons for Title/Intro, Content, Video, Practice, Assessment, Scenario, and Learning Objectives. Each inserts a ContentScreen with the correct screenType.

### Storyboard Word Export
- **Status:** Complete (January 22, 2026)
- **Description:** Export storyboard to .docx via `lib/export/storyboard-to-docx.ts` and API route `app/api/pages/[pageId]/export/route.ts`. Produces formatted Word document with metadata, learning objectives, and content screens.

---

## Schema Cleanup Notes

The Prisma `BlockType` enum contains entries with no corresponding TipTap extension or active use. Consider removing in a future migration:

- `STORYBOARD_FRAME` — legacy, replaced by CONTENT_SCREEN
- `CHECKLIST` — planned for M3, never built, decided against
- `TABLE` — planned for M3, never built, decided against
- `FACILITATOR_NOTES` — planned for M3, decided to locate elsewhere
- `MATERIALS_LIST` — planned for M3, decided to locate elsewhere
- `IMAGE` — standalone extension removed; media handled within CONTENT_SCREEN
- `VIDEO` — standalone extension removed; media handled within CONTENT_SCREEN

---

## Decision Notes

These items need decisions before becoming actionable:

- **AI Assistant Scope:** Determine which AI service(s) the assistant should connect to and what context it should have access to

---

*Last updated: February 8, 2026*
