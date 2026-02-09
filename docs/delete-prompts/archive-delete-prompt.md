# EDUTex: Archive & Delete Implementation

Branch: `feature/archive-delete`

The Prisma schema already has `archivedAt DateTime?` on Workspace, Curriculum, and Course models, and the migration `add_archive_support` has been applied. Now implement the full archive/restore and delete functionality.

## PHASE 1: Archive & Restore

### 1A. Update ALL List Queries — Add Archive Filter

Every `findMany`, `findFirst`, and `count` query on Workspace, Curriculum, and Course must filter out archived records by default. Search the entire codebase for these Prisma calls and add `archivedAt: null` to the `where` clause.

Common locations to check:
- `lib/workspaces/` — workspace queries
- `lib/courses/` — course queries  
- `lib/curricula/` or `lib/curriculum/` — curriculum queries
- `app/api/workspaces/` — workspace API routes
- `app/api/courses/` — course API routes
- `app/api/curricula/` or `app/api/curriculum/` — curriculum API routes
- Sidebar data fetching (likely in a hook like `useWorkspacesTree` or similar)
- Dashboard queries
- Any page that lists workspaces, courses, or curricula

**Pattern:**
```typescript
// BEFORE
prisma.workspace.findMany({ where: { userId } })

// AFTER
prisma.workspace.findMany({ where: { userId, archivedAt: null } })
```

Do NOT add the filter to:
- Single-record lookups by ID (e.g., `findUnique({ where: { id } })`) — archived items should still be accessible by direct URL
- The "Show archived" query (built in 1C below)

### 1B. Archive/Restore API Endpoints

Create PATCH endpoints for archive and restore operations.

**Archive endpoint pattern** (apply to Workspace, Curriculum, and Course):

```
PATCH /api/workspaces/[workspaceId]/archive
Body: { action: "archive" | "restore" }
```

```
PATCH /api/courses/[courseId]/archive
Body: { action: "archive" | "restore" }
```

```
PATCH /api/curricula/[curriculumId]/archive
Body: { action: "archive" | "restore" }
```

Each endpoint should:
1. Verify the user has access (existing auth pattern)
2. Set `archivedAt: new Date()` for archive, or `archivedAt: null` for restore
3. Return the updated record
4. For Workspace archive: do NOT cascade to children — courses and curricula remain in their current state, they're just inaccessible because the parent workspace is archived

**Permission rules:**
- Workspace archive/restore: any workspace member (ADMINISTRATOR, MANAGER, or DESIGNER)
- Curriculum archive/restore: ADMINISTRATOR or MANAGER
- Course archive/restore: ADMINISTRATOR or MANAGER

### 1C. Sidebar UI — Context Menu Archive Option

Add "Archive" to the context menu (right-click or three-dot menu) for each entity in the sidebar:

**For Workspace items in sidebar:**
- Add "Archive Workspace" option to existing context menu (or create one if none exists)
- On click: call the archive API, then show an undo toast
- On successful archive: remove the workspace from the sidebar list with a brief fade-out

**For Course items in sidebar (under a workspace):**
- Add "Archive Course" to context menu
- On click: call archive API, show undo toast
- On successful archive: remove from the workspace's course list

**For Curriculum items in sidebar (under a workspace):**
- Add "Archive Curriculum" to context menu
- On click: call archive API, show undo toast
- On successful archive: remove from the workspace's curriculum list

### 1D. Undo Toast

When an item is archived, show a toast notification:

```
"[Item Name]" archived.  [Undo]
```

- Toast should auto-dismiss after 8 seconds
- "Undo" button calls the restore API endpoint
- On successful undo: item reappears in the sidebar
- Use the existing toast/notification system if one exists, otherwise create a simple one

### 1E. "Show Archived" Toggle

Add a toggle to the sidebar or relevant list views:

**Sidebar:**
- Add a small toggle or link at the bottom of the workspace list: "Show archived" / "Hide archived"
- When toggled ON: fetch workspaces/courses/curricula INCLUDING archived ones
- Archived items display with visual distinction:
  - Muted/dimmed text (opacity-50 or text-gray-400)
  - Small "Archived" badge or icon
- Archived items' context menu shows "Restore" instead of "Archive"
- Clicking an archived item still navigates to it (read-only access)

**Implementation for the toggle:**
- Store toggle state in React state (not persisted — defaults to OFF)
- When ON, the sidebar fetch query should NOT include `archivedAt: null` filter
- Add an `includeArchived` query parameter to the sidebar's data fetching endpoint

---

## PHASE 2: Permanent Delete

### 2A. Delete API Endpoints

**Workspace Delete:**
```
DELETE /api/workspaces/[workspaceId]
Body: { confirmName: string }
```
- ADMINISTRATOR only
- Requires `confirmName` to exactly match the workspace name (case-sensitive)
- Cascades: delete all curricula, courses, pages, blocks, CurriculumCourse join records, StakeholderAccessTokens, StakeholderSubmissions, and WorkspaceMembers belonging to this workspace
- Use a Prisma transaction to ensure atomicity
- Delete order (to respect foreign keys):
  1. Blocks (via pages)
  2. Pages
  3. CurriculumCourse join records
  4. Curricula
  5. Courses
  6. StakeholderSubmissions
  7. StakeholderAccessTokens
  8. WorkspaceMembers
  9. Workspace

**Curriculum Delete:**
```
DELETE /api/curricula/[curriculumId]
```
- ADMINISTRATOR or MANAGER
- Deletes: curriculum record, its program-level pages + blocks, CurriculumCourse join records
- Does NOT delete courses — they survive as standalone courses
- Confirmation modal with: "This will permanently delete the curriculum '[name]' and its [X] program pages. Courses linked to this curriculum will not be deleted."

**Course Delete:**
```
DELETE /api/courses/[courseId]
```
- ADMINISTRATOR or MANAGER
- Deletes: course record, all pages, all blocks, CurriculumCourse join records
- Confirmation modal with: "This will permanently delete the course '[name]', [X] pages, and [Y] content blocks. This cannot be undone."

**Page Delete:**
```
DELETE /api/courses/[courseId]/pages/[pageId]
```
(or equivalent existing route pattern)
- ADMINISTRATOR or MANAGER
- Deletes: page and all its blocks
- Confirmation modal with: "Delete page '[title]'? This will remove [X] content blocks."

### 2B. Delete UI — Context Menu & Confirmation Modals

Add "Delete" option to the same context menus where "Archive" was added. Style it in red text to signal danger.

**Workspace Delete Modal:**
```
┌──────────────────────────────────────────────┐
│  Delete Workspace                             │
│                                               │
│  This will permanently delete:                │
│  • Workspace "Q1 Sales Training"              │
│  • X courses                                  │
│  • X curricula                                │
│  • X pages and all content blocks             │
│  • All stakeholder submissions                │
│                                               │
│  This action cannot be undone.                │
│                                               │
│  Type the workspace name to confirm:          │
│  ┌────────────────────────────────────┐       │
│  │                                    │       │
│  └────────────────────────────────────┘       │
│                                               │
│              [Cancel]  [Delete Workspace]      │
│                         (red, disabled until   │
│                          name matches)         │
└──────────────────────────────────────────────┘
```

**Curriculum Delete Modal:**
```
┌──────────────────────────────────────────────┐
│  Delete Curriculum                            │
│                                               │
│  This will permanently delete the curriculum  │
│  "[name]" and its X program pages.            │
│                                               │
│  Courses linked to this curriculum will NOT   │
│  be deleted.                                  │
│                                               │
│  This action cannot be undone.                │
│                                               │
│              [Cancel]  [Delete Curriculum]     │
│                         (red)                  │
└──────────────────────────────────────────────┘
```

**Course Delete Modal:**
```
┌──────────────────────────────────────────────┐
│  Delete Course                                │
│                                               │
│  This will permanently delete the course      │
│  "[name]", including:                         │
│  • X pages                                    │
│  • Y content blocks                           │
│                                               │
│  This action cannot be undone.                │
│                                               │
│              [Cancel]  [Delete Course]         │
│                         (red)                  │
└──────────────────────────────────────────────┘
```

**Page Delete Modal:**
```
┌──────────────────────────────────────────────┐
│  Delete Page                                  │
│                                               │
│  Delete "[page title]"?                       │
│  This will remove X content blocks.           │
│                                               │
│              [Cancel]  [Delete Page]           │
│                         (red)                  │
└──────────────────────────────────────────────┘
```

### 2C. Fetch Counts for Confirmation Modals

The delete modals need child counts. Add count endpoints or include counts in existing fetch responses:

For workspace delete modal, fetch:
```typescript
const counts = await prisma.$transaction([
  prisma.course.count({ where: { workspaceId } }),
  prisma.curriculum.count({ where: { workspaceId } }),
  prisma.page.count({ where: { OR: [
    { course: { workspaceId } },
    { curriculum: { workspaceId } }
  ]}}),
]);
```

For course delete modal, the page and block counts:
```typescript
const counts = await prisma.$transaction([
  prisma.page.count({ where: { courseId } }),
  prisma.block.count({ where: { page: { courseId } } }),
]);
```

For page delete modal, the block count:
```typescript
const blockCount = await prisma.block.count({ where: { pageId } });
```

These can be fetched when the user clicks "Delete" from the context menu, before showing the modal.

---

## Styling Notes

- Match the existing EDUTex dark navy sidebar theme (bg-[#1E293B])
- Context menu items: normal text for Archive/Restore, red text (text-red-500) for Delete
- Archived items in sidebar: reduced opacity or text-gray-500 with an Archive icon (BoxIcon or ArchiveIcon from lucide-react)
- Delete confirmation buttons: bg-red-600 hover:bg-red-700 text-white
- Toast: use existing toast pattern or a fixed-position bottom-right toast with white bg, shadow, and action button

## Implementation Order

1. Phase 1A first — update all queries (this prevents archived items from appearing before the UI is ready)
2. Phase 1B — archive/restore API endpoints
3. Phase 1C + 1D — sidebar context menu + undo toast
4. Phase 1E — show archived toggle
5. Phase 2A — delete API endpoints
6. Phase 2B + 2C — delete UI with confirmation modals

Commit after Phase 1 is complete, then commit again after Phase 2.
