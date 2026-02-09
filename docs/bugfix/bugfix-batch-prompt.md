# EDUTex Bug Fix Batch: BUG-013, BUG-005, BUG-001, BUG-006

Fix four bugs in one pass. These are independent fixes that don't conflict.

---

## BUG-013: Course created from Dashboard doesn't appear in sidebar (HIGH)

**Problem:** Creating a course via the "+Add Course" button on the Workspace Dashboard (`app/workspace/[workspaceId]/workspace-detail-page.tsx` or similar) successfully creates the course, but the sidebar workspace tree does not update. Creating via the sidebar "+ New Course" works fine because it triggers a refetch.

**Fix:** After the dashboard's course creation API call succeeds, trigger the sidebar's data refresh. The sidebar data comes from the `useWorkspacesTree` hook. Options:

1. **Best approach:** Use SWR's `mutate` to invalidate the workspaces endpoint key globally. The sidebar already uses SWR (or a similar fetching hook) — find the cache key used by `useWorkspacesTree` (likely `/api/workspaces` or similar) and call `mutate(key)` after course creation succeeds on the dashboard.

2. **Alternative:** If the dashboard component doesn't have access to SWR's global mutate, import it: `import { mutate } from 'swr'` and call `mutate('/api/workspaces')` (match the exact key used in `useWorkspacesTree`).

Search for how the sidebar "+ New Course" triggers its refresh after creation — use the same mechanism in the dashboard's creation handler.

---

## BUG-005: Workspace sidebar toggle doesn't collapse on second click

**Problem:** Clicking a workspace in the sidebar expands it, but clicking the same workspace again does NOT collapse it. The only way to collapse is to click a different workspace.

**Location:** `components/Sidebar.tsx` — the workspace click handler, and/or `lib/hooks/useWorkspacesTree.ts` if it manages expanded state.

**Fix:** Find the click handler for workspace items in the sidebar. It currently sets the expanded workspace ID but doesn't toggle. Change the logic:

```typescript
// BEFORE (likely)
setExpandedWorkspace(workspace.id);

// AFTER
setExpandedWorkspace(prev => prev === workspace.id ? null : workspace.id);
```

This may also involve the `useWorkspacesTree` hook if it manages `expandedWorkspaceId` state. Check both files. The workspace click also navigates — make sure collapsing still works alongside navigation (the workspace detail page should still load, but the sidebar tree should collapse).

---

## BUG-001: Flash when creating new course via modal

**Problem:** `CreateCourseModal` (or similar) calls `onClose()` before `router.push()` completes, causing a brief flash of the underlying page.

**Location:** The course creation modal component — likely `components/modals/CreateCourseModal.tsx` or wherever the "Create Course" modal lives.

**Fix:** Remove the `onClose()` call before `router.push()`. The page navigation will unmount the modal automatically, so explicitly closing it first is unnecessary and causes the flash. Find the submit/create handler and remove or reorder:

```typescript
// BEFORE
onClose();           // ← closes modal, underlying page briefly visible
router.push(`/workspace/${workspaceId}/course/${newCourse.id}`);

// AFTER
router.push(`/workspace/${workspaceId}/course/${newCourse.id}`);
// No onClose() needed — navigation unmounts the modal
```

If `onClose()` also does cleanup (resetting form state, etc.), that's fine to remove too since the component unmounts.

---

## BUG-006: Blockquote styling missing italics

**Problem:** Blockquotes in the storyboard editor lost their italic styling after a previous fix.

**Location:** `components/tiptap/StoryboardEditor.tsx` or wherever blockquote CSS styles are defined (could be in `app/globals.css` or a Tailwind class on the editor).

**Fix:** Find the blockquote styles (look for `blockquote` in CSS or the editor's prose classes). Add `font-style: italic`. Examples of where this might be:

- In a `.ProseMirror blockquote` CSS rule
- In Tailwind prose classes like `prose-blockquote:italic`
- In the editor's `editorProps.attributes` or `className`

The blockquote should already have a gray background and left border. Just add the italic.

---

## Verification

After all four fixes:
1. `npm run build` — no type errors
2. Create a course from the workspace dashboard "+Add Course" → course appears in sidebar immediately
3. Click a workspace in sidebar to expand → click same workspace again → it collapses
4. Open "Create Course" modal → create a course → no flash, smooth navigation
5. In storyboard editor, add a blockquote → text is italicized

Commit as: `fix: BUG-013 sidebar refresh, BUG-005 toggle collapse, BUG-001 modal flash, BUG-006 blockquote italic`
