# Cursor Prompt — Task Analysis Module (feature/task-analysis-module)

You are Claude Code running inside Cursor. We are in **Plan mode first, then Build mode**.

## Context

EDUTex is a Next.js 15 / React 19 / TypeScript / Tailwind CSS / Prisma / PostgreSQL instructional design platform running in Docker Desktop on Windows 10.

MOCK_AI=true in .env — skip real API calls, use mock responses.

We are on branch `feature/task-analysis-module`.

## Current State

Two parallel task systems exist. We are **consolidating onto LearningTask** and retiring the JSON blob approach.

### LearningTask model (KEEP — this is the target)
```prisma
model LearningTask {
  id              String            @id @default(cuid())
  courseId         String
  title           String
  description     String?           @db.Text
  frequency       TaskFrequency     @default(WEEKLY)
  criticality     TaskCriticality   @default(IMPORTANT)
  complexity      TaskComplexity    @default(MODERATE)
  knowledgeType   KnowledgeType     @default(PROCEDURAL)
  isStandardized  Boolean           @default(true)
  variationNotes  String?           @db.Text
  isFeasibleToTrain Boolean         @default(true)
  feasibilityNotes  String?         @db.Text
  externalId      String?
  externalSource  String?
  parentTaskId    String?
  order           Int               @default(0)
  rationale       String?           @db.Text
  aiGenerated     Boolean           @default(false)
  aiReasoning     String?           @db.Text
  taskAnalysisId  String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  course          Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  parentTask      LearningTask?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  childTasks      LearningTask[]    @relation("TaskHierarchy")
  taskAnalysis    TaskAnalysis?     @relation(fields: [taskAnalysisId], references: [id])
  objectives      ObjectiveTaskLink[]

  @@index([courseId])
  @@map("learning_tasks")
}
```

### Existing enums
```prisma
enum TaskFrequency { DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY }
enum TaskCriticality { CRITICAL, IMPORTANT, SUPPORTIVE }
enum TaskComplexity { SIMPLE, MODERATE, COMPLEX }
enum KnowledgeType { DECLARATIVE, PROCEDURAL, CONDITIONAL, METACOGNITIVE }
```

### TaskAnalysis page model (KEEP as page-level container)
```prisma
model TaskAnalysis {
  id        String @id @default(cuid())
  pageId    String @unique
  page      Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  jobTitle        String @default("")
  roleDescription String @default("") @db.Text
  tasks Json @default("[]")   // LEGACY — stop reading/writing this
  learningTasks  LearningTask[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Existing UI files that will be modified
- `components/pages/TaskAnalysisView.tsx` — current view uses JSON blob TaskItem type
- `lib/types/taskAnalysis.ts` — current TypeScript types for the JSON blob approach
- `app/api/tasks/fromNeedsAnalysis/route.ts` — existing AI task generation from needs analysis

### ObjectiveTaskLink (already exists — DO NOT modify)
```prisma
model ObjectiveTaskLink {
  id             String       @id @default(cuid())
  objectiveId    String
  learningTaskId String
  relationship   String?
  objective      Objective    @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  learningTask   LearningTask @relation(fields: [learningTaskId], references: [id], onDelete: Cascade)
  @@unique([objectiveId, learningTaskId])
  @@map("objective_task_links")
}
```

### PageType enum (already includes TASK_ANALYSIS)
```prisma
enum PageType {
  CUSTOM, NEEDS_ANALYSIS, TASK_ANALYSIS, AUDIENCE_PROFILE,
  LEARNING_OBJECTIVES, ASSESSMENT_PLAN, STORYBOARD, CURRICULUM_MAP,
  PROGRAM_NEEDS_ANALYSIS, PROGRAM_MAP, PROGRAM_ASSESSMENT_STRATEGY, PROGRAM_EVALUATION
}
```

---

## Goal

Extend LearningTask with gap analysis and intervention fields, then rebuild the Task Analysis page UI to use LearningTask records instead of the JSON blob. The result is a working task analysis page where the ID can:

1. Add tasks (what performers need to DO)
2. Rate each task (criticality, frequency, complexity)
3. Classify the gap (why aren't they doing it?)
4. Pick an intervention (training, job aid, process change, etc.)
5. Document impact for non-training findings
6. Filter to see training-only vs non-training findings
7. Copy a findings summary for stakeholder communication

---

## Step 1: Schema Changes

Add two new enums and four new fields to LearningTask.

### New enums
```prisma
// Why aren't they doing it correctly?
enum GapType {
  KNOWLEDGE       // They don't know how
  SKILL           // They know but can't execute
  MOTIVATION      // They can but won't
  ENVIRONMENT     // The system/tools/process prevents it
  MIXED           // Multiple factors
}

// What's the recommended fix?
enum InterventionType {
  TRAINING          // Formal instruction needed
  JOB_AID           // Reference material / performance support
  PRACTICE          // They know it, just need reps
  PROCESS_CHANGE    // Fix the process, not the people
  TOOL_IMPROVEMENT  // Fix the tool/system
  COACHING          // One-on-one or small group support
  NONE              // Not worth addressing / out of scope
}
```

### New fields on LearningTask (add after feasibilityNotes)
```prisma
  // Gap analysis — why aren't they doing it?
  gapType           GapType?
  
  // Recommended intervention
  intervention      InterventionType?
  interventionNotes String?           @db.Text
  
  // Impact documentation for non-training findings
  // "What happens if this isn't addressed through the right intervention?"
  impactNote        String?           @db.Text
```

### Migration
Run `npx prisma migrate dev --name add-gap-intervention-fields` after schema changes.

---

## Step 2: API Routes

Create CRUD routes for LearningTask records scoped to a course's task analysis page.

### Route: `/app/api/courses/[courseId]/learning-tasks/route.ts`

**GET** — List all LearningTasks for a course, ordered by `order` field
- Include count of linked objectives per task
- Return as JSON array

**POST** — Create a new LearningTask
- Required: title, courseId
- All other fields use defaults
- Set order to max(order) + 1 for the course
- Return created task

### Route: `/app/api/courses/[courseId]/learning-tasks/[taskId]/route.ts`

**PATCH** — Update a LearningTask
- Accept partial updates (any subset of fields)
- Validate courseId ownership
- Return updated task

**DELETE** — Delete a LearningTask
- Cascade will handle ObjectiveTaskLink cleanup
- Return success

### Route: `/app/api/courses/[courseId]/learning-tasks/reorder/route.ts`

**PATCH** — Bulk reorder
- Accept array of { id, order } pairs
- Update all in a transaction

### Auth pattern
Follow the existing `assertCourseAccess` pattern from `app/api/tasks/fromNeedsAnalysis/route.ts`. Require DESIGNER role or above.

---

## Step 3: Rebuild TaskAnalysisView.tsx

Replace the current JSON-blob-based component with one that reads/writes LearningTask records via the API routes above.

### Layout

**Page header area:**
- Title: "Task Analysis"
- Job Title and Role Description fields (saved to the TaskAnalysis page model, same as current)
- Summary stats bar: "X tasks | Y flagged for training | Z non-training findings"

**Filter/sort controls:**
- Sort by: Criticality (default) | Frequency | Complexity | Intervention
- Filter by: All | Training only | Job Aid only | Non-training findings
- The "Training only" filter shows tasks where intervention = TRAINING or PRACTICE
- The "Non-training findings" filter shows tasks where intervention = PROCESS_CHANGE, TOOL_IMPROVEMENT, COACHING, or NONE

**Task list:**
- Each task is a card showing: title, criticality badge, frequency, complexity
- Below: gap type → intervention (with color coding)
- Cards are clickable to expand/edit
- [+ Add Task] button at top
- Drag handle or up/down arrows for reorder

**Add/Edit panel** (slide-out or expandable inline):
Fields in order:
1. Title (required) — text input, placeholder: "What does the performer need to do?"
2. Description (optional) — textarea
3. Criticality — 3-button toggle: Critical / Important / Supportive
4. Frequency — 5-button toggle: Daily / Weekly / Monthly / Quarterly / Annually
5. Complexity — 3-button toggle: Simple / Moderate / Complex
6. Knowledge Type — 4-button toggle: Declarative / Procedural / Conditional / Metacognitive
7. Gap Type — dropdown: Knowledge / Skill / Motivation / Environment / Mixed
8. Recommended Intervention — dropdown: Training / Job Aid / Practice / Process Change / Tool Improvement / Coaching / None
9. Intervention Notes (optional) — textarea
10. Impact Note (conditional) — textarea

**UI behavior rules:**
- When Gap Type is MOTIVATION or ENVIRONMENT: auto-default Intervention to PROCESS_CHANGE
- If the ID manually overrides to TRAINING after MOTIVATION/ENVIRONMENT gap: show inline warning text (not a modal): "Training typically doesn't resolve motivation/environment gaps. Consider documenting as a non-training finding."
- When Intervention is NOT Training or Practice: expand the Impact Note field with helper text: "What's the cost if this isn't addressed through the right intervention?"
- Autosave on field blur (debounced PATCH), same pattern as other EDUTex forms

**Non-Training Findings view:**
- When filtered to non-training items, show a [Copy Findings Summary] button
- Button generates plain text to clipboard:

```
Task Analysis Findings — Non-Training Items

1. [Task title]
   Gap: [gapType]
   Recommendation: [intervention]
   Impact: [impactNote or "Not documented"]

2. [Task title]
   ...
```

### Component structure
```
components/pages/TaskAnalysisView.tsx        — main page component
components/pages/task-analysis/TaskCard.tsx   — individual task card
components/pages/task-analysis/TaskForm.tsx   — add/edit form
components/pages/task-analysis/TaskFilters.tsx — sort/filter controls
components/pages/task-analysis/FindingsSummary.tsx — copy findings button
components/pages/task-analysis/NeedsAnalysisPanel.tsx — formatted read-only needs analysis content
components/ui/ReferencePanel.tsx — reusable split-view shell (see Step 5b)
```

### Hooks
```
hooks/useLearningTasks.ts — fetch, create, update, delete, reorder via SWR or React Query (match existing pattern)
```

### Step 5b: Reference Panel (Split View)

A floating button on the Task Analysis page that toggles a split-view layout, showing the approved Needs Analysis as a read-only formatted panel alongside the task list.

**This component is built as a reusable shell** (`components/ui/ReferencePanel.tsx`) so it can be used later on the Objectives page (to reference Task Analysis) and the Storyboard page (to reference Objectives).

#### ReferencePanel.tsx (reusable shell)

```tsx
// Generic split-view container
// Props:
//   isOpen: boolean
//   onToggle: () => void
//   title: string (e.g., "Needs Analysis")
//   children: ReactNode (the formatted content to display)
//   position?: 'left' | 'right' (default: 'left')
```

**Behavior:**
- When closed: the main content takes full width. A floating button is fixed at the edge of the content area (e.g., left edge or bottom-left corner). Button shows an icon + label like "📋 Needs Analysis" or just an icon with tooltip.
- When open: the layout splits. ReferencePanel takes ~40% width on the left, main content takes ~60% on the right. The panel has a header with the title and a close (X) button.
- Transition: smooth CSS transition (width animation or slide-in), not a jarring snap.
- The panel is scrollable independently from the main content. Both sides scroll independently.
- On smaller screens (< 1024px): the panel overlays as a slide-out drawer instead of a true split, with a semi-transparent backdrop. Close on backdrop click.
- The floating toggle button persists in both states — when open it's redundant with the X but keeps the UI consistent.

#### NeedsAnalysisPanel.tsx (content for this specific use)

Fetches and formats the approved Needs Analysis data for the current course. Read-only, no editing.

**Data to display (pulled from the course's Needs Analysis page + stakeholder submissions):**
- Problem Statement / Business Need
- Current Performance vs. Desired Performance
- Target Audience summary
- Key Constraints
- Success Metrics / KPIs
- Stakeholder responses summary (who said what — formatted, not raw JSON)

**Formatting:**
- Clean typography with section headers
- Key data points in bold or highlighted
- Scrollable within the panel
- No edit controls — this is reference material
- If no approved needs analysis exists: show a message "No approved needs analysis found. Complete the Needs Analysis page first." with a link to navigate there.

**Data fetching:**
- Fetch from existing needs analysis API (GET the course's NEEDS_ANALYSIS page data)
- Cache the result — don't re-fetch on every panel toggle
- Loading skeleton while fetching

#### Integration in TaskAnalysisView.tsx

```tsx
const [referencePanelOpen, setReferencePanelOpen] = useState(false);

return (
  <div className="flex h-full">
    <ReferencePanel
      isOpen={referencePanelOpen}
      onToggle={() => setReferencePanelOpen(!referencePanelOpen)}
      title="Needs Analysis"
    >
      <NeedsAnalysisPanel courseId={courseId} />
    </ReferencePanel>

    <div className="flex-1 overflow-y-auto">
      {/* Task Analysis content: header, filters, task list, etc. */}
    </div>
  </div>
);
```

The floating toggle button should be visible regardless of scroll position (fixed or sticky positioning).

---

## Step 4: Wire to Sidebar

Ensure the TASK_ANALYSIS page type renders `TaskAnalysisView` when opened. Check how other page types (NEEDS_ANALYSIS, LEARNING_OBJECTIVES) route to their view components and follow the same pattern.

If TASK_ANALYSIS page is not auto-created when a Course is created, add it to the course creation flow (same pattern as other auto-created pages).

---

## Scope Boundaries

### In scope
- Schema migration (4 fields, 2 enums)
- CRUD API routes for LearningTask
- Rebuilt TaskAnalysisView using LearningTask records
- Sort, filter, summary stats
- Non-training findings copy-to-clipboard
- Gap type → intervention auto-default + warning nudge
- Impact note conditional expansion
- Reusable ReferencePanel split-view component
- NeedsAnalysisPanel (read-only formatted needs analysis for reference while working tasks)

### Out of scope — DO NOT build these
- AI task suggestion (the fromNeedsAnalysis route already exists; wiring it to the new UI is a separate ticket)
- Hierarchical sub-tasks (parentTaskId exists in schema but skip the UI for now)
- Drag-and-drop reorder (up/down arrow buttons are fine for MVP)
- Export/report generation beyond clipboard copy
- Modifying ObjectiveTaskLink or Objective models
- Modifying the Storyboard or any other page types
- Removing the old TaskAnalysis.tasks JSON field (leave it, just stop reading/writing it)

### Existing files to preserve
- `app/api/tasks/fromNeedsAnalysis/route.ts` — do not modify
- `lib/types/taskAnalysis.ts` — can be extended but do not break existing exports (other files may import from it)

---

## Implementation Order

1. Schema changes + migration
2. API routes (GET, POST, PATCH, DELETE, reorder)
3. useLearningTasks hook
4. TaskCard component
5. TaskForm component (add/edit)
6. TaskFilters component
7. FindingsSummary component
8. ReferencePanel (reusable split-view shell)
9. NeedsAnalysisPanel (formatted read-only content)
10. Assemble in TaskAnalysisView.tsx (including reference panel integration)
11. Wire to sidebar/page routing
12. Test: create course → open Task Analysis → toggle needs analysis panel → add tasks → classify → filter → copy findings

Work step by step. Show each file before moving to the next. Run the migration first and confirm it succeeds before writing any UI code.
