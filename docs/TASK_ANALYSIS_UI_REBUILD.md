# Task Analysis UI Rebuild — Claude Code Implementation Prompt

## Context

The Task Analysis module has been rebuilt through Steps 1-2:
- **Step 1**: New Prisma schema — `TaskAnalysis` model with task identity fields, learner context fields, priority scoring (5 criteria), `dataSource` JSON for field origin tracking, optional `objectiveId` and `sourceTaskId` links. `ProceduralStep` model with `instructionalEvent` enum. `TaskAnalysisType` enum (PROCEDURAL, HIERARCHICAL, COGNITIVE).
- **Step 2**: New API routes at `/api/courses/[courseId]/task-analyses/` (GET list, POST create) and `/api/courses/[courseId]/task-analyses/[taskAnalysisId]/` (GET, PUT with step upsert, DELETE).

The old `TaskAnalysisView.tsx` references the deleted old API route (`/api/pages/[pageId]/task-analysis/`). It must be fully replaced.

## Step 3: UI Components

**This is what you're building.** Do NOT modify the schema or API routes — those are done.

### Design Principles

1. **Standalone operation**: Task Analysis works without Needs Analysis data. NA pre-populates when available but nothing is gated.
2. **Data source badges**: Fields that can be pre-populated show origin badges — "From Needs Analysis", "From Objectives", or "Custom" — based on the `dataSource` JSON on the TaskAnalysis record.
3. **Match existing EDUTex patterns**: Use the same component patterns, Tailwind classes, and layout conventions as the existing Needs Analysis and Objectives modules.

---

### Component Architecture

Build these components in order. Each should be its own file under `src/features/task-analysis/components/`.

#### 1. TaskAnalysisListView.tsx
**Purpose**: Course-level list of all task analyses. Entry point from the course dashboard Analysis card grid.

- Fetches `GET /api/courses/[courseId]/task-analyses/`
- Shows card per task analysis: task name, analysis type badge, priority composite score, step count, last updated
- "New Task Analysis" button → creates via POST, navigates to detail view
- Empty state: "No task analyses yet. Create one to break down how a task should be taught."
- Each card links to the detail view

#### 2. TaskAnalysisDetailView.tsx
**Purpose**: Main editing view for a single task analysis. Contains all sections below.

- Fetches `GET /api/courses/[courseId]/task-analyses/[taskAnalysisId]`
- Auto-saves on field blur (PUT to API)
- Layout: vertical scroll with collapsible sections
- Sections in order: Task Identity → Mode Selector → Learner Context → Procedural Step Builder → Priority Scoring

#### 3. TaskIdentitySection.tsx
**Purpose**: Task name, goal, and optional linked references.

Fields:
- `taskName` — text input, required
- `taskGoal` — textarea
- Linked Objective display — if `objectiveId` exists, show objective text as a read-only reference card with link. "Link Objective" button opens a selector modal listing objectives for this course.
- Source Task display — if `sourceTaskId` exists, show the NA task name as a read-only reference. "Link Source Task" button opens selector from course's NA tasks.
- Data source badge next to each field that has a `dataSource` entry

#### 4. ModeSelector.tsx
**Purpose**: Choose task analysis type. MVP = Procedural only.

- Three cards in a row:
  - **Procedural** — "Steps in order. Use when the task has a defined sequence." — Active, selectable
  - **Hierarchical (HTA)** — "Big task with subtasks. Use when the task breaks into parts." — Disabled, "Coming Soon" badge
  - **Cognitive (CTA)** — "Judgment and decision-making. Use when expertise matters more than steps." — Disabled, "Coming Soon" badge
- Selected mode highlighted with primary color border
- Updates `analysisType` field on selection

#### 5. LearnerContextSection.tsx
**Purpose**: Capture audience context for this specific task. Can be pre-populated from Needs Analysis.

Fields:
- `audienceRole` — text input
- `priorKnowledge` — textarea
- `techComfort` — select: "Novice", "Intermediate", "Advanced"  
- `constraints` — textarea (time, environment, equipment limitations)
- `contextNotes` — textarea (freeform observations)

Pre-populate logic:
- On mount, if fields are empty AND course has Needs Analysis data, fetch from `/api/courses/[courseId]/analysis-context`
- Show "Pre-populate from Needs Analysis?" prompt with preview of available data
- If user accepts, fill fields and set `dataSource` entries to `{ source: "needs_analysis", fieldPath: "..." }`
- If user declines or edits, mark as `{ source: "custom" }`
- Badge display: small colored badge next to each field — blue "From NA" / green "Custom"

#### 6. ProceduralStepBuilder.tsx
**Purpose**: Spreadsheet-style step editor for procedural task breakdown.

Layout:
- Table/grid with columns: Step # (auto) | Description | Decision Point? | Instructional Event | Actions
- Each row is a `ProceduralStep`
- "Add Step" button at bottom adds empty row
- Drag handle on left for reorder (update `stepNumber` on drop)
- Inline editing — click cell to edit, blur to save

Row fields:
- `stepNumber` — auto-generated, updates on reorder
- `description` — text input, required
- `isDecisionPoint` — toggle/checkbox
- When `isDecisionPoint` is true, expand inline sub-row with:
  - `branchCondition` — text input ("If X, then...")
  - Two branch paths (text description of each outcome)
- `instructionalEvent` — dropdown: DEMONSTRATION, PRACTICE, DECISION_BRANCH, INFORMATION, EXAMPLE, CAUTION
- `commonErrors` — text input (collapsible or on hover/click)
- `cues` — text input (collapsible)
- `toolsRequired` — text input (collapsible)

Row actions:
- Delete row (with confirmation if step has content)
- Duplicate row
- Move up/down (alternative to drag)

Save behavior:
- Individual step changes save via PUT to the parent task analysis endpoint (which does step upsert)
- Debounced — don't fire on every keystroke

#### 7. PriorityScoringPanel.tsx
**Purpose**: Score task priority across 5 criteria to determine training investment.

Layout: Collapsible panel, expanded by default on first visit.

5 criteria, each with 3-point selector (Low=1, Medium=2, High=3):
- **Criticality** — "How severe are the consequences of doing this task wrong?"
- **Frequency** — "How often do performers execute this task?"
- **Difficulty** — "How hard is this task to learn or perform correctly?"
- **Universality** — "How many people in the target audience need this task?"
- **Feasibility** — "How realistic is it to train this task given current constraints?"

Each criterion: label + help text + three radio-style buttons (Low/Med/High)

Composite score: Sum of all 5 scores (range 5-15). Display as badge:
- 5-8: "Low Priority" (gray)
- 9-11: "Medium Priority" (yellow)
- 12-15: "High Priority" (green)

Low feasibility flag: If `feasibilityScore` = 1 (Low), show a yellow warning below the panel:
"⚠️ Low feasibility flagged. Consider whether this task is practical to train given current constraints. Document constraints in the learner context section."

Auto-save each criterion change via PUT.

---

### Routing

The task analysis views need to be accessible from the course dashboard. Check existing route patterns for the course — likely under:
```
src/app/workspace/[workspaceId]/course/[courseId]/
```

Add:
- Task analysis list: accessible from the course dashboard's Analysis card grid (similar to how other analysis tools are accessed)
- Task analysis detail: `/task-analysis/[taskAnalysisId]` or similar, following existing patterns

**Check existing route structure first before creating new routes.** Match whatever pattern Needs Analysis, Objectives, and Storyboard use.

---

### API Integration Notes

- List endpoint: `GET /api/courses/[courseId]/task-analyses/`
- Create: `POST /api/courses/[courseId]/task-analyses/` with `{ taskName, analysisType }`
- Detail: `GET /api/courses/[courseId]/task-analyses/[taskAnalysisId]`
- Update: `PUT /api/courses/[courseId]/task-analyses/[taskAnalysisId]` — accepts full task analysis fields + `steps` array for upsert
- Delete: `DELETE /api/courses/[courseId]/task-analyses/[taskAnalysisId]`
- Analysis context (for pre-populate): `GET /api/courses/[courseId]/analysis-context`

---

### What NOT To Do

- Do NOT modify `schema.prisma` — schema is final
- Do NOT modify API route handlers — they're done
- Do NOT gate any functionality on Needs Analysis completion
- Do NOT build HTA or CTA modes — just show "Coming Soon" cards
- Do NOT add AI features yet — this is pure CRUD UI

---

### Acceptance Criteria

1. `npm run build` passes clean
2. Can create a new task analysis from course dashboard
3. Can edit task identity fields with auto-save
4. Mode selector shows Procedural active, HTA/CTA as Coming Soon
5. Learner context fields editable; pre-populate prompt appears when NA data exists
6. Data source badges display correctly (From NA / Custom)
7. Can add, edit, reorder, and delete procedural steps
8. Decision point toggle expands branch fields inline
9. Instructional event dropdown works per step
10. Priority scoring updates composite badge in real-time
11. Low feasibility warning displays when feasibility = Low
12. All changes persist on page reload
