# Fix BUG-018 and BUG-019 — Context & Gap Check display errors

## Context

Two display bugs in the Learning Objectives Wizard, Screen 1 (Context & Gap Check).
Both are in `buildNASummary()` in `app/workspace/[workspaceId]/course/[courseId]/objectives/page.tsx`.
No other files need to change.

---

## Bug 018 — Training type shows raw enum value

### Problem
`buildNASummary()` converts the training type enum value using string transformation:
```typescript
const trainingTypeDisplay = trainingType
  .replace(/_/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());
```
This produces "Tool And Process" instead of "Tool & Process Training".

### Fix
Replace the string transformation with a lookup from `TRAINING_TYPE_LABELS`.

`TRAINING_TYPE_LABELS` is already imported or available from `@/lib/types/stakeholderAnalysis.ts`.
It maps `TrainingType.TOOL_AND_PROCESS` → `"Tool & Process Training"` and all other training types correctly.

Replace the transformation with:
```typescript
const trainingTypeDisplay = TRAINING_TYPE_LABELS[trainingType as TrainingType] ?? trainingType.replace(/_/g, ' ');
```

The fallback `.replace(/_/g, ' ')` handles any CourseType values not in TrainingType (ONBOARDING, PROFESSIONAL_DEVELOPMENT, OTHER).

If `TRAINING_TYPE_LABELS` is not already imported in page.tsx, add the import:
```typescript
import { TrainingType, TRAINING_TYPE_LABELS } from '@/lib/types/stakeholderAnalysis';
```

---

## Bug 019 — Target audience shows raw JSON

### Problem
`buildNASummary()` falls back to SHARED_06 for audience data when no CourseAnalysis audiences exist.
SHARED_06 is a REPEATING_TABLE field — its value is a JSON array of objects with a `role` key (and possibly other keys like `headcount`, `frequency`).
The raw JSON string is passed directly to `naSummary.audience` and rendered as plain text.

### Fix
In the SHARED_06 fallback branch, parse the JSON and extract role names before joining.

Find the section in `buildNASummary()` that reads SHARED_06 and replace the raw value assignment with:

```typescript
// SHARED_06 is a REPEATING_TABLE — parse and extract role names
let audienceValue = resp.value;
try {
  const rows = JSON.parse(resp.value);
  if (Array.isArray(rows) && rows.length > 0) {
    audienceValue = rows
      .map((r: Record<string, string>) => r.role || r.Role || Object.values(r)[0] || '')
      .filter(Boolean)
      .join(', ');
  }
} catch {
  // fall through — use raw value
}
// use audienceValue instead of resp.value
```

The `r.role || r.Role || Object.values(r)[0]` pattern handles case variation in the column key name and falls back to the first column value if neither matches.

---

## Step 3 — Build check

Run `npm run build` and confirm clean before reporting.

---

## Expected output

1. `buildNASummary()` updated — both fixes applied
2. Confirm TRAINING_TYPE_LABELS import present
3. npm run build passes clean
4. Full diff of page.tsx changes only
