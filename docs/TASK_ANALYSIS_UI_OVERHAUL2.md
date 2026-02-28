# Task Analysis UI Overhaul — Split View Layout

## Goal
Restructure the Task Analysis detail view so the Procedural Step Builder is the dominant workspace and all supporting context lives in a collapsible right panel. The ID should be able to type steps while referencing NA data, objectives, or learner context without navigating away.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header Bar (compact)                                            [><]  │
│  Task Name (editable inline) | Mode Badge | Priority Badge | Save      │
├─────────────────────────────────────────────────────────────────────────┤
│  Task Info Banner (full width, collapsible)                       [v]  │
│  Task Goal  |  Linked Objective  |  Source Task                        │
├────────────────────────────────────┬────────────────────────────────────┤
│                                    │  Right Panel (collapsible)         │
│                                    │  ┌──────────────────────────────┐  │
│   Procedural Step Builder          │  │ Learner | Priority |Reference│  │
│   (~65-70% width)                  │  ├──────────────────────────────┤  │
│                                    │  │                              │  │
│   Full step grid                   │  │  Tab content area            │  │
│   - Step # | Description |         │  │  (scrollable independently)  │  │
│     Decision? | Event | Actions    │  │                              │  │
│                                    │  │                              │  │
│   + Add Step                       │  │                              │  │
│                                    │  │                              │  │
│   (scrollable independently)       │  └──────────────────────────────┘  │
└────────────────────────────────────┴────────────────────────────────────┘
```

## Header Bar

Compact single row replacing the old TaskIdentitySection card:

- **Task Name**: Inline editable text (click to edit, blur to save). Large font, truncated with ellipsis if long.
- **Mode Badge**: Small pill showing "Procedural" (or HTA/CTA later). Not a card selector anymore — clicking opens a dropdown if you need to change it. Since HTA/CTA are Coming Soon, this is effectively read-only for MVP.
- **Priority Badge**: Composite score pill (e.g., "High Priority" green badge, "Not Scored" gray). Clicking scrolls/focuses the Priority tab in the right panel.
- **Save Status**: "Saving..." spinner or "Saved 3:42 PM" — same as current, right-aligned.
- **Collapse Toggle**: `[><]` button on far right to collapse/expand the right panel.

Auto-save behavior stays the same (debounced 1500ms PUT).

## Task Info Banner

Full-width collapsible banner between the header and the split-view panels. Provides quick access to task context without taking space from the step builder.

**Default state:** Collapsed — shows a single compact row with key info summary.
**Expanded state:** Shows full editable fields.

### Collapsed View (single row)
Horizontal layout showing:
- **Task Goal** preview (truncated, first ~80 chars with ellipsis)
- **Linked Objective** badge (Bloom level pill + truncated title, or "No objective linked")
- **Source Task** badge (task name pill, or "No source task")
- **Expand chevron** on the right

### Expanded View
Slides open below the collapsed row. Fields:
- **Task Goal** — textarea, editable, auto-saves
- **Linked Objective** — display card + Link/Unlink button (same selector modal as current)
- **Source Task** — display card + Link/Unlink button (same analysis-context fetch as current)

Compact layout — no card wrapper. Light background (e.g., `bg-gray-50`) to visually separate from the header above and the step builder below. Subtle top/bottom borders.

Collapse/expand with smooth transition (`max-height` or `grid-rows` animation).

## Left Panel — Procedural Step Builder

This is the existing `ProceduralStepBuilder.tsx` component, promoted to primary position.

Changes:
- Takes full height of viewport below header (minus header height)
- Independently scrollable (`overflow-y: auto`)
- When right panel is collapsed, expands to full width
- "Add Step" button stays pinned at bottom of the step list (not the viewport)
- Step rows should be slightly more spacious since this is now the main workspace

**No other changes to step builder functionality** — it already works. This is purely a layout promotion.

## Right Panel — Tabbed Context

Default: **open**. Toggle button in header collapses it. Collapsed state shows a thin rail with the toggle button to re-expand.

Width: ~30-35% of viewport when open. Min-width: 320px. Transition: smooth slide.

Independently scrollable (`overflow-y: auto`) — does not scroll with the step builder.

### Tab 1: Learner Context (editable)

Relocated from the old LearnerContextSection card. Fields:

- Audience Role — text input
- Prior Knowledge — textarea  
- Tech Comfort — select dropdown
- Constraints — textarea
- Context Notes — textarea

Pre-populate from NA prompt still appears here (same logic as current, using analysis-context API).

Data source badges still display (From NA / Custom).

### Tab 2: Priority (editable)

Relocated from the old PriorityScoringPanel. Same 5 criteria, 3-point selectors, composite badge.

Low feasibility warning displays within this tab.

Compact layout — criteria can use a tighter grid since they're in a narrower panel.

### Tab 3: Reference (read-only)

**New tab.** Fetches from `/api/courses/${courseId}/analysis-context` on mount (same endpoint LearnerContext uses for pre-populate).

Displays read-only summary of:

- **Problem Summary** — from courseAnalysis.problemSummary
- **Current vs Desired State** — courseAnalysis.currentStateSummary / desiredStateSummary  
- **Audience Profiles** — all audiences from courseAnalysis.audiences (role, headcount, tech comfort, notes)
- **Task Inventory** — all tasks from courseAnalysis.tasks (task name, complexity, intervention, priority)
- **Constraints & Assumptions** — courseAnalysis.constraints[], courseAnalysis.assumptions[]
- **Objectives** — fetch from `/api/courses/${courseId}/objectives`, show list with Bloom badges

Each section is collapsible within the tab. Default: all expanded. Gray background to visually distinguish from editable tabs.

If no NA data exists, show: "No Needs Analysis data available for this course. Complete the Analysis tab to see reference data here."

## Component Architecture

Modify existing files, don't create a whole new component tree:

### Modified Files

1. **TaskAnalysisDetailView.tsx** — Major rewrite. Becomes the split-view layout container.
   - Header bar with inline task name, badges, collapse toggle
   - Task Info Banner (collapsible, full width between header and panels)
   - CSS Grid or Flexbox: left panel (step builder) + right panel (tabbed)
   - Right panel collapse state managed with useState
   - Tab state for right panel (3 tabs: Learner, Priority, Reference)

2. **TaskIdentitySection.tsx** — Refactor into two parts:
   - Task name moves to the header bar (inline editable)
   - Task goal, linked objective, source task move to the Task Info Banner
   - Remove the card wrapper and section header entirely

3. **LearnerContextSection.tsx** — Refactor into compact form for "Learner Context" tab. Remove card wrapper. Keep all fields and pre-populate logic.

4. **PriorityScoringPanel.tsx** — Refactor into compact layout for "Priority" tab. Remove card wrapper. Tighter grid for criteria selectors.

5. **ModeSelector.tsx** — Replace with a small badge/dropdown in the header. No more 3-card layout.

### New Files

6. **TaskInfoBanner.tsx** — New component. Collapsible full-width banner with task goal, linked objective, source task. Accepts same props as the old TaskIdentitySection (minus taskName which is in the header). Handles expand/collapse state internally.

7. **ReferencePanel.tsx** — New component for the Reference tab. Fetches analysis-context, displays read-only sections.

8. **TaskAnalysisHeader.tsx** — Optional: extract header bar into its own component for cleanliness.

## Responsive Behavior

- **>= 1024px**: Split view, right panel open by default
- **< 1024px**: Right panel collapsed by default, overlay when opened (or full-width toggle)
- Collapse toggle always available regardless of screen size

## CSS Notes

- Use `h-[calc(100vh-<header>)]` for both panels to fill viewport
- Both panels: `overflow-y: auto` for independent scrolling
- Right panel transition: `transition-all duration-300` for smooth collapse
- Tab bar: sticky at top of right panel, content scrolls below

## What NOT To Do

- Do NOT change the auto-save logic or API calls — those work
- Do NOT change the step builder's internal functionality (add/edit/delete/reorder/decision points)
- Do NOT change the data source badge system
- Do NOT add new API endpoints — everything needed already exists
- Do NOT build HTA/CTA modes — still Coming Soon

## Acceptance Criteria

1. `npm run build` passes clean
2. Step builder is the dominant visual element (~65-70% width)
3. Right panel opens by default, collapses with toggle
4. All 4 tabs render and are editable (except Reference which is read-only)
5. Reference tab shows NA data when available, empty state when not
6. Task name editable in header, auto-saves
7. Priority badge in header updates when scores change
8. Both panels scroll independently
9. All existing functionality preserved (auto-save, steps, badges, linking)
10. Responsive: works on smaller screens with collapsed panel
