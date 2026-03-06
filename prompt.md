# Implementation Prompt: Shared ResponseValue Renderer
# File: docs/prompts/prompt-shared-response-renderer.md

Read this entire prompt before writing any code. Do not begin implementation until you confirm the spec.

---

## Context

BUG-016 (REPEATING_TABLE renders as raw JSON) and BUG-017 (conditional questions render when they shouldn't) were fixed in `SubmissionDetailPanel.tsx`. The same bugs exist in two other components that render stakeholder response data. This prompt extracts the fix into a shared renderer and applies it across all consumers.

---

## Before Writing Code

Read these files in full and report back what you find before proceeding:

1. `components/stakeholder/SubmissionDetailPanel.tsx` — confirm the current `ResponseValue` component, `formatColumnHeader`, `parseMultiSelect`, and `shouldShow` functions as they exist after the previous fix
2. `components/needs-analysis/AudienceProfiles.tsx` — confirm the `extractAudienceData` function and how it builds `{ label, value }` items
3. `app/workspace/[workspaceId]/course/[courseId]/objectives/page.tsx` — confirm the `buildNASections` function (around line 347) and the `NASection` / item type definitions
4. `app/workspace/[workspaceId]/course/[courseId]/objectives/components/NASlideOver.tsx` — confirm the `NASection` type it receives and how it renders each item

Report the current state of all four files before proceeding.

---

## Architecture

Create one shared renderer used by all three consumers. Do not duplicate logic.

**New file:** `components/stakeholder/ResponseValue.tsx`

Extract from `SubmissionDetailPanel.tsx` into this shared file:
- `parseMultiSelect` function
- `formatColumnHeader` function
- `shouldShow` function
- `ResponseValue` component
- The `ConditionalDef` type (the `{ questionId, operator, value }` shape)

Export all of them as named exports.

Update `SubmissionDetailPanel.tsx` to import from the shared file instead of defining them locally. Remove the local definitions.

---

## Change 1 — Create `components/stakeholder/ResponseValue.tsx`

```tsx
'use client';

export interface ConditionalDef {
  questionId: string;
  operator: 'includes' | 'equals';
  value: string;
}

export interface ResponseItem {
  questionId: string;
  fieldType: string;
  conditional: ConditionalDef | null;
  value: string | null; // null = no response
}

export function parseMultiSelect(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through
  }
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function formatColumnHeader(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

export function shouldShow(
  conditional: ConditionalDef | null,
  responseMap: Map<string, string>
): boolean {
  if (!conditional) return true;
  const parentValue = responseMap.get(conditional.questionId) ?? '';
  if (conditional.operator === 'includes') return parentValue.includes(conditional.value);
  if (conditional.operator === 'equals') return parentValue === conditional.value;
  return true;
}

export function ResponseValue({ fieldType, value }: { fieldType: string; value: string | null }) {
  if (!value) {
    return <span className="text-gray-400 italic text-sm">No response</span>;
  }

  if (fieldType === 'MULTI_SELECT') {
    const items = parseMultiSelect(value);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (fieldType === 'SCALE') {
    return <span className="text-gray-900">{value} / 5</span>;
  }

  if (fieldType === 'REPEATING_TABLE') {
    let rows: Record<string, string>[];
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return <span className="text-gray-400 italic text-sm">No response</span>;
      }
      rows = parsed;
    } catch {
      return <span className="text-gray-900 whitespace-pre-wrap">{value}</span>;
    }
    const columns = Object.keys(rows[0]);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  {formatColumnHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-gray-900 border-b border-gray-100">
                    {row[col] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <span className="text-gray-900 whitespace-pre-wrap">{value}</span>;
}
```

---

## Change 2 — Update `SubmissionDetailPanel.tsx`

- Remove the local definitions of `parseMultiSelect`, `formatColumnHeader`, `shouldShow`, and `ResponseValue`
- Add import: `import { ResponseValue, shouldShow, formatColumnHeader, parseMultiSelect } from '@/components/stakeholder/ResponseValue'`
- The `ResponseValue` usage in this file passes `qr` as a prop — update the call site to pass `fieldType={qr.fieldType}` and `value={qr.response?.value ?? null}` to match the new shared interface
- The `shouldShow` call site passes `(qr, responseMap)` — update to pass `(qr.conditional, responseMap)` to match the new shared signature
- Everything else in this file stays the same

---

## Change 3 — Fix `AudienceProfiles.tsx`

### Problem
`extractAudienceData` builds `{ label, value }` items with no `fieldType` or `conditional`. Values render as raw strings.

### Fix
Update `extractAudienceData` to look up `fieldType` and `conditional` from `QUESTION_MAP` for each response, and build a `responseMap` for conditional filtering.

**Updated item type** (local to this file or imported if it exists):
```ts
interface AudienceItem {
  label: string;
  value: string;
  fieldType: string;
  conditional: ConditionalDef | null;
  questionId: string;
}
```

**Updated extraction** (inside `extractAudienceData`):
```ts
// Build responseMap first for conditional filtering
const responseMap = new Map<string, string>();
for (const resp of submission.responses) {
  if (resp.value) responseMap.set(resp.questionId, resp.value);
}

// Then build items with type info
for (const resp of submission.responses) {
  if (!AUDIENCE_QUESTION_IDS.has(resp.questionId)) continue;
  const qDef = QUESTION_MAP[resp.questionId];
  const conditional = qDef?.conditional ?? null;
  if (!shouldShow(conditional, responseMap)) continue; // skip unmet conditionals
  items.push({
    label: resp.question,
    value: resp.value,
    fieldType: qDef?.fieldType ?? 'SHORT_TEXT',
    conditional,
    questionId: resp.questionId,
  });
}
```

**Updated rendering** (replace the current `{item.value}` paragraph):
```tsx
import { ResponseValue, shouldShow, ConditionalDef } from '@/components/stakeholder/ResponseValue';

// In the render:
<span className="font-medium text-gray-700">{item.label}:</span>
<ResponseValue fieldType={item.fieldType} value={item.value} />
```

---

## Change 4 — Fix `NASlideOver.tsx` via `buildNASections` in `objectives/page.tsx`

### Problem
`buildNASections` discards `fieldType` and `conditional` when building `{ q, a }` items. NASlideOver renders raw strings.

### Fix — Update the item type in `objectives/page.tsx`

Find the type definition for items inside `NASection` (likely `{ q: string; a: string; order: number }`) and extend it:
```ts
{
  q: string;
  a: string;
  order: number;
  fieldType: string;
  conditional: ConditionalDef | null;
  questionId: string;
}
```

**Updated build loop** (around line 391–395):
```ts
// Build responseMap for this section's submission before the loop
const responseMap = new Map<string, string>();
for (const resp of sec.responses) {
  if (resp.value) responseMap.set(resp.questionId, resp.value);
}

for (const resp of sec.responses) {
  const qDef = QUESTION_MAP[resp.questionId];
  const conditional = qDef?.conditional ?? null;
  if (!shouldShow(conditional, responseMap)) continue; // skip unmet conditionals
  tabItems[targetTab.key].push({
    q: `${name}: ${qDef?.questionText ?? resp.question ?? resp.questionId}`,
    a: resp.value,
    order: displayOrder,
    fieldType: qDef?.fieldType ?? 'SHORT_TEXT',
    conditional,
    questionId: resp.questionId,
  });
}
```

Import `shouldShow` and `ConditionalDef` from the shared file:
```ts
import { shouldShow, ConditionalDef } from '@/components/stakeholder/ResponseValue';
```

### Fix — Update `NASlideOver.tsx`

Update the item type it accepts to include `fieldType`. Replace the current value renderer:
```tsx
// Replace:
<p className="text-sm text-gray-800 whitespace-pre-line">{it.a}</p>

// With:
import { ResponseValue } from '@/components/stakeholder/ResponseValue';
<ResponseValue fieldType={it.fieldType} value={it.a || null} />
```

---

## Build Sequence

1. Confirm all four files (report back first — do not write code yet)
2. Create `components/stakeholder/ResponseValue.tsx`
3. Update `SubmissionDetailPanel.tsx` to import from shared file
4. Run `npm run build` — confirm no errors before continuing
5. Update `AudienceProfiles.tsx`
6. Update `buildNASections` in `objectives/page.tsx`
7. Update `NASlideOver.tsx`
8. Run `npm run build` — confirm clean
9. Show diff of every change before applying

---

## Constraints
- No new npm packages
- No schema changes
- No API changes
- Match existing Tailwind patterns
- Do not refactor anything outside the scope of these fixes
- The shared `ResponseValue.tsx` must be the single source of truth — do not leave duplicate logic in any consumer file

---

## Done When
- REPEATING_TABLE values render as formatted tables in all three locations
- Conditional questions whose trigger was not met are hidden in all three locations
- `SubmissionDetailPanel.tsx` imports from the shared file, no local duplicates
- `npm run build` passes clean
- No existing rendering behavior changed for other field types