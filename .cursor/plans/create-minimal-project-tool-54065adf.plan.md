<!-- 54065adf-f37d-4e15-97a0-0b3457d5086d 743fd663-ca2b-46d9-b37c-48119735997a -->
# Create Minimal Project Tool Feature

## Overview

Add a minimal Project Tool feature with a Projects list page (`/projects`) and detail page (`/projects/[id]`). This will work alongside the existing workspace-based project system.

## Implementation Steps

### Step 1: Update Prisma Schema

- **File**: `prisma/schema.prisma`
- Add `status String @default("draft")` field to the existing Project model
- Make `workspaceId` optional by changing `workspaceId String` to `workspaceId String?`
- Update the Workspace relation to handle optional workspaceId (may need `onDelete: SetNull`)

### Step 2: Run Migration

- Run `npx prisma migrate dev --name project_tool` to create the migration
- Handle any migration errors by adjusting the schema minimally

### Step 3: Update Prisma Client Helper

- **File**: `lib/prisma.ts`
- Replace the existing implementation with the user's specified code that exports a named `prisma` export
- This will change from default export to named export pattern

### Step 4: Create Projects List Page

- **File**: `app/projects/page.tsx`
- Create a server component that:
- Fetches all projects ordered by createdAt descending
- Includes a server action `createProject` that validates name, creates project, and revalidates path
- Renders a form with Name (required) and Description (optional) fields
- Displays a list of existing projects with name, description, and status

### Step 5: Create Project Detail Page

- **File**: `app/projects/[id]/page.tsx`
- Create a server component that:
- Reads `params.id`
- Fetches project using `prisma.project.findUnique`
- Calls `notFound()` if project doesn't exist
- Renders project name, status, description, and createdAt

### Step 6: Handle Import Updates

- Update any files that import from `lib/prisma` to use named import `{ prisma }` instead of default import if needed
- The new pages will use the named export pattern as specified

## Notes

- The existing Project model will be updated to support both workspace-based projects (with workspaceId) and standalone projects (without workspaceId)
- The new `/projects` route is separate from the existing `/workspace/[workspaceId]/project/[projectId]` routes
- Making `workspaceId` optional may require updating the Workspace relation definition

### To-dos

- [ ] Update Prisma schema: add status field and make workspaceId optional in Project model
- [ ] Run Prisma migration: npx prisma migrate dev --name project_tool
- [ ] Update lib/prisma.ts to use named export pattern as specified
- [ ] Create app/projects/page.tsx with list view and create form
- [ ] Create app/projects/[id]/page.tsx with project detail view
- [ ] Update any broken imports from lib/prisma to use named export