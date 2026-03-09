# Prompt A — Rename NEW_SYSTEM → TOOL_AND_PROCESS

## Context

The `NEW_SYSTEM` training type is being renamed to `TOOL_AND_PROCESS` to better reflect its scope (new software, updated features, and procedural changes tied to a system or tool). This rename touches the Prisma schema (two enums), requires a database migration, and updates 11 source files.

This prompt handles the rename only — no question content changes, no tab mapping changes.

---

## Instructions

### Step 1 — Schema changes

In `prisma/schema.prisma`, rename `NEW_SYSTEM` to `TOOL_AND_PROCESS` in both enum definitions:

```prisma
// CourseType enum (line ~134)
enum CourseType {
  PERFORMANCE_PROBLEM
  TOOL_AND_PROCESS   // was NEW_SYSTEM
  COMPLIANCE
  ROLE_CHANGE
  ONBOARDING
  PROFESSIONAL_DEVELOPMENT
  OTHER
}

// TrainingType enum (line ~1040)
enum TrainingType {
  PERFORMANCE_PROBLEM
  TOOL_AND_PROCESS   // was NEW_SYSTEM
  COMPLIANCE
  ROLE_CHANGE
}
```

### Step 2 — TypeScript validation before migration

Run `npm run build` BEFORE running any migration. Fix any TypeScript errors first. Do not touch the database until the build passes.

### Step 3 — Migration

Create and run a Prisma migration that renames the enum value in both enums and updates any existing database rows:

```bash
npx prisma migrate dev --name rename-new-system-to-tool-and-process
```

If Prisma cannot rename enum values directly (PostgreSQL limitation), use a raw SQL migration:

```sql
-- Rename in CourseType enum
ALTER TYPE "CourseType" RENAME VALUE 'NEW_SYSTEM' TO 'TOOL_AND_PROCESS';

-- Rename in TrainingType enum  
ALTER TYPE "TrainingType" RENAME VALUE 'NEW_SYSTEM' TO 'TOOL_AND_PROCESS';
```

After migration, run `npx prisma generate` to regenerate the client.

### Step 4 — Source file updates

Update every occurrence of `NEW_SYSTEM` across the following files. Replace all enum references, switch cases, map keys, display labels, and comments.

---

#### `lib/types/stakeholderAnalysis.ts`

- Line 7: `NEW_SYSTEM = "NEW_SYSTEM"` → `TOOL_AND_PROCESS = "TOOL_AND_PROCESS"`
- Line 14: `[TrainingType.NEW_SYSTEM]: "New System"` → `[TrainingType.TOOL_AND_PROCESS]: "Tool & Process Training"`

---

#### `lib/questions/newSystem.ts`

- Line 5 comment: update "NEW_SYSTEM training type" → "TOOL_AND_PROCESS training type"
- All `appliesTo` arrays (lines 32, 46, 60, 74, 93, 107, 121, 148, 167, 181, 195, 209): `TrainingType.NEW_SYSTEM` → `TrainingType.TOOL_AND_PROCESS`

---

#### `lib/questions/shared.ts`

- Line 18 comment: update references from "NEW_SYSTEM" → "TOOL_AND_PROCESS"
- All `appliesTo` arrays (lines 128, 146, 160, 184, 202, 216, 258, 272, 291, 315, 333, 356, 375, 436, 474, 502): `TrainingType.NEW_SYSTEM` → `TrainingType.TOOL_AND_PROCESS`
- Lines 662, 664 comments: update "non-NEW_SYSTEM" → "non-TOOL_AND_PROCESS"

---

#### `lib/questions/index.ts`

- Line 12: `[TrainingType.NEW_SYSTEM]: newSystemQuestions` → `[TrainingType.TOOL_AND_PROCESS]: newSystemQuestions`

(The imported variable name `newSystemQuestions` can stay as-is — it refers to the file, not the enum value.)

---

#### `lib/questions/learnerProfiles.ts`

- Line 6 comment: update "non-NEW_SYSTEM" → "non-TOOL_AND_PROCESS"

---

#### `components/needs-analysis/AudienceProfiles.tsx`

- Lines 310–315 comments: update any `NEW_SYSTEM` references → `TOOL_AND_PROCESS`

---

#### `components/course/CourseDashboard.tsx`

- Line 99: `NEW_SYSTEM: 'New System'` → `TOOL_AND_PROCESS: 'Tool & Process Training'`

---

#### `components/modals/CreateCourseModal.tsx`

- Line 194: `value={CourseType.NEW_SYSTEM}` — update enum reference
- Update the display text in the `<option>` element from "New System" → "Tool & Process Training"

---

#### `app/courses/page.tsx`

- Line 111: `value={CourseType.NEW_SYSTEM}` — update enum reference
- Update the display text in the `<option>` element from "New System" → "Tool & Process Training"

---

#### `app/workspace/[workspaceId]/course/[courseId]/objectives/constants.ts`

- Line 15: rename constant `NEW_SYSTEM_TABS` → `TOOL_AND_PROCESS_TABS`
- Line 83: `case 'NEW_SYSTEM':` → `case 'TOOL_AND_PROCESS':`
- Line 84: `return NEW_SYSTEM_TABS;` → `return TOOL_AND_PROCESS_TABS;`

---

#### `app/workspace/[workspaceId]/course/[courseId]/objectives/page.tsx`

- Line 246: `case 'NEW_SYSTEM':` → `case 'TOOL_AND_PROCESS':`

---

### Step 5 — Final build check

Run `npm run build` and confirm it passes clean before reporting complete.

---

## What NOT to change in this prompt

- Question content, questionText, helpText, stakeholderGuidance, idNotes — handled in Prompt B
- Tab titles and sourceSections in constants.ts — handled in Prompt B
- SYS_02 deletion — handled in Prompt B
- Section name "About the System" — handled in Prompt B
- The filename `lib/questions/newSystem.ts` — leave as-is for now

---

## Expected output

Report:
1. Migration ran successfully (or raw SQL used and why)
2. `npx prisma generate` completed
3. All 11 source files updated
4. Final `npm run build` passes clean
5. Full diff of every changed file