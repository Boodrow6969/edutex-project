# Course Dashboard Enhancements — Prompt 3

Three enhancements to the course dashboard. All on one feature branch.

## Setup

```
git checkout main
git pull
git checkout -b feature/dashboard-enhancements
```

## Enhancement 1: Wire Real Task Data into "Next Tasks" Strip

The dashboard banner currently shows hardcoded dummy tasks. Replace with real Task records from the database.

### 1a. Update `lib/courses/getCourseOverview.ts`

Add a new field to the `CourseOverview` interface and query:

```ts
// Add to CourseOverview interface
upcomingTasks: Array<{
  id: string;
  title: string;
  dueDate: Date | null;
  priority: string;  // LOW, MEDIUM, HIGH, URGENT
  status: string;    // TODO, IN_PROGRESS, REVIEW, DONE
}>;
```

Add this Prisma query inside `getCourseOverview()`, after the existing task stats queries:

```ts
// Fetch next 5 incomplete tasks, ordered by dueDate (nulls last), then priority
const upcomingTasks = await prisma.task.findMany({
  where: {
    courseId,
    status: { not: 'DONE' },
  },
  select: {
    id: true,
    title: true,
    dueDate: true,
    priority: true,
    status: true,
  },
  orderBy: [
    { dueDate: 'asc' },
    { priority: 'desc' },
  ],
  take: 5,
});
```

Add `upcomingTasks` to the return object.

### 1b. Update `components/course/CourseDashboard.tsx`

Remove the hardcoded `DUMMY_TASKS` array (or whatever the dummy data constant is called).

In the data fetching logic, read `upcomingTasks` from the overview API response.

In the banner's "Next Tasks" strip:
- If `upcomingTasks` is empty, show a subtle message: "No tasks yet"
- If tasks exist, render them the same way as current dummy tasks but using real data
- Map priority values: URGENT and HIGH → "high" styling (red pill), MEDIUM → "medium" (amber pill), LOW → "low" (gray pill)
- For `dueDate`: if null, show "No due date" instead of days remaining
- Keep the "View All →" link (non-functional for now, can wire later)

### 1c. Update banner metadata

The course header banner should also use real data for:
- **Created date:** use `course.createdAt` from overview response (already available)
- **Deadline date:** use `course.targetGoLive` from overview response. Need to add `targetGoLive` to the course select in `getCourseOverview.ts`:

```ts
// In the prisma.course.findUnique select, add:
targetGoLive: true,
```

And add to the `CourseOverview.course` interface:
```ts
targetGoLive: Date | null;
```

- If `targetGoLive` is null, show "No deadline set" instead of a date
- **Curriculum info:** Need to add curriculum data to the overview query. Add to the course select:

```ts
curricula: {
  select: {
    curriculum: {
      select: {
        id: true,
        name: true,
      },
    },
  },
},
```

Add to the course return:
```ts
curricula: course.curricula.map(cc => ({
  id: cc.curriculum.id,
  name: cc.curriculum.name,
})),
```

In the banner: if curricula array is non-empty, show the first curriculum name as a link. If empty, show "Standalone Course".

## Enhancement 2: Status Persistence

Card statuses (Not Started / In Progress / Complete) currently reset on page refresh. Persist them to the database.

### 2a. Schema migration

Add a JSON field to the Course model in `prisma/schema.prisma`:

```prisma
model Course {
  // ... existing fields ...
  dashboardStatuses Json?    // Stores card status overrides as JSON
  // ...
}
```

Run migration:
```
npx prisma migrate dev --name add_dashboard_statuses
```

### 2b. Create API endpoint

Create `app/api/courses/[courseId]/dashboard-statuses/route.ts`:

**GET** — returns the current `dashboardStatuses` JSON (or empty object if null)
**PUT** — accepts a JSON body with card statuses, validates it's a plain object with string values, saves to `course.dashboardStatuses`

```ts
// PUT body shape:
{
  "needsAnalysis": "Complete",
  "stakeholders": "In Progress",
  "objectives": "In Progress",
  "taskAnalysis": "Not Started",
  "storyboard": "Not Started",
  "jobAids": "Not Started",
  "assessment": "Not Started",
  "evaluation": "Not Started"
}
```

Validate: only allow values "Not Started", "In Progress", "Complete". Reject anything else.

Use `assertCourseAccess` for authorization (same pattern as other course endpoints).

### 2c. Update `getCourseOverview.ts`

Add `dashboardStatuses` to the course select and return:

```ts
// In select:
dashboardStatuses: true,

// In return:
dashboardStatuses: course.dashboardStatuses,
```

### 2d. Update `CourseDashboard.tsx`

On mount:
- Read `dashboardStatuses` from the overview response
- Initialize card statuses from saved data, falling back to auto-calculated status if no override exists

On gear status change:
- Update local state immediately (optimistic)
- Fire a PUT to `/api/courses/${courseId}/dashboard-statuses` with the full statuses object
- No loading spinner needed — fire and forget with error handling (console.error on failure)

The auto-calculation logic stays as the default. Manual overrides from the gear take precedence. If a card has a saved override in `dashboardStatuses`, use that. If not, fall back to auto-calculation.

## Enhancement 3: Add Success Metrics Tab Back to Needs Analysis

The NeedsAnalysisView currently has 3 tabs: Analysis, Stakeholders, Objectives. SuccessMetricsTab.tsx exists in `components/needs-analysis/` but is not wired in. Add it back.

### 3a. Update `components/pages/NeedsAnalysisView.tsx`

Add the import:
```ts
import SuccessMetricsTab from '@/components/needs-analysis/SuccessMetricsTab';
```

Update the TABS array — add Success Metrics between Stakeholders and Objectives:
```ts
const TABS = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'success-metrics', label: 'Success Metrics' },
  { id: 'objectives', label: 'Objectives' },
];
```

Add the rendering case in the tab content switch/conditional. SuccessMetricsTab takes:
```ts
<SuccessMetricsTab data={formData} onChange={handleFieldChange} />
```

Match the same `data` and `onChange` pattern used by the other tabs (AnalysisTab, StakeholdersTab, etc.). The `data` prop is the `CourseAnalysisFormData` state, and `onChange` is the handler that accepts `Partial<CourseAnalysisFormData>` updates.

Look at how the existing tabs are rendered in the component and follow the exact same pattern for SuccessMetricsTab.

## DO NOT touch

- `schema.prisma` beyond adding the one `dashboardStatuses` field
- Any view components other than NeedsAnalysisView (for the Success Metrics tab)
- Route files for analysis, objectives, task-analysis, storyboard, etc.
- The `page/[pageId]` fallback router

## Commit

```
git add .
git commit -m "feat: dashboard enhancements - real tasks, status persistence, success metrics tab"
git push -u origin feature/dashboard-enhancements
```

## Expected Results

1. **Next Tasks strip** shows real tasks from the database (or "No tasks yet" if none exist). Banner shows real created date, deadline (targetGoLive), and curriculum info.
2. **Card statuses** persist across page refreshes. Change a status via gear icon, refresh, status stays.
3. **Success Metrics tab** appears in the Needs Analysis view between Stakeholders and Objectives.
