# Needs Analysis Reconciliation v2 — Implementation Spec

## Summary

Redesign the course-level Analysis tab from a data dump into a structured planning workspace. The ID uses this page to synthesize stakeholder input into specific, actionable decisions that drive Learning Objectives downstream.

Two new related models (`AudienceProfile`, `AnalysisTask`) replace flat string fields. The Analysis tab becomes a multi-entry planning tool with audience profiles and a task/competency matrix. The Stakeholders tab is slimmed to workspace contacts + SME list.

Supersedes the v1 spec. Addresses ENH-027 and ENH-028.

---

## Schema Changes

### New Models

```prisma
model AudienceProfile {
  id              String   @id @default(cuid())
  courseAnalysisId String
  courseAnalysis   CourseAnalysis @relation(fields: [courseAnalysisId], references: [id], onDelete: Cascade)

  role            String
  headcount       String   @default("")
  frequency       String   @default("Daily")
  techComfort     String   @default("Moderate")
  trainingFormat  String   @default("")
  notes           String   @default("") @db.Text
  order           Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("audience_profiles")
}

model AnalysisTask {
  id              String   @id @default(cuid())
  courseAnalysisId String
  courseAnalysis   CourseAnalysis @relation(fields: [courseAnalysisId], references: [id], onDelete: Cascade)

  task            String   @db.Text
  audience        String   @default("")
  source          String   @default("ID-added")
  complexity      String   @default("Medium")
  intervention    String   @default("training")
  priority        String   @default("Medium")
  notes           String   @default("") @db.Text
  order           Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("analysis_tasks")
}
```

### Modified: CourseAnalysis

**Add fields:**
- `deliveryNotes String @default("") @db.Text`
- `existingMaterials String @default("") @db.Text`
- `smes String[] @default([])` — editable SME list (moved from Stakeholders tab context)
- `audiences AudienceProfile[]` — relation
- `tasks AnalysisTask[]` — relation

**Drop fields (migration script copies data first):**
- `problemSummary` — no longer needed; performance need is captured in task-level notes
- `currentStateSummary` — same
- `desiredStateSummary` — same
- `learnerPersonas` — replaced by AudienceProfile entries
- `stakeholders` — replaced by AudienceProfile entries (role-based)

**Keep unchanged:**
- `isTrainingSolution`, `solutionRationale`, `nonTrainingFactors`
- `constraints`, `assumptions`
- `level1Reaction`, `level2Learning`, `level3Behavior`, `level4Results`
- `aiAnalysis`, `aiRecommendations` (cleanup later)

### Modified: Page model

No changes — `courseAnalysis CourseAnalysis?` relation already exists from v1.

---

## Migration Strategy

### Step 1: Add new fields and models

Add `AudienceProfile`, `AnalysisTask` models. Add `deliveryNotes`, `existingMaterials`, `smes` to `CourseAnalysis`. Do NOT drop old fields yet.

```bash
npx prisma migrate dev --name add_audience_tasks_models
```

### Step 2: Data migration script

For each existing `CourseAnalysis` record:
- Convert `learnerPersonas` entries → `AudienceProfile` rows (role = persona text, other fields default)
- If `problemSummary`, `currentStateSummary`, `desiredStateSummary` have content, create a single `AnalysisTask` with that context in notes (preserves ID work)
- Copy `stakeholders` array into `smes` field (best-effort mapping)

### Step 3: Drop old fields (deferred — after feature is stable)

Remove `problemSummary`, `currentStateSummary`, `desiredStateSummary`, `learnerPersonas`, `stakeholders` from CourseAnalysis.

---

## Tab Structure (4 tabs)

| Tab | Content |
|---|---|
| **Analysis** | Project overview (collapsible) → Audience profiles (multi-entry) → Tasks & competencies (multi-entry) → Training decision & constraints → Success criteria |
| **Stakeholders** | Workspace contacts (read-only) + Editable SME list |
| **Success Metrics** | Kirkpatrick L1-L4 (unchanged — also accessible within Analysis tab section 5) |
| **Objectives** | ABCD guidance + objectives list (unchanged) |

**Note on Success Metrics duplication:** Success criteria appear in both the Analysis tab (section 5) and the dedicated Success Metrics tab. Two options:

- **Option A:** Remove the standalone Success Metrics tab, keep it only on Analysis tab. Reduces to 3 tabs.
- **Option B:** Keep both — Analysis tab shows a compact version, Success Metrics tab is the detailed view. Same data source.

Recommend Option A (3 tabs: Analysis, Stakeholders, Objectives) unless there's a reason to keep the separate tab. Flag for review.

---

## API Changes

### Modified: `PUT /api/pages/[pageId]/course-analysis`

Body now includes nested `audiences` and `tasks` arrays. The endpoint handles:

1. Upsert `CourseAnalysis` flat fields
2. Sync `audiences`: delete removed, update existing (by id), create new
3. Sync `tasks`: delete removed, update existing (by id), create new

Use a transaction for atomicity.

```typescript
// Pseudocode for sync strategy
await prisma.$transaction(async (tx) => {
  // Upsert CourseAnalysis flat fields
  const ca = await tx.courseAnalysis.upsert({ ... });

  // Sync audiences
  const incomingIds = body.audiences.filter(a => a.id).map(a => a.id);
  await tx.audienceProfile.deleteMany({
    where: { courseAnalysisId: ca.id, id: { notIn: incomingIds } }
  });
  for (const audience of body.audiences) {
    if (audience.id) {
      await tx.audienceProfile.update({ where: { id: audience.id }, data: { ...audience } });
    } else {
      await tx.audienceProfile.create({ data: { ...audience, courseAnalysisId: ca.id } });
    }
  }

  // Same pattern for tasks
});
```

### Modified: `GET /api/pages/[pageId]/course-analysis`

Include related data:
```typescript
const ca = await prisma.courseAnalysis.findUnique({
  where: { pageId },
  include: {
    audiences: { orderBy: { order: 'asc' } },
    tasks: { orderBy: { order: 'asc' } },
  },
});
```

### Modified: `GET /api/courses/[courseId]/analysis-context`

Same as before — merges stakeholder submissions + course analysis. Now includes `audiences` and `tasks` in the response.

---

## Component Changes

### File Changes Summary

| Action | File | Notes |
|--------|------|-------|
| **CREATE** | `components/needs-analysis/AnalysisTab.tsx` | Full rewrite — 5 sections per prototype |
| **CREATE** | `components/needs-analysis/AudienceProfiles.tsx` | Multi-entry audience cards with inline edit |
| **CREATE** | `components/needs-analysis/TasksCompetencies.tsx` | Multi-entry task matrix with filters and intervention tagging |
| **CREATE** | `components/needs-analysis/TrainingDecision.tsx` | Three-way toggle + rationale + delivery + materials + constraints/assumptions |
| **CREATE** | `components/needs-analysis/SuccessCriteria.tsx` | Kirkpatrick L1-L4 with stakeholder reference |
| **CREATE** | `components/needs-analysis/ProjectOverviewHeader.tsx` | Collapsible project reference card |
| **CREATE** | `components/needs-analysis/StakeholderReference.tsx` | Blue-tinted read-only card showing relevant stakeholder data per section |
| **MODIFY** | `components/needs-analysis/StakeholdersTab.tsx` | Slim down: workspace contacts (read-only) + editable SME list only |
| **MODIFY** | `components/pages/NeedsAnalysisView.tsx` | Update data fetching, save handler, tab definitions |
| **MODIFY** | `components/pages/task-analysis/NeedsAnalysisPanel.tsx` | Update to read from new structure (audiences, tasks) |
| **MODIFY** | `lib/types/courseAnalysis.ts` | Add AudienceProfile, AnalysisTask types; update CourseAnalysisFormData |
| **DELETE** | `components/needs-analysis/StakeholderResponseCards.tsx` | Replaced by StakeholderReference (inline per section) |
| **DELETE** | `components/needs-analysis/PerformanceTab.tsx` | Superseded |
| **DELETE** | `components/needs-analysis/ProblemTab.tsx` | Superseded |

### AnalysisTab.tsx — Section Layout

**Section 1: Project Overview** (collapsible, default collapsed)
- Auto-populated from stakeholder submission data
- Project name, sponsor, department, training type, go-live, submitted by/date
- Read-only reference — no editable fields

**Section 2: Audience Profiles** (multi-entry)
- Blue reference card at top: summary of stakeholder audience data
- Each audience is a card: collapsed shows role, headcount, frequency, format badge, notes preview
- Click to expand inline edit: role, headcount, frequency, tech comfort, training format, notes
- Add/remove audiences
- Data saved as `AudienceProfile` records

**Section 3: Tasks & Competencies** (multi-entry — the core planning tool)
- Blue reference card at top: summary of stakeholder task data
- Filter bar: All / Training / Job Aid / Awareness (with counts)
- Summary bar: colored dots with counts per intervention type + "→ N tasks will generate Learning Objectives"
- Each task is a row: collapsed shows task, audience, priority badge, intervention badge
- Click to expand inline edit: task description, audience, intervention, complexity, priority, notes
- Source field tracks origin ("Stakeholder 3.1", "ID-added")
- Add/remove tasks
- Data saved as `AnalysisTask` records

**Section 4: Training Decision & Constraints**
- Training decision: three-way toggle (Yes / Partially / No) + rationale textarea
- Delivery recommendation: stakeholder preference reference + ID's recommendation textarea
- Existing materials: stakeholder reference + ID notes textarea
- Constraints: MultiInput list
- Assumptions: MultiInput list

**Section 5: Success Criteria**
- Stakeholder reference card showing what they said success looks like
- Kirkpatrick L1-L4 textareas with level badges

### StakeholdersTab.tsx — Simplified

**Section 1: Workspace Contacts** (read-only)
- Pulled from workspace `stakeholders` JSON field via analysis-context API
- Card display: name, role, contact info

**Section 2: Subject Matter Experts** (editable)
- Simple MultiInput for SME names/roles
- Stored as `smes` string array on CourseAnalysis
- GuidancePanel with SME identification guidance

### StakeholderReference.tsx — Reusable Component

Small blue-tinted card used within each Analysis tab section. Props:
```typescript
interface StakeholderReferenceProps {
  label?: string;      // Default: "From stakeholder submission"
  children: ReactNode; // Summary text
}
```

Renders the blue box with "From stakeholder submission" header + content. Used by each section to show relevant stakeholder data inline.

---

## Types Update

### lib/types/courseAnalysis.ts

```typescript
export interface AudienceProfileData {
  id?: string;         // Undefined for new entries
  role: string;
  headcount: string;
  frequency: string;
  techComfort: string;
  trainingFormat: string;
  notes: string;
  order: number;
}

export interface AnalysisTaskData {
  id?: string;
  task: string;
  audience: string;
  source: string;
  complexity: string;
  intervention: string;  // "training" | "job-aid" | "awareness" | "not-training"
  priority: string;      // "Critical" | "High" | "Medium" | "Low"
  notes: string;
  order: number;
}

export interface CourseAnalysisFormData {
  // Training decision
  isTrainingSolution: boolean | null;
  solutionRationale: string;
  nonTrainingFactors: string;

  // Delivery & materials
  deliveryNotes: string;
  existingMaterials: string;

  // Constraints & assumptions
  constraints: string[];
  assumptions: string[];

  // SMEs
  smes: string[];

  // Success Metrics (Kirkpatrick)
  level1Reaction: string;
  level2Learning: string;
  level3Behavior: string;
  level4Results: string;

  // Related data
  audiences: AudienceProfileData[];
  tasks: AnalysisTaskData[];
}
```

---

## Build Sequence

1. **Schema migration** — Add AudienceProfile, AnalysisTask models + new fields on CourseAnalysis
2. **Data migration script** — Convert existing flat data to new structure
3. **Types** — Update courseAnalysis.ts
4. **API** — Update GET/PUT for course-analysis to handle nested audiences/tasks
5. **Components: new** — AudienceProfiles, TasksCompetencies, TrainingDecision, SuccessCriteria, ProjectOverviewHeader, StakeholderReference
6. **Components: modify** — AnalysisTab (rewrite), StakeholdersTab (slim down), NeedsAnalysisView (update tabs/data flow)
7. **Reference panel** — Update NeedsAnalysisPanel to read audiences/tasks
8. **Test end-to-end**
9. **Cleanup** — Drop old fields from CourseAnalysis, delete dead components

---

## What Stays Unchanged

- Stakeholder form system (tokens, submissions, responses)
- Workspace-level Needs Analysis page
- ObjectivesTab + ObjectivesGuidance
- SubTabBar, GuidancePanel, MultiInput
- Old NeedsAnalysis model (already kept for backward compat from v1)
- Storyboard, Task Analysis page components (positional fix is separate work)

---

## Future: Task Analysis Repositioning (Separate Branch)

Current state: Task Analysis sits as a peer page to Needs Analysis inside a course.

Correct position: Task Analysis is downstream of Learning Objectives. It answers "how do we break down and teach each skill/task" — not "what's the problem."

The correct flow is:
```
Stakeholder Data → Needs Analysis → Learning Objectives → Task Analysis → Storyboard → Development
```

This is out of scope for this branch. Tracked for next feature.

---

## Prototype Reference

Interactive prototype: `analysis-tab-v2.jsx`
Pre-populated with real mySFS stakeholder data. All 5 sections functional.
