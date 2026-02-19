# Course Dashboard Revamp — Prompt 1: Scaffolding

Create a new feature branch and build the course dashboard with dedicated route structure.

## Setup

```
git checkout main
git pull
git checkout -b feature/course-dashboard-revamp
```

## 1. Create the CourseDashboard component

Create `components/course/CourseDashboard.tsx`

This replaces CourseOverview as the course landing page. It has two sections:

### Header Banner

- Course name (h1, prominent)
- Breadcrumb: Workspace name > Course name
- Training type badge (pulled from stakeholder submission data if available, or from course metadata)
- Created date, Deadline date (with days remaining, color-coded: red if ≤14d, amber if ≤30d, else gray)
- Curriculum info: if linked, show curriculum name as clickable link. If not, show "Standalone Course"
- "Next Tasks" strip at bottom of banner showing next 4 tasks with: checkbox (non-functional for now), task title, priority pill (high/medium/low), days until due. "View All →" link. Use dummy task data for now — hardcoded array in the component.

### Analysis Section (2-column grid)

- **Needs Analysis card:** training type, submission count, approval status badge (Approved/Pending Review/Revision Requested). Clicks to `/workspace/${workspaceId}/course/${courseId}/analysis`
- **Stakeholders card:** shows name, role, contact for each stakeholder. Clicks to `/workspace/${workspaceId}/course/${courseId}/analysis?tab=stakeholders`

### Design Section (3-column grid)

- **Learning Objectives card:** count + Bloom's level pills. Clicks to `/workspace/${workspaceId}/course/${courseId}/objectives`
- **Task Analysis card:** task count + intervention type pills (Training/Job Aid/Process Change). Clicks to `/workspace/${workspaceId}/course/${courseId}/task-analysis`
- **Storyboard card:** screen count, module count (or "No screens created yet"). Clicks to `/workspace/${workspaceId}/course/${courseId}/storyboard`
- **Job Aids card:** count or "No job aids created yet". Clicks to `/workspace/${workspaceId}/course/${courseId}/job-aids`
- **Assessment Plan card:** count or "No assessments planned yet". Clicks to `/workspace/${workspaceId}/course/${courseId}/assessment`
- **Evaluation Plan card:** count or "No evaluation metrics defined yet". Clicks to `/workspace/${workspaceId}/course/${courseId}/evaluation`

### Every card has

- Icon (use simple SVG icons, similar to Lucide style)
- Title
- Status badge: "Not Started" (gray), "In Progress" (amber), "Complete" (green)
- Gear icon that opens a dropdown to manually override status
- "View Details →" footer link
- Hover: border goes blue, subtle shadow lift

### Status auto-calculation logic

- Cards with no data = "Not Started"
- Cards with some data = "In Progress"
- "Complete" is only set via manual gear override (for now)

### Data fetching

The component takes `courseId` and `workspaceId` as props. It should call:

- `GET /api/courses/${courseId}/overview` for course metadata, pages, objectives, tasks (already exists)
- `GET /api/stakeholder/submissions?workspaceId=${workspaceId}` for stakeholder/NA status
- Map existing page records by type to determine which cards have data

### Styling

- Use Tailwind classes consistent with existing app
- Font: Source Sans 3 (already configured in layout)
- Cards: white bg, rounded-xl, border-gray-200, hover:border-blue-300
- Section headers: "Analysis" and "Design" with subtle subtitle text
- Grid: responsive — 1 col mobile, 2 col medium, 3 col large (Design section)

## 2. Create dedicated route folders

Create these new route files (placeholder pages that just show the page name — we'll wire real components in Prompt 2):

```
app/workspace/[workspaceId]/course/[courseId]/analysis/page.tsx
app/workspace/[workspaceId]/course/[courseId]/objectives/page.tsx
app/workspace/[workspaceId]/course/[courseId]/task-analysis/page.tsx
app/workspace/[workspaceId]/course/[courseId]/storyboard/page.tsx
app/workspace/[workspaceId]/course/[courseId]/job-aids/page.tsx
app/workspace/[workspaceId]/course/[courseId]/assessment/page.tsx
app/workspace/[workspaceId]/course/[courseId]/evaluation/page.tsx
```

Each placeholder should:

- Be a `'use client'` component
- Extract `workspaceId` and `courseId` from `useParams()`
- Show a breadcrumb: Workspace > Course > [Page Name] with link back to course dashboard
- Show a centered heading like "Needs Analysis" or "Storyboard"
- Show a "← Back to Course Dashboard" link

## 3. Update the course landing page

Replace the content of `app/workspace/[workspaceId]/course/[courseId]/page.tsx`:

- Remove the old CourseOverview + CreatePage modal
- Import and render the new CourseDashboard component instead
- Pass `courseId` and `workspaceId` as props

## 4. DO NOT touch these files

- `components/pages/NeedsAnalysisView.tsx`
- `components/pages/TaskAnalysisView.tsx`
- `components/pages/LearningObjectivesView.tsx`
- `components/pages/StoryboardView.tsx`
- `components/tiptap/StoryboardEditor.tsx`
- `components/course/CourseOverview.tsx` (keep it, just stop importing it in the course page)
- `components/course/PagesList.tsx` (keep it)
- `app/workspace/[workspaceId]/course/[courseId]/page/[pageId]/page.tsx` (keep the old router working as fallback)
- Any API routes
- `schema.prisma`

## 5. Commit

```
git add .
git commit -m "feat: course dashboard revamp - scaffolding and route structure"
git push -u origin feature/course-dashboard-revamp
```

## Expected result

- Navigate to a course → see the new dashboard with banner + Analysis/Design card grids
- Click any card → navigates to placeholder page with breadcrumb back
- Old `page/[pageId]` route still works if accessed directly
- All existing functionality untouched
