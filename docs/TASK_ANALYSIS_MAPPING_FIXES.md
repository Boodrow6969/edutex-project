# Task Analysis — Data Mapping Bug Fixes

Fix all data mapping bugs in task-analysis components. Four bugs total.

## Bug 1: LearnerContextSection — wrong data path

**File:** `components/pages/task-analysis/LearnerContextSection.tsx`  
**Location:** `fetchNAContext` function (~line 57)

**Problem:** The analysis-context API returns:
```json
{
  "courseAnalysis": {
    "audiences": [{ "role": "...", "techComfort": "...", ... }],
    "constraints": ["constraint1", "constraint2"]
  },
  "submissions": [...],
  "workspaceContacts": [...]
}
```

The component reads `data.audiences` and `data.constraints` — missing the `courseAnalysis` wrapper.

**Fix:**
- Change `data.audiences` → `data.courseAnalysis?.audiences`
- Change `data.constraints` → `data.courseAnalysis?.constraints`
- `constraints` is `string[]` not a string — join with `"; "` before setting
- `techComfort` in the DB may be uppercase enum values like `"NOVICE"` but the select dropdown uses `"Novice"` — normalize by capitalizing first letter, lowercasing rest (or map explicitly)

## Bug 2: TaskIdentitySection — wrong endpoint for source tasks

**File:** `components/pages/task-analysis/TaskIdentitySection.tsx`  
**Location:** `fetchSourceTasks` function (~line 80)

**Problem:** Currently fetches from `/api/courses/${courseId}/learning-tasks`. This is the `LearningTask` model which is separate from the Needs Analysis task inventory.

The NA tasks live in the analysis-context response at `courseAnalysis.tasks[]`.

**Fix:**
- Change fetch URL to `/api/courses/${courseId}/analysis-context`
- Read from `data.courseAnalysis?.tasks` (not `data` directly)
- Each task object has shape `{ id, task, audience, complexity, intervention, priority, notes, order }` — the display name field is `task` not `title`
- Update the mapping: `setSourceTasks(data.courseAnalysis.tasks.map(t => ({ id: t.id, title: t.task })))` 
- Handle empty/missing gracefully: `data.courseAnalysis?.tasks || []`

## Bug 3: TaskAnalysisDetailView — null dataSource crash

**File:** `components/pages/task-analysis/TaskAnalysisDetailView.tsx`  
**Location:** `useEffect` where `setData(json)` is called (~line 40)

**Problem:** The `dataSource` field in Prisma is `Json` type. When a new TaskAnalysis is created, `dataSource` is stored as `{}` or potentially `null`. If `null`, the component will crash when sub-components try to read `dataSource[field]`.

**Fix:**
- After fetching, normalize before setting state:
```typescript
json.dataSource = json.dataSource || {};
setData(json);
```

## Bug 4: Objectives endpoint — verify response shape

**File:** `components/pages/task-analysis/TaskIdentitySection.tsx`  
**Location:** `fetchObjectives` function (~line 65)

**Problem:** Component expects `{ id, title, bloomLevel }` from `/api/courses/${courseId}/objectives`. Need to verify the API actually returns objects with a `title` field (not `text` or `description` or something else).

**Fix:**
- Check `app/api/courses/[courseId]/objectives/route.ts` for the actual response shape
- If the field name differs from `title`, update the component's `ObjectiveOption` interface and rendering to match
- If `bloomLevel` comes back as an enum string like `"REMEMBER"`, that's fine — it already displays as-is

## After all fixes

1. Run `npm run build` — must pass clean
2. Test in browser with a course that has Needs Analysis data:
   - Open Task Analysis detail view
   - Verify "Pre-populate from Needs Analysis?" prompt appears with actual data
   - Verify "Link Source Task" shows tasks from NA inventory
   - Verify "Link Objective" shows course objectives
   - Verify no console errors about null/undefined reads
