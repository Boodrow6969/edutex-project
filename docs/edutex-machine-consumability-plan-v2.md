# EDUTex Machine-Consumability Migration Plan v2

**Created:** February 12, 2026  
**Based on:** Actual `schema.prisma`, `blocks.ts`, and `sync.ts` files  
**Purpose:** Make every data structure machine-readable for future adaptive engine integration  
**Principle:** All new fields are optional. No existing UI, API routes, or data breaks.

---

## Actual Current State (Verified)

### What's Already Solid

| Area | Status | Notes |
|------|--------|-------|
| `BloomLevel` enum | ✅ Proper Prisma enum | REMEMBER through CREATE — not a string |
| `TaskStatus`, `Priority` | ✅ Proper enums | TODO/IN_PROGRESS/REVIEW/DONE, LOW/MEDIUM/HIGH/URGENT |
| `PageType` enum | ✅ 12 values | Course-level + Program-level pages |
| `BlockType` enum | ✅ 20 values | Basic, ID, Storyboard, Media blocks |
| `TrainingType` enum | ✅ 4 values | PERFORMANCE_PROBLEM, NEW_SYSTEM, COMPLIANCE, ROLE_CHANGE |
| `SubmissionStatus` enum | ✅ 5 values | DRAFT through REVISION_REQUESTED |
| `DeliverableType`, `DeliverableStatus` | ✅ Proper enums | 10 types, 5 statuses |
| `WorkspaceRole` enum | ✅ 5 roles | ADMINISTRATOR through SME |
| `blocks.ts` content types | ✅ Typed interfaces | 14 content interfaces + union type + default factories |
| TipTap ↔ DB sync layer | ✅ Bidirectional | `blocksToTipTap()` + `tipTapToBlocks()` with diff-based updates |
| ContentScreen dynamic fields | ✅ Per-screenType | Video scenes, assessment fields, scenario branching all in sync.ts |
| Storyboard model | ✅ Separate metadata | Page-level metadata (audience, status, version) in its own model |
| LearningBlueprint system | ✅ Full chain | Blueprint → PerformanceNeed → BlueprintObjective → ActivityInstance → ActivityPattern |
| Stakeholder analysis | ✅ Complete | Token → Submission → Response → ChangeLog with TypeScript question constants |

### What Needs Work

| Area | Issue | Impact |
|------|-------|--------|
| `Course.status` | `String` not enum | Machine can't enumerate valid states |
| `Course.phase` | `String` not enum | Same — "intake", "analysis" etc. are implicit |
| `Course.priority` | `String` not enum | Duplicates `Priority` enum concept but uses String |
| `Course.courseType` | `String` not enum | Training types aren't machine-enumerable |
| `Storyboard.status` | `String` not enum | "draft \| review \| approved" in comment only |
| `Curriculum.status` | `String` not enum | "draft, in_progress, published" in comment only |
| `BlueprintObjective.bloomLevel` | `String` not `BloomLevel` enum | Should reuse existing enum |
| `BlueprintObjective.priority` | `String` not enum | Implicit values |
| `Constraint.type` | `String` not enum | Implicit values |
| `TaskAnalysis.tasks` | `Json` blob | Tasks stored as untyped JSON array — no individual records |
| `Objective` model | No relationships | No link to tasks, assessments, or external IDs |
| No `LearningTask` model | Missing entirely | Project mgmt `Task` exists, instructional `LearningTask` does not |
| No `AssessmentItem` model | Missing entirely | No first-class assessment questions |
| No external ID fields | On any model | Can't map to O*NET, ESCO, LMS catalogs, etc. |
| No rationale/design decision fields | On most models | "Why" not captured for governance |
| `blocks.ts` missing `type` discriminator | Content interfaces lack it | `ParagraphContent` has `{ text }` but no `type: 'paragraph'` |
| `ContentScreenContent` in blocks.ts | Flat interface | Doesn't reflect the per-screenType fields that sync.ts actually handles |

---

## Workstream 1: String-to-Enum Conversions

**Branch:** `feature/schema-enums`  
**Effort:** 1 session  
**Risk:** Low — additive enums + column type change with default values  
**Dependencies:** None

### New Enums to Create

```prisma
enum CourseStatus {
  DRAFT
  ACTIVE
  IN_REVIEW
  APPROVED
  ARCHIVED
}

enum CoursePhase {
  INTAKE
  ANALYSIS
  DESIGN
  DEVELOPMENT
  IMPLEMENTATION
  EVALUATION
}

enum CourseType {
  PERFORMANCE_PROBLEM
  NEW_SYSTEM
  COMPLIANCE
  ROLE_CHANGE
  ONBOARDING
  PROFESSIONAL_DEVELOPMENT
  OTHER
}

enum StoryboardStatus {
  DRAFT
  REVIEW
  APPROVED
}

enum CurriculumStatus {
  DRAFT
  IN_PROGRESS
  PUBLISHED
  ARCHIVED
}

enum ConstraintType {
  TIME
  BUDGET
  TECHNOLOGY
  AUDIENCE
  REGULATORY
  ORGANIZATIONAL
  OTHER
}

enum BlueprintPriority {
  MUST_HAVE
  SHOULD_HAVE
  NICE_TO_HAVE
}
```

### Models to Modify

**Course** (lines 117-141):
```prisma
model Course {
  // CHANGE these three fields:
  status      CourseStatus  @default(DRAFT)      // was: String @default("draft")
  courseType   CourseType?                         // was: String?
  phase       CoursePhase   @default(INTAKE)      // was: String @default("intake")
  priority    Priority      @default(MEDIUM)      // was: String @default("medium") — reuse existing enum!
  // Everything else stays the same
}
```

**Storyboard** (lines 259-279):
```prisma
model Storyboard {
  // CHANGE:
  status  StoryboardStatus @default(DRAFT)       // was: String @default("draft")
  // Everything else stays the same
}
```

**Curriculum** (lines 143-169):
```prisma
model Curriculum {
  // CHANGE:
  status  CurriculumStatus @default(DRAFT)       // was: String @default("draft")
  // Everything else stays the same
}
```

**BlueprintObjective** (lines 481-496):
```prisma
model BlueprintObjective {
  // CHANGE:
  bloomLevel  BloomLevel                          // was: String — reuse existing enum!
  priority    BlueprintPriority                   // was: String
  // Everything else stays the same
}
```

**Constraint** (lines 498-510):
```prisma
model Constraint {
  // CHANGE:
  type  ConstraintType                            // was: String
  // Everything else stays the same
}
```

### Migration Strategy

This requires careful handling because you're changing column types on tables that may have existing data.

```sql
-- The migration SQL will need to:
-- 1. Create the new enum types
-- 2. ALTER COLUMN with USING to cast existing string values to enum values
-- Example for Course.status:
-- ALTER TABLE "courses" ALTER COLUMN "status" TYPE "CourseStatus" USING "status"::"CourseStatus";
```

**Before running the migration:**
1. Check what values actually exist in the database:
```powershell
# Run in your project root with Docker running
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT status FROM courses;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT phase FROM courses;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT priority FROM courses;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT status FROM storyboards;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT status FROM curricula;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT \"bloomLevel\" FROM blueprint_objectives;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT priority FROM blueprint_objectives;"
docker exec edutex-db psql -U postgres -d edutex -c "SELECT DISTINCT type FROM constraints;"
```

2. Make sure every existing value has a matching enum variant. If you find a value like "active" in Course.status that doesn't match `ACTIVE`, you'll need to either rename the data or adjust the enum.

3. If tables are empty (likely for many of these in dev), the migration is trivial.

**Migration command:**
```powershell
npx prisma migrate dev --name convert_strings_to_enums
```

### Files That Need Code Updates After Migration

Any file that sets these fields with string literals will need to use the enum instead:

```powershell
# Find files referencing these string values
Select-String -Path "app\api\**\*.ts" -Pattern '"draft"|''draft''|"intake"|"medium"' -Recurse | Select-Object Path -Unique
Select-String -Path "components\**\*.tsx" -Pattern '"draft"|''draft''|"intake"|"medium"' -Recurse | Select-Object Path -Unique
```

Replace string literals with Prisma enum imports:
```typescript
// BEFORE:
await prisma.course.create({ data: { status: "draft", phase: "intake" } });

// AFTER:
import { CourseStatus, CoursePhase } from '@prisma/client';
await prisma.course.create({ data: { status: CourseStatus.DRAFT, phase: CoursePhase.INTAKE } });
```

---

## Workstream 2: LearningTask Model

**Branch:** `feature/learning-task-model`  
**Effort:** 1 session  
**Risk:** None — purely additive  
**Dependencies:** None (can run parallel with Workstream 1)

### Why a New Model

The existing `Task` model (lines 348-368) is project management:
- `status: TaskStatus` (TODO, IN_PROGRESS, REVIEW, DONE)
- `priority: Priority`
- `assignedToId`, `dueDate`, `deliverableId`

This is "Todd has a task due Friday." The instructional design concept — "Sales reps must handle customer objections (critical, daily, complex)" — is a fundamentally different entity.

The `TaskAnalysis` model (lines 241-257) stores tasks as `tasks Json @default("[]")` — an untyped JSON blob. This is the data that needs to become first-class records.

### New Enums

```prisma
enum TaskFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
  RARELY
}

enum TaskCriticality {
  CRITICAL
  IMPORTANT
  SUPPORTIVE
}

enum TaskComplexity {
  SIMPLE
  MODERATE
  COMPLEX
}

enum KnowledgeType {
  DECLARATIVE
  PROCEDURAL
  CONDITIONAL
  METACOGNITIVE
}
```

### New Model

```prisma
model LearningTask {
  id              String            @id @default(cuid())
  courseId         String
  
  // Core identification
  title           String
  description     String?           @db.Text
  
  // Task analysis attributes (all enum-typed)
  frequency       TaskFrequency     @default(WEEKLY)
  criticality     TaskCriticality   @default(IMPORTANT)
  complexity      TaskComplexity    @default(MODERATE)
  knowledgeType   KnowledgeType     @default(PROCEDURAL)
  
  // Standardization
  isStandardized  Boolean           @default(true)
  variationNotes  String?           @db.Text
  isFeasibleToTrain Boolean         @default(true)
  feasibilityNotes  String?         @db.Text
  
  // External taxonomy mapping
  externalId      String?
  externalSource  String?
  
  // Hierarchical task analysis
  parentTaskId    String?
  order           Int               @default(0)
  
  // Design decision capture
  rationale       String?           @db.Text
  aiGenerated     Boolean           @default(false)
  aiReasoning     String?           @db.Text
  
  // Link to TaskAnalysis page (optional — for migration from JSON blob)
  taskAnalysisId  String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  course          Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  parentTask      LearningTask?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  childTasks      LearningTask[]    @relation("TaskHierarchy")
  taskAnalysis    TaskAnalysis?     @relation(fields: [taskAnalysisId], references: [id])
  objectives      ObjectiveTaskLink[]
  
  @@index([courseId])
  @@index([externalId])
  @@index([taskAnalysisId])
  @@map("learning_tasks")
}
```

### Models to Modify

**Course** — add reverse relation:
```prisma
model Course {
  // ADD:
  learningTasks  LearningTask[]
  // ... existing fields unchanged
}
```

**TaskAnalysis** — add reverse relation (for migration path):
```prisma
model TaskAnalysis {
  // ADD:
  learningTasks  LearningTask[]
  // ... existing fields unchanged — JSON blob stays until migration
}
```

### Migration Path for Existing TaskAnalysis JSON

The `TaskAnalysis.tasks` JSON blob can stay for now. The plan:
1. Add `LearningTask` model (this workstream)
2. Later, build a one-time migration script that reads `TaskAnalysis.tasks` JSON and creates `LearningTask` records
3. Eventually, the TaskAnalysisView.tsx reads from `LearningTask` records instead of the JSON blob
4. The JSON blob becomes deprecated but doesn't need to be removed immediately

---

## Workstream 3: Objective ↔ Assessment ↔ Task Linkage

**Branch:** `feature/objective-links`  
**Effort:** 1 session  
**Risk:** Low — additive models and optional fields on existing Objective  
**Dependencies:** Workstream 2 merged (LearningTask must exist for ObjectiveTaskLink)

### Objective Model Changes (lines 384-397)

```prisma
model Objective {
  id          String     @id @default(cuid())
  title       String
  description String     @db.Text
  bloomLevel  BloomLevel
  courseId     String
  tags        String[]
  
  // NEW: Mager's ABCD components
  condition     String?    @db.Text    // "Given a customer complaint..."
  criteria      String?    @db.Text    // "...with 90% accuracy"
  
  // NEW: External taxonomy mapping
  externalId     String?
  externalSource String?
  
  // NEW: Design decision capture
  rationale     String?    @db.Text
  aiGenerated   Boolean    @default(false)
  aiReasoning   String?    @db.Text
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  course      Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // NEW: Explicit relationships
  taskLinks       ObjectiveTaskLink[]
  assessmentLinks ObjectiveAssessmentLink[]

  @@index([externalId])
  @@map("objectives")
}
```

### New: AssessmentItem Model

```prisma
enum AssessmentType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  SHORT_ANSWER
  MATCHING
  ORDERING
  SCENARIO_BASED
  PERFORMANCE_CHECKLIST
  ESSAY
}

model AssessmentItem {
  id            String          @id @default(cuid())
  courseId       String
  type          AssessmentType
  
  // Content
  stem          String          @db.Text
  options       Json?
  correctAnswer Json?
  feedback      Json?
  
  // Classification
  bloomLevel    BloomLevel
  difficulty    Int             @default(2)    // 1-5 scale
  
  // External mapping
  externalId    String?
  
  // Design decisions
  rationale     String?         @db.Text
  aiGenerated   Boolean         @default(false)
  aiReasoning   String?         @db.Text
  
  order         Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  course        Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  objectives    ObjectiveAssessmentLink[]
  
  @@index([courseId])
  @@index([courseId, bloomLevel])
  @@map("assessment_items")
}
```

### New: Join Tables

```prisma
model ObjectiveTaskLink {
  id             String       @id @default(cuid())
  objectiveId    String
  learningTaskId String
  relationship   String?      // "enables", "prerequisite", "supports"
  
  objective      Objective    @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  learningTask   LearningTask @relation(fields: [learningTaskId], references: [id], onDelete: Cascade)
  
  @@unique([objectiveId, learningTaskId])
  @@map("objective_task_links")
}

model ObjectiveAssessmentLink {
  id                 String         @id @default(cuid())
  objectiveId        String
  assessmentItemId   String
  bloomLevelAssessed BloomLevel
  isAligned          Boolean        @default(true)
  alignmentNotes     String?
  
  objective          Objective          @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  assessmentItem     AssessmentItem     @relation(fields: [assessmentItemId], references: [id], onDelete: Cascade)
  
  @@unique([objectiveId, assessmentItemId])
  @@map("objective_assessment_links")
}
```

### Course Model — Add Reverse Relations

```prisma
model Course {
  // ADD:
  assessmentItems AssessmentItem[]
  // ... existing relations unchanged
}
```

### External ID Fields on Course and Curriculum

```prisma
model Course {
  // ADD:
  externalId      String?
  externalSource  String?
  
  @@index([externalId])
}

model Curriculum {
  // ADD:
  externalId      String?
  externalSource  String?
  
  @@index([externalId])
}
```

---

## Workstream 4: Block Content Contracts

**Branch:** `feature/block-content-contracts`  
**Effort:** 1 session  
**Risk:** None — code-only, no migration  
**Dependencies:** None (can run in parallel with everything)

### Problem (Specific)

Your `blocks.ts` has typed interfaces, which is great. But there are two gaps:

1. **No `type` discriminator field.** `ParagraphContent` is `{ text: string }` — there's no field that says "I am a paragraph." Without a discriminator, you can't write a type guard or runtime validator.

2. **`ContentScreenContent` is a flat interface** that doesn't reflect reality. The actual sync.ts handles 6 different screenTypes with different field sets (video has `scenes[]`, assessment has `assessmentFormat`/`linkedObjectiveIds`/`passingCriteria`, scenario has `scenarioOptions[]`). The interface in blocks.ts doesn't capture this.

### Changes to `lib/types/blocks.ts`

**Step 1: Add discriminator to every content interface**

```typescript
// BEFORE:
export interface ParagraphContent {
  text: string;
}

// AFTER:
export interface ParagraphContent {
  _type: 'paragraph';      // Discriminator — underscore prefix to avoid collision with TipTap
  text: string;
}
```

Use `_type` (with underscore) as the discriminator to avoid colliding with any existing `type` fields in TipTap or your content JSON. This is a convention — the underscore signals "this is a structural marker, not user data."

Apply to all 14 content interfaces:

| Interface | `_type` value |
|-----------|---------------|
| `ParagraphContent` | `'paragraph'` |
| `HeadingContent` | `'heading'` |
| `ListContent` | `'list'` |
| `CalloutContent` | `'callout'` |
| `StoryboardMetadataContent` | `'storyboardMetadata'` |
| `ContentScreenContent` | `'contentScreen'` |
| `LearningObjectivesImportContent` | `'learningObjectivesImport'` |
| `ChecklistContent` | `'checklist'` |
| `TableContent` | `'table'` |
| `FacilitatorNotesContent` | `'facilitatorNotes'` |
| `MaterialsListContent` | `'materialsList'` |
| `ImageContent` | `'image'` |
| `VideoContent` | `'video'` |
| `StoryboardFrameContent` | `'storyboardFrame'` |

**Step 2: Split ContentScreenContent into discriminated sub-types**

Replace the flat `ContentScreenContent` interface with a base + per-screenType variants that match what `sync.ts` actually handles:

```typescript
// Shared fields across all screen types
interface ContentScreenBase {
  _type: 'contentScreen';
  screenId: string;
  screenTitle: string;
  screenType: 'content' | 'video' | 'practice' | 'assessment' | 'scenario' | 'title_intro';
  duration: string;
  designerNotes: string;
  developerNotes: string;
  // Asset references
  visualsAssetId?: string | null;
  backgroundAssetId?: string | null;
}

export interface ContentScreen_Content extends ContentScreenBase {
  screenType: 'content';
  visuals: string;
  onScreenText: string;
  voiceoverScript: string;
  interactionType: 'none' | 'click_reveal' | 'drag_drop' | 'multiple_choice' 
    | 'branching' | 'discussion' | 'exercise' | 'video_playback' | 'other';
  interactionDetails: string;
}

export interface ContentScreen_Video extends ContentScreenBase {
  screenType: 'video';
  videoSource: string;
  scenes: Array<{
    timecode: string;
    visualDescription: string;
    voiceover: string;
    onScreenText: string;
    assetId?: string | null;
  }>;
}

export interface ContentScreen_Practice extends ContentScreenBase {
  screenType: 'practice';
  activityType: string;
  activityDescription: string;
  instructions: string;
  hints: string;
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface ContentScreen_Assessment extends ContentScreenBase {
  screenType: 'assessment';
  assessmentPurpose: string;
  assessmentFormat: string;
  assessmentFormatOther: string;
  linkedObjectiveIds: string[];
  cognitiveDemand: string;
  assessmentRationale: string[];
  assessmentRationaleOther: string;
  estimatedDuration: string;
  attemptsAllowed: string;
  gradedWeighted: string;
  dynamicScopeValue: string;
  feedbackStrategy: string;
  passingCriteria: string;
}

export interface ContentScreen_Scenario extends ContentScreenBase {
  screenType: 'scenario';
  scenarioSetup: string;
  decisionPrompt: string;
  scenarioOptions: Array<{
    label: string;
    consequence: string;
    isCorrect: boolean;
  }>;
  debrief: string;
}

export interface ContentScreen_TitleIntro extends ContentScreenBase {
  screenType: 'title_intro';
  titleCardText: string;
  briefVoiceover: string;
  backgroundNotes: string;
}

// Union of all screen types
export type ContentScreenContent = 
  | ContentScreen_Content
  | ContentScreen_Video
  | ContentScreen_Practice
  | ContentScreen_Assessment
  | ContentScreen_Scenario
  | ContentScreen_TitleIntro;
```

**Step 3: Add type guards**

```typescript
export function isContentScreen(content: BlockContent): content is ContentScreenContent {
  return '_type' in content && (content as any)._type === 'contentScreen';
}

export function isVideoScreen(content: BlockContent): content is ContentScreen_Video {
  return isContentScreen(content) && content.screenType === 'video';
}

export function isAssessmentScreen(content: BlockContent): content is ContentScreen_Assessment {
  return isContentScreen(content) && content.screenType === 'assessment';
}
```

**Step 4: Update default factory**

```typescript
export function createDefaultContentScreenContent(screenNumber: number): ContentScreen_Content {
  return {
    _type: 'contentScreen',
    screenId: `SCR-${String(screenNumber).padStart(3, '0')}`,
    screenTitle: '',
    screenType: 'content',
    visuals: '',
    onScreenText: '',
    voiceoverScript: '',
    interactionType: 'none',
    interactionDetails: '',
    designerNotes: '',
    developerNotes: '',
    duration: '',
  };
}
```

**Step 5: Add validation logging to sync.ts**

At the boundary between TipTap and database, add a lightweight validator:

```typescript
// Add to sync.ts — nodeToBlock function, after the content object is built:
function nodeToBlock(node: JSONContent): { type: BlockType; content: Record<string, unknown> } {
  // ... existing switch cases ...
  
  // After building content, inject the discriminator:
  const result = { type, content };
  
  // Inject _type discriminator for new blocks
  if (!content._type) {
    const typeMap: Record<string, string> = {
      PARAGRAPH: 'paragraph',
      HEADING_1: 'heading', HEADING_2: 'heading', HEADING_3: 'heading',
      BULLETED_LIST: 'list', NUMBERED_LIST: 'list',
      CALLOUT: 'callout',
      CONTENT_SCREEN: 'contentScreen',
      LEARNING_OBJECTIVES_IMPORT: 'learningObjectivesImport',
      // ... etc
    };
    content._type = typeMap[type] || type.toLowerCase();
  }
  
  return result;
}
```

This is a **gradual migration** — new blocks get the discriminator automatically. Old blocks in the database won't have it until they're next saved, which is fine.

### Documentation

**Create `docs/BLOCK_CONTENT_SPEC.md`** — a human-readable reference of every block type's content shape. This is the document you'd hand to an adaptive engine vendor or API consumer. Keep it synced with `blocks.ts`.

---

## Workstream 5: Design Rationale Fields

**Branch:** `feature/design-rationale`  
**Effort:** 0.5 session  
**Risk:** None — optional fields only  
**Dependencies:** None

### NeedsAnalysis Model (lines 208-239)

```prisma
model NeedsAnalysis {
  // ... existing fields unchanged ...
  
  // NEW: Training-as-solution decision
  isTrainingSolution    Boolean?
  nonTrainingFactors    String?    @db.Text
  solutionRationale     String?    @db.Text
  
  // NEW: AI analysis capture
  aiAnalysis            String?    @db.Text    // Full AI analysis output
  aiRecommendations     String[]   @default([])
}
```

### Storyboard Model (lines 259-279)

```prisma
model Storyboard {
  // ... existing fields unchanged ...
  
  // NEW: Design rationale
  designApproach        String?    @db.Text    // Why this delivery method, structure, etc.
  mediaSelectionNotes   String?    @db.Text    // Why chosen media types
}
```

---

## Implementation Order

```
Workstream 4 (Block Contracts)  ─── No migration, code-only, start anytime
     │
Workstream 1 (String→Enum)     ─── Schema migration, independent
     │
Workstream 5 (Rationale fields) ── Schema migration, independent
     │
Workstream 2 (LearningTask)    ─── Schema migration, independent
     │
     └──→ Workstream 3 (Objective Links) ── Depends on WS2 for ObjectiveTaskLink
```

**Recommended sequence:**
1. **Workstream 4** first — zero risk, no migration, immediate code quality improvement
2. **Workstream 1** — gets the string-to-enum cleanup done early
3. **Workstream 2** — adds LearningTask foundation
4. **Workstream 5** — small, quick rationale fields
5. **Workstream 3** — the big payoff, builds on everything above

---

## What Changes in Each Session

| Session | Branch | Migrations | Files Changed | Risk |
|---------|--------|-----------|---------------|------|
| 1 | `feature/block-content-contracts` | 0 | `blocks.ts`, `sync.ts`, new `BLOCK_CONTENT_SPEC.md` | None |
| 2 | `feature/schema-enums` | 1 | `schema.prisma`, API routes using string literals | Low — check existing data first |
| 3 | `feature/learning-task-model` | 1 | `schema.prisma` only | None — additive |
| 4 | `feature/design-rationale` | 1 | `schema.prisma` only | None — additive |
| 5 | `feature/objective-links` | 1 | `schema.prisma`, `Objective` model gets new fields + relations | Low — all new fields optional |

---

## Pre-Flight Checklist

Before starting any workstream:

- [ ] `git status` — clean working tree
- [ ] Docker Desktop running, database accessible
- [ ] `npx prisma migrate status` — no pending migrations  
- [ ] Back up if you want: `docker exec edutex-db pg_dump -U postgres -d edutex > backup_$(Get-Date -Format 'yyyyMMdd').sql`

Before Workstream 1 specifically:
- [ ] Run the data inspection queries (listed in WS1 section) to check existing string values

---

## What NOT to Do Yet

- Don't build UI for any of these new models yet
- Don't migrate TaskAnalysis JSON to LearningTask records yet (that's a future feature task)
- Don't build the Quiz Builder yet (AssessmentItem is the foundation for it, but the UI is separate)
- Don't add the DesignDecisionLog audit trail model yet (post-MVP)
- Don't change how existing API routes work — all new fields are optional
