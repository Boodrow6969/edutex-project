# Needs Analysis Reconciliation — Implementation Spec

## Summary

Replace the old `NeedsAnalysis` model with a leaner `CourseAnalysis` model. The course-level NA page becomes a layered view: stakeholder submission data (read-only, from workspace) + ID-authored analysis fields (editable). Four tabs: Analysis, Stakeholders, Success Metrics, Objectives.

Addresses: **ENH-027** (reference panel pulls from stakeholder submissions) and **ENH-028** (NA page redesign).

---

## Phase 1: Schema Migration

### 1A. New Prisma Model

Add to `prisma/schema.prisma`:

```prisma
model CourseAnalysis {
  id        String @id @default(cuid())
  pageId    String @unique
  page      Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)

  // ID-authored analysis fields
  problemSummary       String   @default("")
  currentStateSummary  String   @default("")
  desiredStateSummary  String   @default("")
  constraints          String[] @default([])
  assumptions          String[] @default([])

  // Course-specific stakeholders
  learnerPersonas  String[] @default([])
  stakeholders     String[] @default([])
  smes             String[] @default([])

  // Training decision
  isTrainingSolution    Boolean?
  nonTrainingFactors    String?    @db.Text
  solutionRationale     String?    @db.Text

  // Success Metrics (Kirkpatrick)
  level1Reaction String @default("")
  level2Learning String @default("")
  level3Behavior String @default("")
  level4Results  String @default("")

  // AI analysis capture
  aiAnalysis            String?    @db.Text
  aiRecommendations     String[]   @default([])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("course_analyses")
}
```

### 1B. Update Page Model

```prisma
model Page {
  // ... existing fields ...
  needsAnalysis NeedsAnalysis?  // KEEP temporarily during migration
  courseAnalysis CourseAnalysis? // ADD
  taskAnalysis  TaskAnalysis?
  storyboard    Storyboard?
}
```

### 1C. Migration

```bash
npx prisma migrate dev --name add_course_analysis
```

### 1D. Data Migration Script

Create `scripts/migrate-needs-to-course-analysis.ts`:

```typescript
import prisma from '../lib/prisma';

async function migrate() {
  const records = await prisma.needsAnalysis.findMany();
  console.log(`Migrating ${records.length} NeedsAnalysis records...`);

  for (const na of records) {
    await prisma.courseAnalysis.upsert({
      where: { pageId: na.pageId },
      create: {
        pageId: na.pageId,
        problemSummary: na.problemStatement,
        currentStateSummary: na.currentState,
        desiredStateSummary: na.desiredState,
        constraints: na.constraints,
        assumptions: na.assumptions,
        learnerPersonas: na.learnerPersonas,
        stakeholders: na.stakeholders,
        smes: na.smes,
        isTrainingSolution: na.isTrainingSolution,
        nonTrainingFactors: na.nonTrainingFactors,
        solutionRationale: na.solutionRationale,
        level1Reaction: na.level1Reaction,
        level2Learning: na.level2Learning,
        level3Behavior: na.level3Behavior,
        level4Results: na.level4Results,
        aiAnalysis: na.aiAnalysis,
        aiRecommendations: na.aiRecommendations,
      },
      update: {},  // Skip if already exists
    });
  }

  console.log('Migration complete.');
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
```

Run: `npx tsx scripts/migrate-needs-to-course-analysis.ts`

### 1E. Drop Old Model (later, after everything works)

Remove `NeedsAnalysis` model from schema, run:
```bash
npx prisma migrate dev --name drop_needs_analysis
```
Remove `needsAnalysis` from Page model.

---

## Phase 2: Types

### 2A. New Type File

Create `lib/types/courseAnalysis.ts`:

```typescript
/**
 * Types for Course Analysis (replaces old NeedsAnalysisFormData)
 */

export interface CourseAnalysisFormData {
  // ID synthesis fields
  problemSummary: string;
  currentStateSummary: string;
  desiredStateSummary: string;
  constraints: string[];
  assumptions: string[];

  // Course-specific stakeholders
  learnerPersonas: string[];
  stakeholders: string[];
  smes: string[];

  // Training decision
  isTrainingSolution: boolean | null;
  nonTrainingFactors: string;
  solutionRationale: string;

  // Success Metrics (Kirkpatrick)
  level1Reaction: string;
  level2Learning: string;
  level3Behavior: string;
  level4Results: string;
}

export const defaultCourseAnalysisFormData: CourseAnalysisFormData = {
  problemSummary: '',
  currentStateSummary: '',
  desiredStateSummary: '',
  constraints: [],
  assumptions: [],
  learnerPersonas: [],
  stakeholders: [],
  smes: [],
  isTrainingSolution: null,
  nonTrainingFactors: '',
  solutionRationale: '',
  level1Reaction: '',
  level2Learning: '',
  level3Behavior: '',
  level4Results: '',
};

/**
 * Stakeholder submission response for display in the Analysis tab
 */
export interface StakeholderResponseDisplay {
  question: string;
  value: string;
  questionId: string;
}

export interface StakeholderSectionDisplay {
  title: string;
  responses: StakeholderResponseDisplay[];
}

export interface StakeholderSubmissionDisplay {
  id: string;
  stakeholderName: string;
  trainingType: string;
  submittedAt: string;
  status: string;
  sections: StakeholderSectionDisplay[];
}

/**
 * Workspace contact for read-only display
 */
export interface WorkspaceContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

/**
 * Combined data returned by the analysis-context API
 */
export interface AnalysisContext {
  courseAnalysis: CourseAnalysisFormData;
  submissions: StakeholderSubmissionDisplay[];
  workspaceContacts: WorkspaceContact[];
}
```

---

## Phase 3: API Routes

### 3A. Course Analysis CRUD

Create `app/api/pages/[pageId]/course-analysis/route.ts`:

**GET** — Returns `CourseAnalysisFormData` for the page. Falls back to defaults if none exists.

**PUT** — Upserts `CourseAnalysis` record. Same auth pattern as existing needs-analysis route.

(This is a near-copy of the existing `needs-analysis/route.ts` with updated field names.)

### 3B. Analysis Context (merged data)

Create `app/api/courses/[courseId]/analysis-context/route.ts`:

**GET** — Returns `AnalysisContext` combining:

1. All approved `StakeholderSubmission` records for the course's workspace, with responses joined and grouped by question section.
2. The `CourseAnalysis` data for the course's NEEDS_ANALYSIS page.
3. Workspace contacts from the workspace's `stakeholders` JSON field.

```typescript
// Pseudocode for the handler:
const course = await prisma.course.findUnique({
  where: { id: courseId },
  select: { workspaceId: true },
});

const submissions = await prisma.stakeholderSubmission.findMany({
  where: {
    workspaceId: course.workspaceId,
    status: 'APPROVED',
  },
  include: {
    responses: true,
    token: { select: { stakeholderName: true, trainingType: true } },
  },
  orderBy: { submittedAt: 'desc' },
});

// Group responses by section using question metadata from lib/questions/
// Return structured StakeholderSubmissionDisplay[]

const naPage = await prisma.page.findFirst({
  where: { courseId, type: 'NEEDS_ANALYSIS' },
  include: { courseAnalysis: true },
});

const workspace = await prisma.workspace.findUnique({
  where: { id: course.workspaceId },
  select: { stakeholders: true },
});

return { courseAnalysis, submissions, workspaceContacts };
```

### 3C. Keep Old Route (backward compat)

Keep `app/api/pages/[pageId]/needs-analysis/route.ts` working during transition. It can read from `CourseAnalysis` instead of `NeedsAnalysis` once migration runs. Remove it after cleanup.

---

## Phase 4: Components

### File Changes Summary

| Action | File | Notes |
|--------|------|-------|
| **CREATE** | `components/needs-analysis/AnalysisTab.tsx` | New tab: stakeholder responses + ID synthesis + reality check + training decision |
| **CREATE** | `components/needs-analysis/TrainingDecision.tsx` | Three-way toggle + conditional fields |
| **CREATE** | `components/needs-analysis/StakeholderResponseCards.tsx` | Collapsible cards showing approved submission data |
| **CREATE** | `components/needs-analysis/ObjectivesGuidance.tsx` | ABCD format + Bloom's table (extracted from prototype) |
| **MODIFY** | `components/needs-analysis/StakeholdersTab.tsx` | Add workspace contacts read-only card at top, keep editable section |
| **MODIFY** | `components/needs-analysis/SuccessMetricsTab.tsx` | Update prop type from `NeedsAnalysisFormData` to `CourseAnalysisFormData` |
| **MODIFY** | `components/needs-analysis/ObjectivesTab.tsx` | Add `ObjectivesGuidance` at top of tab |
| **MODIFY** | `components/pages/NeedsAnalysisView.tsx` | Rewrite: 4 tabs, new data fetching, new prop types |
| **MODIFY** | `components/pages/task-analysis/NeedsAnalysisPanel.tsx` | Rewrite: fetch from `/api/courses/[courseId]/analysis-context` |
| **MODIFY** | `app/workspace/[workspaceId]/course/[courseId]/page/[pageId]/page.tsx` | Update to fetch from course-analysis API |
| **DELETE** | `components/needs-analysis/PerformanceTab.tsx` | Merged into AnalysisTab |
| **DELETE** | `components/needs-analysis/ProblemTab.tsx` | Merged into AnalysisTab |

### 4A. AnalysisTab.tsx

New component. See prototype for full layout. Sections:

1. **Stakeholder Responses** — `StakeholderResponseCards` component, receives `submissions: StakeholderSubmissionDisplay[]`
2. **ID Synthesis** — Three textareas: problemSummary, currentStateSummary, desiredStateSummary
3. **Reality Check** — `constraints` and `assumptions` via existing `MultiInput`
4. **Training Decision** — `TrainingDecision` component

Props:
```typescript
interface AnalysisTabProps {
  data: CourseAnalysisFormData;
  onChange: (updates: Partial<CourseAnalysisFormData>) => void;
  submissions: StakeholderSubmissionDisplay[];
  workspaceId: string;
}
```

### 4B. StakeholderResponseCards.tsx

Collapsible cards per submission. Each shows stakeholder name, training type, date, status badge. Expands to show responses grouped by section. Read-only. Blue-tinted background.

If no approved submissions: dashed border empty state with link to workspace Needs Analysis page.

### 4C. TrainingDecision.tsx

Three-way selection: Yes / No / Partially. Conditional `nonTrainingFactors` textarea when No or Partially selected. Always-visible `solutionRationale` textarea.

### 4D. StakeholdersTab.tsx (Modified)

Add at top: read-only workspace contacts card. Fetched from the `AnalysisContext` data passed down as prop.

Below: existing editable sections (learnerPersonas, stakeholders, smes) with updated prop type.

### 4E. NeedsAnalysisView.tsx (Rewrite)

Tabs change from `['problem', 'stakeholders', 'performance', 'success-metrics', 'objectives']` to `['analysis', 'stakeholders', 'success-metrics', 'objectives']`.

Data fetching: On mount, fetch `/api/courses/[courseId]/analysis-context` which returns everything needed: course analysis data, submissions, workspace contacts. Single fetch.

Save: PUT to `/api/pages/[pageId]/course-analysis` with `CourseAnalysisFormData`.

Keep: Import from Notes modal (target synthesis fields instead of old fields).

### 4F. NeedsAnalysisPanel.tsx (Task Analysis Reference — Rewrite)

Change from fetching `/api/pages/[naPageId]/needs-analysis` to `/api/courses/[courseId]/analysis-context`.

Display merged view:
- Stakeholder problem/performance data (from submissions)
- ID's synthesis (problemSummary, currentStateSummary, desiredStateSummary)
- Constraints
- Kirkpatrick levels
- Training decision

Prioritize ID synthesis fields when populated; show stakeholder data as fallback/supplement.

### 4G. ObjectivesTab.tsx (Modified)

Add `ObjectivesGuidance` component at top (ABCD cards + Bloom's table). Keep everything else unchanged.

### 4H. Page Editor (Modified)

`app/workspace/[workspaceId]/course/[courseId]/page/[pageId]/page.tsx`:

Change the NEEDS_ANALYSIS branch:
- Fetch from `/api/pages/[pageId]/course-analysis` instead of `/needs-analysis`
- Pass `CourseAnalysisFormData` as `initialData`
- Save handler calls PUT to `/api/pages/[pageId]/course-analysis`

Also pass `workspaceId` to `NeedsAnalysisView` (already available from params).

---

## Phase 5: Curriculum Page

`app/workspace/[workspaceId]/curriculum/[curriculumId]/page/[pageId]/page.tsx` also imports `NeedsAnalysisView`. Same changes apply — update the data fetch and save endpoints.

---

## Implementation Order

1. **Schema + Migration** (Phase 1A-1D) — Add CourseAnalysis, migrate data
2. **Types** (Phase 2) — Create courseAnalysis.ts
3. **API: course-analysis CRUD** (Phase 3A) — GET/PUT for CourseAnalysis
4. **API: analysis-context** (Phase 3B) — Merged endpoint
5. **Components: new** (Phase 4A-4C) — AnalysisTab, StakeholderResponseCards, TrainingDecision, ObjectivesGuidance
6. **Components: modify** (Phase 4D-4H) — StakeholdersTab, SuccessMetricsTab, ObjectivesTab, NeedsAnalysisView, page editor
7. **Reference panel** (Phase 4F) — NeedsAnalysisPanel rewrite
8. **Test end-to-end** — Verify all tabs, save, reference panel
9. **Cleanup** (Phase 1E) — Drop old NeedsAnalysis model, remove old API route, delete ProblemTab.tsx and PerformanceTab.tsx

---

## What Stays Unchanged

- Stakeholder form system (tokens, submissions, responses) — untouched
- Workspace-level Needs Analysis page (`/workspace/[workspaceId]/needs-analysis/page.tsx`) — untouched
- StakeholderContactsCard, SubmissionDetailPanel, etc. — untouched
- SubTabBar, GuidancePanel, MultiInput — reused as-is
- ObjectivesTab core logic — unchanged (just adds guidance panel)
- SuccessMetricsTab core logic — unchanged (just prop type update)
- AI endpoints (analyzeNeeds, generateObjectivesFromAnalysis) — update field mappings later
