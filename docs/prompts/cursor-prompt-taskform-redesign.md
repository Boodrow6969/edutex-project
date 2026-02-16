# Cursor Prompt — TaskForm Redesign + Bug Fixes (feature/task-analysis-module)

You are Claude Code running inside Cursor. We are in **Build mode**.

## Context

We just built the Task Analysis module on branch `feature/task-analysis-module`. The schema, API routes, hook, and page routing are correct and working. The UI needs fixes and a redesign of the task editing experience.

## Problem

The current TaskForm.tsx is a flat classification form with 8 button-toggle groups. It requires the user to already understand instructional design theory to use it. It doesn't guide decisions — it just collects them. A junior ID wouldn't know what to do with it.

## Bugs to Fix

### Bug 1: Impact Note persists when not needed
**File:** `components/pages/task-analysis/TaskForm.tsx`
**Issue:** Impact Note field stays visible after switching from a non-training intervention (like PROCESS_CHANGE) to a training intervention (like TRAINING), or after switching gap type away from MOTIVATION/ENVIRONMENT.
**Fix:** Impact Note should ONLY be visible when `intervention` is NOT `TRAINING` and NOT `PRACTICE`. Re-evaluate visibility on every gap type and intervention change.

### Bug 2: Copy Findings Summary button missing
**File:** `components/pages/task-analysis/FindingsSummary.tsx` and `components/pages/TaskAnalysisView.tsx`
**Issue:** The [Copy Findings Summary] button does not appear when the "Non-Training Findings" filter is active.
**Fix:** Verify FindingsSummary component renders correctly. Check that `TaskAnalysisView.tsx` passes the correct filtered tasks to it and that it renders when `filter === 'non-training'`. The button should appear in the filter/action bar area when the non-training filter is active.

### Bug 3: Needs Analysis Reference Panel missing
**File:** `components/ui/ReferencePanel.tsx` and `components/pages/TaskAnalysisView.tsx`
**Issue:** The floating toggle button for the Needs Analysis split-view panel is not visible on the page.
**Fix:** Verify ReferencePanel.tsx renders a floating toggle button when `isOpen={false}`. The button should be fixed-position at the bottom-left or left edge of the content area. Check that TaskAnalysisView.tsx includes the ReferencePanel in its JSX. If the component was created but is empty or has rendering issues, fix it.

---

## Redesign: TaskForm as Guided Decision Flow

Replace the current flat form with a stepped, conversational flow that guides the ID through the analysis. The form should feel like a conversation, not a classification exercise.

### New TaskForm Layout

The form has 3 sections that appear sequentially. Section 1 is always visible. Sections 2 and 3 appear after the previous section has data.

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION 1: What's the Task?                                  │
│                                                               │
│ Task Title: [Process a customer return in the POS system   ] │
│ Description: [optional textarea                            ] │
│                                                               │
│ ▸ Task Details (collapsed accordion)                         │
│   Criticality / Frequency / Complexity / Knowledge Type      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ SECTION 2: What's the Problem?                               │
│ (appears after title is filled in)                           │
│                                                               │
│ "Why aren't they doing this correctly?"                      │
│                                                               │
│ ┌──────────────────────────┐ ┌──────────────────────────┐   │
│ │ 🔵 They don't know how   │ │ 🟡 They know but can't   │   │
│ │                          │ │    do it well enough     │   │
│ │ Gap: Knowledge           │ │ Gap: Skill               │   │
│ │ They lack the info or    │ │ They understand it but   │   │
│ │ awareness to do this.    │ │ need practice/reps.      │   │
│ └──────────────────────────┘ └──────────────────────────┘   │
│ ┌──────────────────────────┐ ┌──────────────────────────┐   │
│ │ 🔴 They can but won't    │ │ 🟠 Something prevents    │   │
│ │                          │ │    them                  │   │
│ │ Gap: Motivation          │ │ Gap: Environment         │   │
│ │ No consequences, no      │ │ Tools, process, or       │   │
│ │ incentive, or don't see  │ │ resources block correct  │   │
│ │ why it matters.          │ │ performance.             │   │
│ └──────────────────────────┘ └──────────────────────────┘   │
│ ┌──────────────────────────┐                                 │
│ │ ⚪ Multiple factors       │                                 │
│ │                          │                                 │
│ │ Gap: Mixed               │                                 │
│ │ A combination of the     │                                 │
│ │ above.                   │                                 │
│ └──────────────────────────┘                                 │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ SECTION 3: What Should We Do About It?                       │
│ (appears after gap type is selected)                         │
│ (options shown depend on the gap type selected)              │
│                                                               │
│ [Content varies by gap type — see below]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Section 3 — Contextual Intervention Options

The intervention options change based on the gap type selected in Section 2. This is the key UX improvement — instead of showing all 7 interventions equally, show the 2-3 that make sense for the gap type, with a "More options" expander for edge cases.

#### When Gap = KNOWLEDGE:
**Heading:** "They don't know how. What's the best fix?"

**Primary options (shown as cards):**
- **Train them** → TRAINING
  "Build formal instruction. This task will flow into Learning Objectives."
- **Give them a reference** → JOB_AID
  "Create a job aid or quick reference. No formal training needed."

**Secondary options (collapsed under "Other options"):**
- Coaching → COACHING
- Not worth addressing → NONE

#### When Gap = SKILL:
**Heading:** "They know how but can't execute well enough. What's the best fix?"

**Primary options:**
- **Give them practice** → PRACTICE
  "They need reps and feedback. Design practice activities."
- **Train them** → TRAINING
  "They need more structured instruction beyond just practice."

**Secondary options:**
- Coaching → COACHING
- Job aid → JOB_AID
- Not worth addressing → NONE

#### When Gap = MOTIVATION:
**Heading:** "They can do it but choose not to. Training probably won't fix this."

**Primary options:**
- **Fix the incentive/process** → PROCESS_CHANGE
  "Address why they're not motivated. This is a management/org issue."
- **Coaching** → COACHING
  "One-on-one support to address individual motivation."

**Secondary options (with warning):**
- Train them anyway → TRAINING (show warning: "Training rarely fixes motivation problems. Consider whether this will actually change behavior.")
- Not worth addressing → NONE

#### When Gap = ENVIRONMENT:
**Heading:** "The system/tools/process is the problem. Training won't fix the tools."

**Primary options:**
- **Fix the tool or system** → TOOL_IMPROVEMENT
  "Recommend changes to the tool/system that's blocking performance."
- **Fix the process** → PROCESS_CHANGE
  "Recommend process changes to remove the barrier."
- **Work around it with a reference** → JOB_AID
  "If the tool can't be fixed, create a job aid to help them navigate it."

**Secondary options (with warning):**
- Train them anyway → TRAINING (show warning: "Training won't change a broken tool. Document this as a finding for stakeholders.")
- Not worth addressing → NONE

#### When Gap = MIXED:
**Heading:** "Multiple factors are at play. What's the primary intervention?"

Show ALL options as cards, no primary/secondary split. Let the ID decide.

### After Intervention is Selected

Show contextual follow-up fields:

**If intervention = TRAINING or PRACTICE:**
- Intervention Notes textarea (optional): "Any notes about the training approach?"
- Impact Note: HIDDEN
- Show a subtle success message: "✓ This task will feed into Learning Objectives."

**If intervention = anything else (JOB_AID, PROCESS_CHANGE, TOOL_IMPROVEMENT, COACHING, NONE):**
- Intervention Notes textarea (optional): "Describe the recommended action."
- Impact Note textarea (prompted): **"What happens if this isn't addressed correctly?"**
  Helper text: "This builds your case for the stakeholder conversation. Document the cost: time wasted, errors, compliance risk, customer impact."

### Task Details Accordion

The button toggles for Criticality, Frequency, Complexity, and Knowledge Type move into a collapsible "Task Details" accordion at the bottom of Section 1.

- **Collapsed by default** for new tasks
- **Expanded by default** if any non-default values are set
- Header shows a summary when collapsed: "Important · Weekly · Moderate · Procedural"
- Uses the same button-toggle UI as before, but hidden until needed

This keeps the primary flow clean (title → gap → intervention) while preserving the detailed classification for IDs who want it.

---

## Implementation Notes

### Files to modify:
- `components/pages/task-analysis/TaskForm.tsx` — full rewrite as guided flow
- `components/pages/task-analysis/FindingsSummary.tsx` — bug fix
- `components/pages/task-analysis/NeedsAnalysisPanel.tsx` — verify renders
- `components/ui/ReferencePanel.tsx` — verify floating button renders
- `components/pages/TaskAnalysisView.tsx` — verify reference panel integration, verify findings button placement

### Files NOT to modify:
- Schema, API routes, hook, TaskCard, TaskFilters, page routing — all stay as-is

### Design tokens:
- Primary blue: #03428e, hover: #022d61
- Gap type card colors: Knowledge=blue-100, Skill=yellow-100, Motivation=red-100, Environment=orange-100, Mixed=gray-100
- Selected card: 2px border in the gap color, slight shadow
- Warning text: text-amber-600 with a ⚠ icon
- Success text: text-green-600 with a ✓ icon

### Behavior rules:
- Section 2 slides in (CSS transition) after title has ≥ 3 characters
- Section 3 slides in after gap type is selected
- Changing gap type resets intervention to null (forces re-selection with new context)
- All fields autosave on change (debounced PATCH via the existing hook)
- Gap type cards are large enough to be easily clickable on touch screens
- The guided question text ("Why aren't they doing this correctly?") should be styled as a conversational prompt, not a form label — slightly larger, slightly bolder

### Accessibility:
- Gap type and intervention cards must be keyboard-navigable (arrow keys or tab)
- Selected state must be visible without color alone (border + icon change)
- All interactive elements need proper aria labels

Work step by step. Fix the 3 bugs first, then rebuild TaskForm.tsx. Verify npm run build passes when done.
