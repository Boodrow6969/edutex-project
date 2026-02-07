# EDUTex Navigation Restructure Specification

**Date:** January 17, 2026  
**Purpose:** Simplify sidebar navigation, make Workspaces the primary organizational concept

---

## Summary of Changes

The word **"Workspace"** becomes what "Project" conceptually meant. Workspaces are now the primary container that users interact with. Each Workspace can contain Courses and Curricula as children.

---

## Current vs. New Navigation

### CURRENT Sidebar Structure

```
Main Section:
├── Dashboard          → /workspace
├── Courses            → /workspace/courses       ← REMOVE
├── Curriculum         → /workspace/curriculum    ← REMOVE
├── Learners           → /learners
├── Analytics          → /analytics               ← REMOVE (move into Workspace submenu)
├── Content Assets     → /content
├── Feedback & QA      → /feedback

Workspaces Section:
├── + New Workspace
└── [Workspace Name]   ← expands to show projects
    └── [Project Name] → /workspace/{wsId}/project/{projId}

Security Section:
├── Audit Logs         → /audit                   ← REMOVE

Settings (bottom)
```

### NEW Sidebar Structure

```
Main Section:
├── Dashboard          → /workspace
├── Workspaces         → (expandable, shows workspace list inline)
│   └── [Each Workspace expands to show]:
│       ├── New Course
│       ├── New Curriculum  
│       ├── Add Learners
│       └── Analytics & Reports
│       ├── [Course 1]
│       ├── [Course 2]
│       └── [Curriculum 1]
├── Content Assets     → /content
└── Feedback & QA      → /feedback

Settings (bottom)
```

---

## Detailed Changes

### 1. Remove from Main Section

| Item | Current Route | Action |
|------|---------------|--------|
| Courses | `/workspace/courses` | REMOVE - Courses exist within Workspaces now |
| Curriculum | `/workspace/curriculum` | REMOVE - Curricula exist within Workspaces now |
| Learners | `/learners` | REMOVE from Main - becomes submenu under each Workspace |
| Analytics | `/analytics` | REMOVE from Main - becomes submenu under each Workspace |

### 2. Remove Security Section Entirely

| Item | Current Route | Action |
|------|---------------|--------|
| Audit Logs | `/audit` | REMOVE entire section |

### 3. Merge Workspaces into Main Nav

**Current behavior:**
- "Workspaces" is a separate collapsible section below Main
- Expanding shows list of workspaces
- Expanding a workspace shows its projects

**New behavior:**
- "Workspaces" moves into Main nav section
- Clicking "Workspaces" expands/collapses the workspace list inline
- Each workspace in the list is expandable
- Expanding a workspace shows a **submenu** with:
  - New Course → creates Course within this Workspace
  - New Curriculum → creates Curriculum within this Workspace
  - Add Learners → `/workspace/{wsId}/learners`
  - Analytics & Reports → `/workspace/{wsId}/analytics`
- Below the submenu, show the workspace's existing Courses and Curricula

### 4. Keep in Main Section

| Item | Route | Notes |
|------|-------|-------|
| Dashboard | `/workspace` | No change |
| Content Assets | `/content` | No change |
| Feedback & QA | `/feedback` | No change |

---

## Visual Mockup

```
┌─────────────────────────┐
│ [E] EduTex              │
│     AI-Powered Design   │
├─────────────────────────┤
│ MAIN                    │
│ ○ Dashboard             │
│ ▼ Workspaces            │  ← Expandable main nav item
│   ┌───────────────────┐ │
│   │▼ Q1 Sales Training│ │  ← Workspace expanded
│   │  + New Course      │ │  ← Submenu action
│   │  + New Curriculum  │ │  ← Submenu action
│   │  ○ Add Learners    │ │  ← Submenu link
│   │  ○ Analytics       │ │  ← Submenu link
│   │  ─────────────────│ │  ← Divider
│   │  📘 Product 101    │ │  ← Course (Project)
│   │  📘 Sales Skills   │ │  ← Course (Project)
│   │  📚 Onboarding Path│ │  ← Curriculum
│   └───────────────────┘ │
│   ┌───────────────────┐ │
│   │► 2026 Leadership  │ │  ← Collapsed workspace
│   └───────────────────┘ │
│   [+ New Workspace]     │
│ ○ Content Assets        │
│ ○ Feedback & QA         │
├─────────────────────────┤
│ ⚙ Settings              │
└─────────────────────────┘
```

---

## Route Structure

### Routes to Keep (rename context in UI)

| Route | Description | UI Label Change |
|-------|-------------|-----------------|
| `/workspace` | Dashboard | No change |
| `/workspace/{wsId}/project/{projId}` | Project detail | Show as "Course" in UI |

### Old Routes to Remove/Redirect

| Route | Action |
|-------|--------|
| `/workspace/courses` | Remove or redirect to Dashboard |
| `/workspace/curriculum` | Remove or redirect to Dashboard |
| `/learners` | Remove (now per-workspace) |
| `/analytics` | Remove (now per-workspace) |
| `/audit` | Remove |

### New Routes to Add

| Route | Purpose |
|-------|---------|
| `/workspace/{wsId}` | Workspace detail page |
| `/workspace/{wsId}/learners` | Learner management for this workspace |
| `/workspace/{wsId}/analytics` | Analytics for this workspace |

---

## Database Model Notes

**No schema changes needed.** The existing models already support this:

- **Workspace** → The container (what the user now interacts with primarily)
- **Project** → Course (keep model name, change UI label)
- **Curriculum** → Collection of courses within a workspace

The `useWorkspacesTree` hook already fetches workspaces with their projects. Need to also fetch curricula.

---

## Implementation Tasks

### Task 1: Update mainNavItems

```tsx
// FROM:
const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/workspace', icon: 'grid' },
  { id: 'courses', label: 'Courses', href: '/workspace/courses', icon: 'book' },
  { id: 'curriculum', label: 'Curriculum', href: '/workspace/curriculum', icon: 'layers' },
  { id: 'learners', label: 'Learners', href: '/learners', icon: 'users' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'chart' },
  { id: 'content', label: 'Content Assets', href: '/content', icon: 'folder' },
  { id: 'feedback', label: 'Feedback & QA', href: '/feedback', icon: 'message' },
];

// TO:
const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/workspace', icon: 'grid' },
  { id: 'content', label: 'Content Assets', href: '/content', icon: 'folder' },
  { id: 'feedback', label: 'Feedback & QA', href: '/feedback', icon: 'message' },
];
```

### Task 2: Remove securityNavItems

Delete the `securityNavItems` array and remove its rendering in the JSX.

### Task 3: Integrate Workspaces into Main Nav

Move the Workspaces section code to render between Dashboard and Content Assets in the main nav, structured as an expandable nav item.

### Task 4: Add Workspace Submenu

When a workspace is expanded, show:
1. Submenu actions: New Course, New Curriculum, Add Learners, Analytics
2. Divider
3. List of courses (from `workspace.projects`)
4. List of curricula (needs to be added to the hook)

### Task 5: Update useWorkspacesTree Hook

Add curricula to the workspace tree data:

```tsx
interface Workspace {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
  curricula: { id: string; name: string }[];  // ADD THIS
}
```

### Task 6: Add Visual Differentiation

- Courses: book icon (📘)
- Curricula: layers/stack icon (📚)
- Submenu items: different styling (smaller, muted, with + prefix for actions)

---

## Enhancement Note: Content Assets Lightbox

> **ENH-XXX: Content Assets Navigation**
> 
> Structure the Content Assets section with a lightbox/modal navigation that has tabs:
> - **All Content** - Shows all assets organized in folders
> - **By Workspace** - Shows content grouped by which Workspace it belongs to
> 
> This allows users to browse all content globally or filter by workspace context.
> 
> *Add to EDUTEX_BUGS_ENHANCEMENTS.md*

---

## Files to Modify

| File | Changes |
|------|---------|
| `components/Sidebar.tsx` | Restructure per above |
| `lib/hooks/useWorkspacesTree.ts` | Add curricula to workspace data |
| `app/api/workspaces/route.ts` | Include curricula in response (if not already) |

---

## Claude Code Prompt (Ready to Use)

```
Restructure the EDUTex sidebar navigation.

## Summary
- Remove from mainNavItems: courses, curriculum, learners, analytics
- Remove securityNavItems array and its rendering entirely
- Move Workspaces section into main nav between Dashboard and Content Assets
- Each workspace, when expanded, shows submenu + content:
  - Submenu: New Course, New Curriculum, Add Learners, Analytics & Reports
  - Content: List of courses (projects) and curricula

## Changes to components/Sidebar.tsx

1. Update mainNavItems to only include: dashboard, content, feedback

2. Delete securityNavItems array

3. Remove the "Security & Compliance" section rendering (lines ~416-426)

4. Move the Workspaces section rendering to be part of main nav:
   - After Dashboard nav item
   - Before Content Assets nav item
   - Keep expandable behavior

5. Update renderWorkspaceTree to show submenu items when expanded:
   - "+ New Course" (triggers create course action)
   - "+ New Curriculum" (triggers create curriculum action)  
   - "Add Learners" → /workspace/{wsId}/learners
   - "Analytics & Reports" → /workspace/{wsId}/analytics
   - Divider line
   - Then list courses (projects) with book icon
   - Then list curricula with layers icon

6. The "+ New Workspace" button stays at bottom of workspace list

## Required hook update (lib/hooks/useWorkspacesTree.ts)
Add curricula to the Workspace interface and fetch them in the API call.

## Visual hierarchy in expanded workspace:
- Submenu items: text-gray-400, text-sm, with + prefix for actions
- Courses: text-gray-300, with book icon
- Curricula: text-gray-300, with layers icon
```

---

*Specification ready for implementation*
