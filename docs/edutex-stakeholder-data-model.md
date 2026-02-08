# EDUTex Stakeholder Needs Analysis — Data Model

> **Migration Note (2026-02-08):** The `Project` model was renamed to `Course` and all `projectId` FKs were renamed to `courseId`. The stakeholder models now use `workspaceId` (migrated from `projectId`). Prisma schema references to `Project` below reflect the original spec; the live schema uses `Course` and `workspaceId`.

## Overview

This document defines the data model for the stakeholder needs analysis feature. It covers:

1. **TypeScript types** for question definitions (Option B — constants in code, not database)
2. **Prisma schema additions** for the four database models (Access Token, Submission, Response, Change Log)
3. **Enum definitions** shared between TypeScript and Prisma
4. **Integration points** with existing schema (Course, User, Workspace)
5. **Claude Code prompt** for implementation

---

## Part 1: Shared Enums

These enums are used by both the TypeScript question constants and the Prisma models. Define them once in a shared location.

### File: `lib/types/needsAnalysis.ts`

```typescript
// ============================================
// TRAINING TYPE
// ============================================
// Set by the ID when creating the stakeholder link.
// Determines which questions appear on the form.

export enum TrainingType {
  PERFORMANCE_PROBLEM = "PERFORMANCE_PROBLEM",
  NEW_SYSTEM = "NEW_SYSTEM",
  COMPLIANCE = "COMPLIANCE",
  ROLE_CHANGE = "ROLE_CHANGE",
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  [TrainingType.PERFORMANCE_PROBLEM]: "Performance Problem",
  [TrainingType.NEW_SYSTEM]: "New System / Software Deployment",
  [TrainingType.COMPLIANCE]: "Compliance / Policy Change",
  [TrainingType.ROLE_CHANGE]: "Role Change / Expansion",
};

// ============================================
// SUBMISSION STATUS
// ============================================
// Tracks the lifecycle of a stakeholder's form submission.

export enum SubmissionStatus {
  DRAFT = "DRAFT",                       // Stakeholder started but hasn't submitted
  SUBMITTED = "SUBMITTED",               // Stakeholder clicked submit
  UNDER_REVIEW = "UNDER_REVIEW",         // ID is reviewing
  APPROVED = "APPROVED",                 // ID approved — data flows to project
  REVISION_REQUESTED = "REVISION_REQUESTED", // ID sent back with notes
}

// ============================================
// FIELD TYPE
// ============================================
// Determines what UI component renders for each question.

export enum FieldType {
  SHORT_TEXT = "SHORT_TEXT",       // Single-line input
  LONG_TEXT = "LONG_TEXT",         // Multi-line textarea
  SINGLE_SELECT = "SINGLE_SELECT", // Radio buttons or dropdown
  MULTI_SELECT = "MULTI_SELECT",   // Checkboxes
  DATE = "DATE",                   // Date picker
  NUMBER = "NUMBER",               // Numeric input
  SCALE = "SCALE",                 // 1-5 or 1-10 scale (future use)
}
```

---

## Part 2: Question Definition Types

Question definitions live in TypeScript as constants. No database table. The question `id` strings (SHARED_01, PERF_04, etc.) are used as reference keys in the Response table.

### File: `lib/types/questionDefinition.ts`

```typescript
import { TrainingType, FieldType } from "./needsAnalysis";

// ============================================
// CONDITIONAL LOGIC
// ============================================
// Some questions only appear when a previous answer
// meets a specific condition. For example, SHARED_04
// only shows when SHARED_03 equals "Other".

export interface ConditionalRule {
  questionId: string;                   // Which question to check (e.g., "SHARED_03")
  operator: "equals" | "not_equals" | "includes"; // How to compare
  value: string;                        // The value to compare against
}

// ============================================
// QUESTION DEFINITION
// ============================================
// The full shape of a question in the system.
// These are authored in code, never edited by users.

export interface QuestionDefinition {
  id: string;                           // Unique identifier: "SHARED_01", "PERF_03", etc.
  section: string;                      // Display grouping: "Project Context", "Performance Problem", etc.
  questionText: string;                 // What both ID and stakeholder see
  idNotes: string;                      // Coaching text for the ID (in-app only)
  idNotesExtended?: string;             // Deeper reference content (popover/modal on click)
  stakeholderGuidance: string;          // Help text + examples for the stakeholder form
  fieldType: FieldType;                 // Determines the UI component
  required: boolean;                    // Whether the question must be answered
  options?: string[];                   // For SINGLE_SELECT and MULTI_SELECT only
  displayOrder: number;                 // Rendering order within section
  appliesTo: TrainingType[] | "ALL";    // Which training types show this question
  conditional?: ConditionalRule;        // Show only when another answer meets condition
}
```

### File: `lib/questions/index.ts`

```typescript
// Master export. The form UI and review UI both import from here.
// Each file contains the questions for one section.

import { QuestionDefinition } from "../types/questionDefinition";
import { sharedQuestions } from "./shared";
import { performanceQuestions } from "./performance";
import { newSystemQuestions } from "./newSystem";
import { complianceQuestions } from "./compliance";
import { roleChangeQuestions } from "./roleChange";

// All 39 questions in one flat array
export const ALL_QUESTIONS: QuestionDefinition[] = [
  ...sharedQuestions,
  ...performanceQuestions,
  ...newSystemQuestions,
  ...complianceQuestions,
  ...roleChangeQuestions,
];

// Lookup by ID — used when rendering responses in review UI
export const QUESTION_MAP: Record<string, QuestionDefinition> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

// Get questions for a specific training type
// Returns shared questions (appliesTo === "ALL") plus type-specific questions
export function getQuestionsForType(trainingType: TrainingType): QuestionDefinition[] {
  return ALL_QUESTIONS
    .filter(
      (q) => q.appliesTo === "ALL" || q.appliesTo.includes(trainingType)
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
```

### Example question file: `lib/questions/shared.ts`

```typescript
import { QuestionDefinition } from "../types/questionDefinition";
import { FieldType } from "../types/needsAnalysis";

export const sharedQuestions: QuestionDefinition[] = [
  {
    id: "SHARED_01",
    section: "Project Context",
    questionText: "What is the name of this project or initiative?",
    idNotes: "Use this as the display name in the project list. If the stakeholder gives a vague name like \"training\" or \"new system,\" you'll want to refine this during review. This isn't a formal title — it's a working label.",
    stakeholderGuidance: "Give this project a short, descriptive name so everyone can reference it easily. It doesn't need to be the final course title.\nExamples: \"2026 Salesforce Migration Training,\" \"Q3 Safety Policy Update,\" \"New Hire Onboarding Redesign\"",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 1,
    appliesTo: "ALL",
  },
  // ... remaining shared questions follow the same pattern
  // Full content is derived from the question spec markdown
];
```

**Each section file follows this pattern.** The content comes directly from the markdown spec — the TypeScript is just the structured container for it. When you update the spec, you update the corresponding `.ts` file to match.

---

## Part 3: Prisma Schema Additions

These four models are added to your existing `schema.prisma`. They integrate with the existing `Project` and `User` models.

### Enums to Add

```prisma
enum TrainingType {
  PERFORMANCE_PROBLEM
  NEW_SYSTEM
  COMPLIANCE
  ROLE_CHANGE
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REVISION_REQUESTED
}
```

### Model: StakeholderAccessToken

```prisma
// ============================================
// STAKEHOLDER ACCESS TOKEN
// ============================================
// Generated by the ID when they create a stakeholder form link.
// The token string is what appears in the URL the stakeholder receives.
// One token = one stakeholder form session for one project.

model StakeholderAccessToken {
  id        String   @id @default(cuid())

  // The unique string that appears in the shareable URL
  // e.g., /stakeholder/form/abc123-def456
  token     String   @unique @default(cuid())

  // Which project this form collects data for
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Which question set to show
  trainingType TrainingType

  // Who generated this link (the instructional designer)
  createdById String
  createdBy   User   @relation("TokenCreator", fields: [createdById], references: [id])

  // Token lifecycle
  isActive  Boolean  @default(true)
  expiresAt DateTime?

  // Populated when the stakeholder first opens the form
  // and the attribution modal captures their identity
  stakeholderName  String?
  stakeholderEmail String?

  // One token can have one submission
  submission StakeholderSubmission?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([token])
  @@index([projectId])
  @@map("stakeholder_access_tokens")
}
```

### Model: StakeholderSubmission

```prisma
// ============================================
// STAKEHOLDER SUBMISSION
// ============================================
// One row per form session. Tracks the lifecycle from
// draft (stakeholder is filling it out) through
// review and approval by the ID.

model StakeholderSubmission {
  id       String   @id @default(cuid())

  // Link to the access token that created this submission
  tokenId  String   @unique   // One-to-one: one token, one submission
  token    StakeholderAccessToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)

  // Denormalized from token for easier querying.
  // "Which project does this submission belong to?"
  // doesn't require joining through the token table.
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Denormalized from token for the same reason.
  trainingType TrainingType

  // Submission lifecycle
  status       SubmissionStatus @default(DRAFT)

  // Timestamps for lifecycle tracking
  submittedAt  DateTime?   // When stakeholder clicked submit
  reviewedAt   DateTime?   // When ID completed review
  reviewedById String?     // Which ID reviewed it
  reviewedBy   User?       @relation("SubmissionReviewer", fields: [reviewedById], references: [id])

  // ID's notes when requesting revision (visible to stakeholder)
  revisionNotes String?    @db.Text

  // The actual answers
  responses    StakeholderResponse[]

  // Edit history
  changeLogs   StakeholderChangeLog[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([projectId])
  @@index([status])
  @@map("stakeholder_submissions")
}
```

### Model: StakeholderResponse

```prisma
// ============================================
// STAKEHOLDER RESPONSE
// ============================================
// One row per answered question per submission.
// The questionId is a string that references the TypeScript
// question constants (e.g., "SHARED_07", "PERF_04").
// It is NOT a foreign key to a database table.

model StakeholderResponse {
  id           String   @id @default(cuid())

  // Which submission this answer belongs to
  submissionId String
  submission   StakeholderSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  // Which question this answers — references TypeScript constant, not a DB table.
  // e.g., "SHARED_07", "PERF_04", "SYS_09"
  questionId   String

  // The answer value. All field types store as text:
  // - SHORT_TEXT / LONG_TEXT: the raw string
  // - SINGLE_SELECT: the selected option string
  // - MULTI_SELECT: JSON array of selected option strings (e.g., '["eLearning","Job aid"]')
  // - DATE: ISO date string
  // - NUMBER: numeric string
  // - SCALE: numeric string
  value        String   @db.Text

  // Attribution: who last edited this response
  // Set by the attribution modal (name capture on first edit)
  updatedBy    String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // One answer per question per submission
  @@unique([submissionId, questionId])
  @@index([submissionId])
  @@map("stakeholder_responses")
}
```

### Model: StakeholderChangeLog

```prisma
// ============================================
// STAKEHOLDER CHANGE LOG
// ============================================
// Attribution tracking. Records every edit to every response.
// The name modal (Option 3 decision) captures who's editing,
// and this table records what they changed.

model StakeholderChangeLog {
  id           String   @id @default(cuid())

  // Which submission was edited
  submissionId String
  submission   StakeholderSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  // Which question's answer changed
  questionId   String

  // Who made this change (from attribution session)
  changedBy    String

  // What changed
  previousValue String? @db.Text   // Null on first entry (no previous value)
  newValue      String  @db.Text

  changedAt    DateTime @default(now())

  @@index([submissionId])
  @@index([submissionId, questionId])
  @@map("stakeholder_change_logs")
}
```

### Additions to Existing Models

These relation fields need to be added to models that already exist in the schema:

```prisma
// Add to the Project model:
model Project {
  // ... existing fields ...

  // Stakeholder needs analysis
  stakeholderTokens      StakeholderAccessToken[]
  stakeholderSubmissions  StakeholderSubmission[]
}

// Add to the User model:
model User {
  // ... existing fields ...

  // Stakeholder needs analysis
  createdTokens          StakeholderAccessToken[] @relation("TokenCreator")
  reviewedSubmissions    StakeholderSubmission[]  @relation("SubmissionReviewer")
}
```

---

## Part 4: Relationship Diagram

```
User (existing)
  │
  ├── creates ──→ StakeholderAccessToken
  │                    │
  │                    ├── token (unique URL string)
  │                    ├── trainingType
  │                    ├── projectId ──→ Project (existing)
  │                    │
  │                    └── has one ──→ StakeholderSubmission
  │                                      │
  │                                      ├── status (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED)
  │                                      ├── projectId ──→ Project (denormalized)
  │                                      ├── trainingType (denormalized)
  │                                      │
  │                                      ├── has many ──→ StakeholderResponse
  │                                      │                   ├── questionId (references TS constant)
  │                                      │                   ├── value
  │                                      │                   └── updatedBy
  │                                      │
  │                                      └── has many ──→ StakeholderChangeLog
  │                                                          ├── questionId
  │                                                          ├── changedBy
  │                                                          ├── previousValue
  │                                                          └── newValue
  │
  └── reviews ──→ StakeholderSubmission (via reviewedBy)


TypeScript Constants (not in database):
  QuestionDefinition[]
    ├── id: "SHARED_01", "PERF_04", etc.
    ├── Referenced by: StakeholderResponse.questionId
    └── Referenced by: StakeholderChangeLog.questionId
```

---

## Part 5: Key Design Decisions

### Why denormalize projectId and trainingType on Submission?

The submission already links to the token, which has both `projectId` and `trainingType`. Denormalizing means duplicating that data on the submission row. The trade-off:

**Without denormalization:** Every query that asks "show me submissions for this project" or "filter by training type" requires a JOIN through the token table. Since these are the two most common query patterns (project dashboard and submission list), that's a join on every page load.

**With denormalization:** Direct queries on the submission table. `WHERE projectId = ? AND status = ?` is fast and simple. The cost is maintaining consistency — but since `projectId` and `trainingType` are set once when the token is created and never change, there's no real sync risk.

### Why store MULTI_SELECT as JSON text instead of a separate table?

Multi-select answers (like delivery format preferences) could be normalized into a `StakeholderResponseOption` join table. But these are display values, not entities with their own relationships. Storing `'["eLearning","Job aid","Video"]'` as a JSON string in the value column keeps the schema simple. Parse it in the TypeScript layer when you need the array.

### Why one-to-one between Token and Submission?

A token represents one invitation to fill out one form. If the stakeholder needs to submit again (revision requested), they edit the same submission — they don't create a new one. The change log tracks what changed between versions. If the ID needs a completely new form filled out (different training type, different stakeholder), they generate a new token.

### Why is questionId a plain string, not a foreign key?

Because question definitions live in TypeScript, not the database. The `questionId` column stores strings like "SHARED_07" or "PERF_04" that reference the constants in `lib/questions/`. The TypeScript `QUESTION_MAP` lookup handles the "join." This means the database doesn't enforce referential integrity on question IDs — if you rename a question ID in the TypeScript without updating existing responses, those responses become orphaned. In practice this isn't a risk because question IDs are stable identifiers that don't change after deployment.

---

## Part 6: Claude Code Implementation Prompt

Paste this into Claude Code in Cursor to implement the data model.

---

### Prompt

```
Implement the Stakeholder Needs Analysis data model for EDUTex.

## What to Build

### 1. Prisma Schema Changes

Add to schema.prisma:

**New enums:**
- TrainingType: PERFORMANCE_PROBLEM, NEW_SYSTEM, COMPLIANCE, ROLE_CHANGE
- SubmissionStatus: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REVISION_REQUESTED

**New models (4):**

model StakeholderAccessToken {
  id              String    @id @default(cuid())
  token           String    @unique @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  trainingType    TrainingType
  createdById     String
  createdBy       User      @relation("TokenCreator", fields: [createdById], references: [id])
  isActive        Boolean   @default(true)
  expiresAt       DateTime?
  stakeholderName  String?
  stakeholderEmail String?
  submission      StakeholderSubmission?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([token])
  @@index([projectId])
  @@map("stakeholder_access_tokens")
}

model StakeholderSubmission {
  id              String    @id @default(cuid())
  tokenId         String    @unique
  token           StakeholderAccessToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  trainingType    TrainingType
  status          SubmissionStatus @default(DRAFT)
  submittedAt     DateTime?
  reviewedAt      DateTime?
  reviewedById    String?
  reviewedBy      User?     @relation("SubmissionReviewer", fields: [reviewedById], references: [id])
  revisionNotes   String?   @db.Text
  responses       StakeholderResponse[]
  changeLogs      StakeholderChangeLog[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([projectId])
  @@index([status])
  @@map("stakeholder_submissions")
}

model StakeholderResponse {
  id              String    @id @default(cuid())
  submissionId    String
  submission      StakeholderSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  questionId      String
  value           String    @db.Text
  updatedBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([submissionId, questionId])
  @@index([submissionId])
  @@map("stakeholder_responses")
}

model StakeholderChangeLog {
  id              String    @id @default(cuid())
  submissionId    String
  submission      StakeholderSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  questionId      String
  changedBy       String
  previousValue   String?   @db.Text
  newValue        String    @db.Text
  changedAt       DateTime  @default(now())

  @@index([submissionId])
  @@index([submissionId, questionId])
  @@map("stakeholder_change_logs")
}

**Update existing models:**

Add to Project model:
  stakeholderTokens      StakeholderAccessToken[]
  stakeholderSubmissions  StakeholderSubmission[]

Add to User model:
  createdTokens          StakeholderAccessToken[] @relation("TokenCreator")
  reviewedSubmissions    StakeholderSubmission[]  @relation("SubmissionReviewer")

### 2. TypeScript Types

Create lib/types/needsAnalysis.ts:
- Export enum TrainingType with 4 values + TRAINING_TYPE_LABELS display map
- Export enum SubmissionStatus with 5 values
- Export enum FieldType with 7 values: SHORT_TEXT, LONG_TEXT, SINGLE_SELECT, MULTI_SELECT, DATE, NUMBER, SCALE

Create lib/types/questionDefinition.ts:
- Export interface ConditionalRule { questionId: string; operator: "equals" | "not_equals" | "includes"; value: string }
- Export interface QuestionDefinition with fields: id, section, questionText, idNotes, idNotesExtended?, stakeholderGuidance, fieldType, required, options?, displayOrder, appliesTo (TrainingType[] | "ALL"), conditional?

Create lib/questions/index.ts:
- Import question arrays from section files (shared, performance, newSystem, compliance, roleChange)
- Export ALL_QUESTIONS (flat array)
- Export QUESTION_MAP (Record<string, QuestionDefinition> for lookup by ID)
- Export getQuestionsForType(trainingType: TrainingType) function that returns shared + type-specific questions sorted by displayOrder

Create placeholder files for question content (we'll fill these in next):
- lib/questions/shared.ts — export empty array with correct type
- lib/questions/performance.ts — export empty array
- lib/questions/newSystem.ts — export empty array
- lib/questions/compliance.ts — export empty array
- lib/questions/roleChange.ts — export empty array

### 3. Run Migration

After schema changes:
npx prisma migrate dev --name add_stakeholder_needs_analysis

### 4. Verify

Check that:
1. All 4 new models created in database
2. Both new enums registered
3. Project model has stakeholderTokens and stakeholderSubmissions relations
4. User model has createdTokens and reviewedSubmissions relations
5. TypeScript files compile without errors
6. getQuestionsForType returns empty arrays (placeholder files) without crashing
```

---

## Part 7: After Migration — Next Steps

Once the data model is in place:

| Step | Task | Depends On |
|------|------|------------|
| **Fill question content** | Populate the 5 question files from the markdown spec | Data model complete |
| **API routes** | CRUD for tokens, submissions, responses, change log | Data model + question content |
| **Stakeholder form UI** | Public form rendered by training type | API routes + question content |
| **ID review UI** | In-app review with approve/revision workflow | API routes + question content |
