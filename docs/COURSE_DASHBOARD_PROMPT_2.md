# Course Dashboard Revamp — Prompt 2: Wire View Components to Routes

Wire the real view components into the dedicated route pages created in Prompt 1. Each route looks up the page record by type, then renders the existing view component with the correct props.

## Branch

Continue on `feature/course-dashboard-revamp` (already checked out).

## Key Concept

The existing system uses Page records in the database. Each course has pages with types like NEEDS_ANALYSIS, TASK_ANALYSIS, STORYBOARD, etc. The view components need a `pageId` to fetch their data. Each new route must:

1. Fetch the course's pages from `/api/courses/${courseId}/overview`
2. Find the page record matching the expected type
3. Pass the `pageId` to the view component
4. If no matching page exists, show a message like "This page hasn't been created yet" with option to go back

## Route Wiring

### 1. `app/workspace/[workspaceId]/course/[courseId]/analysis/page.tsx`

Replace the placeholder with:

```tsx
'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NeedsAnalysisView from '@/components/pages/NeedsAnalysisView';

export default function AnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;
  
  // Support ?tab=stakeholders from dashboard Stakeholders card
  const initialTab = searchParams.get('tab') || undefined;

  // NeedsAnalysisView has pageId as optional, so we can render without it
  // But if we want to pass it, fetch from overview first
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/courses/${courseId}/overview`);
        if (!res.ok) throw new Error('Failed to load course');
        const data = await res.json();
        const naPage = data.pages?.find((p: any) => p.type === 'NEEDS_ANALYSIS');
        setPageId(naPage?.id || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="inline-block mt-4 text-blue-600 hover:text-blue-700">
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <span className="text-gray-900">Needs Analysis</span>
        </nav>
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden">
        <NeedsAnalysisView
          courseId={courseId}
          workspaceId={workspaceId}
          pageId={pageId || undefined}
        />
      </div>
    </div>
  );
}
```

**IMPORTANT:** NeedsAnalysisView supports an `initialTab` concept via its SubTabBar. Check if NeedsAnalysisView accepts an `initialTab` or `defaultTab` prop. If it does, pass `initialTab` from the search params. If it doesn't, add that prop support:
- In `NeedsAnalysisView`, add optional prop `initialTab?: string`
- Use it to set the initial `activeTab` state: `const [activeTab, setActiveTab] = useState(initialTab || 'analysis');`
- This enables the Stakeholders dashboard card to deep-link to `?tab=stakeholders`

### 2. `app/workspace/[workspaceId]/course/[courseId]/objectives/page.tsx`

Replace placeholder. LearningObjectivesView requires `pageId` and `courseId`.

- Fetch course overview, find page with `type === 'LEARNING_OBJECTIVES'`
- If found, render `<LearningObjectivesView pageId={page.id} courseId={courseId} />`
- If not found, show "Learning Objectives page hasn't been created yet" with back link
- Breadcrumb: Workspaces > Course > Learning Objectives

### 3. `app/workspace/[workspaceId]/course/[courseId]/task-analysis/page.tsx`

Replace placeholder. TaskAnalysisView requires `courseId` and `pageId`, optional `workspaceId`.

- Fetch course overview, find page with `type === 'TASK_ANALYSIS'`
- If found, render `<TaskAnalysisView courseId={courseId} pageId={page.id} workspaceId={workspaceId} />`
- If not found, show "Task Analysis page hasn't been created yet" with back link
- Breadcrumb: Workspaces > Course > Task Analysis

### 4. `app/workspace/[workspaceId]/course/[courseId]/storyboard/page.tsx`

Replace placeholder. StoryboardEditor requires `pageId`, `courseId`, `workspaceId`.

- Fetch course overview, find page with `type === 'STORYBOARD'`
- If found, render `<StoryboardEditor pageId={page.id} courseId={courseId} workspaceId={workspaceId} />`
- If not found, show "Storyboard hasn't been created yet" with back link
- Breadcrumb: Workspaces > Course > Storyboard

### 5. `app/workspace/[workspaceId]/course/[courseId]/job-aids/page.tsx`

Keep as enhanced placeholder for now (module not built yet):

- Breadcrumb: Workspaces > Course > Job Aids
- Show "Job Aids module coming soon" with back link
- No component to wire yet

### 6. `app/workspace/[workspaceId]/course/[courseId]/assessment/page.tsx`

Keep as enhanced placeholder for now (module not built yet):

- Breadcrumb: Workspaces > Course > Assessment Plan
- Show "Assessment Plan module coming soon" with back link
- No component to wire yet

### 7. `app/workspace/[workspaceId]/course/[courseId]/evaluation/page.tsx`

Keep as enhanced placeholder for now (module not built yet):

- Breadcrumb: Workspaces > Course > Evaluation Plan
- Show "Evaluation Plan module coming soon" with back link
- No component to wire yet

## Shared Pattern for Routes 2-4

Create a reusable hook or utility to avoid duplicating the page-lookup logic. Suggested approach:

Create `lib/hooks/usePageByType.ts`:

```tsx
'use client';
import { useState, useEffect } from 'react';

export function usePageByType(courseId: string, pageType: string) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/courses/${courseId}/overview`);
        if (!res.ok) throw new Error('Failed to load course');
        const data = await res.json();
        const page = data.pages?.find((p: any) => p.type === pageType);
        if (page) {
          setPageId(page.id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [courseId, pageType]);

  return { pageId, isLoading, error, notFound };
}
```

Each route then uses:
```tsx
const { pageId, isLoading, error, notFound } = usePageByType(courseId, 'TASK_ANALYSIS');
```

## NeedsAnalysisView Tab Deep-Link Support

Check if NeedsAnalysisView already has an `initialTab` prop. If not, add it:

1. In `components/pages/NeedsAnalysisView.tsx`:
   - Add to interface: `initialTab?: string;`
   - Add to destructured props: `initialTab`
   - Change state init: `const [activeTab, setActiveTab] = useState(initialTab || 'analysis');`

2. In the analysis route, pass: `<NeedsAnalysisView ... initialTab={initialTab} />`

This enables the Stakeholders dashboard card clicking to `/analysis?tab=stakeholders` to open directly on the Stakeholders sub-tab.

## DO NOT touch

- Any existing view component internals (NeedsAnalysisView, TaskAnalysisView, LearningObjectivesView, StoryboardEditor) — only add `initialTab` prop to NeedsAnalysisView if it doesn't exist
- `app/workspace/[workspaceId]/course/[courseId]/page/[pageId]/page.tsx` — keep working as fallback
- Any API routes
- `schema.prisma`
- `components/course/CourseDashboard.tsx` — don't change the dashboard itself

## Commit

```
git add .
git commit -m "feat: wire view components to dedicated course routes"
git push
```

## Expected Result

- Click "Needs Analysis" card on dashboard → opens the real Analysis view with 3 sub-tabs
- Click "Stakeholders" card → opens Analysis view on the Stakeholders sub-tab
- Click "Learning Objectives" card → opens the real objectives editor
- Click "Task Analysis" card → opens the real task analysis view with reference panel
- Click "Storyboard" card → opens the real TipTap storyboard editor
- Click "Job Aids" / "Assessment" / "Evaluation" → shows "coming soon" placeholder
- All breadcrumbs have working back links to course dashboard
- Old `page/[pageId]` route still works as fallback
