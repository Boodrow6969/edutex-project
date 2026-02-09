# Content Assets — Phase A Implementation Prompts

Two prompts for Cursor, run in sequence. Prompt 1 builds the backend (Prisma model, storage service, API routes). Prompt 2 builds the frontend (SlideOver wrapper, AssetUploadZone, WorkspaceAssetBrowser, AssetAttachment). Test the backend with curl before running Prompt 2.

---

## Pre-flight

Before running either prompt:

```powershell
git checkout main
git pull
git checkout -b feature/content-assets
```

---

## Prompt 1: Backend — Data Layer + API Routes

Paste this into Cursor:

```text
You are working in a Next.js 15 TypeScript app called EDUTex with Prisma ORM and PostgreSQL. The app has workspace-based projects with authentication via NextAuth v5.

IMPORTANT: Work on the current branch: feature/content-assets

Do not modify any existing models, components, or API routes unless explicitly told to. This feature adds new files only, plus one Prisma schema addition.

Goal
Build the Content Assets backend: a workspace-scoped file storage system with CRUD API routes.

Assumptions
1) prisma/schema.prisma has a Workspace model with id, name, etc.
2) Authentication uses auth() from @/auth returning session with user.id
3) API routes check WorkspaceMember for workspace access (see existing routes in app/api/workspaces/ for the pattern)
4) The named Prisma export is: import { prisma } from "@/lib/prisma"

If any assumption is wrong when you inspect the code, adjust minimally and note it before continuing.

Work step by step. For each step, tell me which file you are creating or editing, and show the full contents.

---

Step 1: Add ContentAsset model to Prisma schema

File: prisma/schema.prisma

Add this model (do NOT modify any existing models):

model ContentAsset {
  id             String   @id @default(cuid())
  workspaceId    String
  uploadedById   String
  filename       String
  storageKey     String
  mimeType       String
  fileSizeBytes  Int
  alt            String?
  tags           String[] @default([])
  sourceContext  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  uploadedBy     User      @relation("UserAssets", fields: [uploadedById], references: [id])

  @@index([workspaceId])
  @@index([workspaceId, mimeType])
}

You will also need to add the reverse relation to the Workspace model:

  contentAssets  ContentAsset[]

And to the User model:

  contentAssets  ContentAsset[] @relation("UserAssets")

Run the migration:

npx prisma migrate dev --name add_content_asset

Then run:

npx prisma generate

If the migration fails, read the error, adjust minimally, and try again. Do not drop tables.

---

Step 2: Create the storage service

File: lib/storage/storage-service.ts

Create a storage service interface and local filesystem implementation. The service abstracts where files are stored so we can swap to S3 later without touching API routes.

Requirements:
- Define an interface StorageService with methods:
  - store(file: Buffer, filename: string, mimeType: string): Promise<{ storageKey: string }>
  - getFilePath(storageKey: string): string
  - delete(storageKey: string): Promise<void>
- Implement LocalStorageService that:
  - Stores files under a configurable base directory (default: process.cwd() + '/uploads')
  - Organizes files into subdirectories by year/month (e.g., uploads/2026/02/cuid-filename.png)
  - Generates a unique storageKey using cuid or uuid prefix + original filename (sanitized)
  - Creates directories recursively if they don't exist
  - Returns the relative storageKey (e.g., "2026/02/clxyz-screenshot.png")
- Export a singleton instance: export const storage = new LocalStorageService()

Also create: lib/storage/index.ts
Re-export: export { storage } from './storage-service'

---

Step 3: Create the asset upload API route

File: app/api/workspaces/[workspaceId]/assets/route.ts

This route handles POST (upload) and GET (list assets).

POST handler:
1. Authenticate with auth() — return 401 if no session
2. Verify WorkspaceMember access — return 403 if not a member
3. Parse the request as FormData (use request.formData())
4. Extract the file from the form data (field name: "file")
5. Extract optional metadata fields from form data: alt, tags (comma-separated string), sourceContext
6. Validate: file must exist, must be an image type (image/png, image/jpeg, image/gif, image/webp, image/svg+xml), max size 10MB
7. Convert the file to a Buffer
8. Call storage.store(buffer, file.name, file.type)
9. Create ContentAsset record in Prisma with all fields
10. Return the created record as JSON with status 201

GET handler:
1. Authenticate and verify workspace membership (same pattern)
2. Accept optional query params: tag (filter by tag), mimeType (filter by mime type), search (search filename or sourceContext)
3. Build Prisma where clause from filters
4. Return assets ordered by createdAt desc
5. For each asset, include a url field computed as: /api/assets/${asset.id}/file

Error handling: wrap in try/catch, return appropriate status codes with JSON error messages.

---

Step 4: Create the single asset API routes

File: app/api/workspaces/[workspaceId]/assets/[assetId]/route.ts

GET handler:
1. Auth + workspace member check
2. Find asset by id AND workspaceId (ensure asset belongs to this workspace)
3. Return asset metadata as JSON, including computed url field
4. Return 404 if not found

PUT handler:
1. Auth + workspace member check
2. Parse JSON body
3. Allow updating only: alt, tags, sourceContext
4. Update the asset record
5. Return updated record

DELETE handler:
1. Auth + workspace member check
2. Find the asset
3. Delete the file from storage using storage.delete(asset.storageKey)
4. Delete the Prisma record
5. Return 204

---

Step 5: Create the file serving route

File: app/api/assets/[assetId]/file/route.ts

This route is intentionally NOT nested under workspaces — it serves files by asset ID directly so URLs are simple and can be used in img src attributes.

GET handler:
1. Authenticate (must be logged in)
2. Find the ContentAsset by id
3. Verify the user is a member of the asset's workspace
4. Read the file from storage using storage.getFilePath(asset.storageKey)
5. Return the file as a Response with correct Content-Type header and Cache-Control: private, max-age=3600
6. Return 404 if asset or file not found

Use Node.js fs to read the file and return it as a stream or buffer.

---

Step 6: Add .gitignore entry

Append to the project .gitignore (do not replace existing content):

# Uploaded assets (local storage)
/uploads/

---

Step 7: Manual test checklist

After all steps, describe how to manually test using curl or similar:

1. Upload an image:
   curl -X POST http://localhost:3000/api/workspaces/{wid}/assets \
     -H "Cookie: {session_cookie}" \
     -F "file=@/path/to/screenshot.png" \
     -F "tags=queue-management,salesforce" \
     -F "sourceContext=Salesforce > Case Management > Queue View" \
     -F "alt=Queue management screen showing open cases"

2. List assets:
   curl http://localhost:3000/api/workspaces/{wid}/assets \
     -H "Cookie: {session_cookie}"

3. List with tag filter:
   curl "http://localhost:3000/api/workspaces/{wid}/assets?tag=salesforce" \
     -H "Cookie: {session_cookie}"

4. View file in browser:
   Navigate to http://localhost:3000/api/assets/{assetId}/file

5. Update metadata:
   curl -X PUT http://localhost:3000/api/workspaces/{wid}/assets/{id} \
     -H "Content-Type: application/json" \
     -H "Cookie: {session_cookie}" \
     -d '{"alt": "Updated description", "tags": ["new-tag"]}'

6. Delete:
   curl -X DELETE http://localhost:3000/api/workspaces/{wid}/assets/{id} \
     -H "Cookie: {session_cookie}"

At the end of your message:
1. List all files created or modified
2. Note any assumptions you made about existing code
3. Confirm the migration ran successfully
```

---

## After Prompt 1: Verify

Before running Prompt 2, manually verify:

1. `npx prisma studio` — confirm ContentAsset table exists
2. `npm run build` — no type errors
3. Upload a test image via curl or Postman
4. Confirm the file appears in the /uploads directory
5. Confirm the asset record appears in Prisma Studio
6. Load the file in a browser via /api/assets/{id}/file

Once verified, commit:

```powershell
git add .
git commit -m "feat: Content Assets backend — Prisma model, storage service, CRUD API routes

- ContentAsset model (workspace-scoped) with tags, alt, sourceContext
- Local filesystem storage service with S3-ready interface
- Upload, list, get, update, delete API routes
- File serving endpoint with auth and cache headers"
```

---

## Prompt 2: Frontend — Shared UI Components

Paste this into Cursor:

```text
You are working in a Next.js 15 TypeScript app called EDUTex with React 19, Tailwind CSS, and a workspace-based architecture. The app already has Content Assets API routes from a previous step.

IMPORTANT: Work on the current branch: feature/content-assets

Do not modify any existing components unless explicitly told to. This step adds new shared UI components only.

Goal
Build four reusable UI components for Content Assets: a generic SlideOver panel, an upload zone, a workspace asset browser, and an inline asset attachment control.

Assumptions
1) Content Assets API is live at:
   - POST /api/workspaces/[workspaceId]/assets (upload, multipart)
   - GET /api/workspaces/[workspaceId]/assets (list, ?tag=&search=)
   - GET /api/workspaces/[workspaceId]/assets/[id] (single asset)
   - PUT /api/workspaces/[workspaceId]/assets/[id] (update metadata)
   - DELETE /api/workspaces/[workspaceId]/assets/[id] (remove)
   - GET /api/assets/[id]/file (serve file)
2) Each asset in the list response includes a computed url field: /api/assets/{id}/file
3) Tailwind CSS is configured and working
4) The app uses standard React patterns — hooks, functional components, no class components
5) There is no existing modal or slide-over component in the codebase

If any assumption is wrong when you inspect the code, adjust minimally and note it.

Work step by step. Show full file contents for every new file.

---

Step 1: Create SlideOver component

File: components/ui/SlideOver.tsx

A generic slide-over panel that animates in from the right edge of the screen.

Props:
- isOpen: boolean
- onClose: () => void
- title: string
- width?: string (default: "max-w-md", allow "max-w-lg", "max-w-xl")
- children: React.ReactNode

Behavior:
- When isOpen is true, render a fixed overlay (semi-transparent dark backdrop) covering the full viewport
- The panel slides in from the right edge with a CSS transition (transform translateX)
- Panel has a white background, full viewport height, scrollable content area
- Header row with title (left) and close button (right, X icon using a simple SVG or unicode ×)
- Clicking the backdrop calls onClose
- Pressing Escape calls onClose (add a useEffect with keydown listener)
- Body scroll should be locked when the slide-over is open (add overflow-hidden to document.body)
- Use Tailwind only for styling, no external animation libraries
- Use React portal (createPortal) to render at document.body level so it overlays everything

Keep it simple — no framer-motion, no headless UI. Just Tailwind transitions and a portal.

---

Step 2: Create AssetUploadZone component

File: components/assets/AssetUploadZone.tsx

A drag-and-drop upload area that POSTs to the Content Assets API.

Props:
- workspaceId: string
- onUploadComplete: (asset: ContentAssetResponse) => void
- onError?: (error: string) => void
- className?: string

Define a TypeScript type at the top of the file:

interface ContentAssetResponse {
  id: string;
  workspaceId: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  alt: string | null;
  tags: string[];
  sourceContext: string | null;
  url: string;
  createdAt: string;
}

Export this type so other components can import it.

Behavior:
- Render a dashed-border drop zone area with text "Drop image here or click to browse"
- Support drag-and-drop (onDragOver, onDragEnter, onDragLeave, onDrop)
- Highlight the border (change to blue/active color) when a file is being dragged over
- Also support clicking to open a file picker (hidden input type="file" with accept="image/*")
- On file selection (drop or pick):
  1. Validate: must be image type, max 10MB. If invalid, call onError with message.
  2. Show upload progress state: change text to "Uploading {filename}..." with a simple spinner or pulsing animation
  3. Create FormData with the file
  4. POST to /api/workspaces/${workspaceId}/assets
  5. On success: call onUploadComplete with the response JSON
  6. On failure: call onError with the error message
  7. Reset to initial state
- Single file only (not multi-file)
- Use Tailwind for all styling

---

Step 3: Create WorkspaceAssetBrowser component

File: components/assets/WorkspaceAssetBrowser.tsx

The content panel that goes inside the SlideOver. Shows a searchable, filterable grid of workspace assets.

Props:
- workspaceId: string
- onSelect: (asset: ContentAssetResponse) => void
- onClose: () => void
- selectedAssetId?: string | null (to highlight currently attached asset)

Behavior:

HEADER AREA (inside the slide-over, below the SlideOver title):
- Search input: text field that filters by filename/sourceContext (debounced 300ms)
- Below search: row of tag filter chips. Fetch distinct tags from the asset list and render as clickable chips. Active chip is highlighted. Clicking toggles the filter.

UPLOAD AREA:
- Render AssetUploadZone at the top (collapsible — show a "Upload new" toggle button that reveals/hides the upload zone)
- When upload completes, add the new asset to the beginning of the displayed list

ASSET GRID:
- Fetch assets from GET /api/workspaces/${workspaceId}/assets on mount (and when filters change)
- Display as a responsive grid of thumbnail cards (2 columns in the slide-over width)
- Each card shows:
  - Thumbnail image (img src = asset.url, object-cover, fixed aspect ratio like 4:3)
  - Filename (truncated if long)
  - Tags as small pills below the filename
  - Subtle border highlight if this asset's id matches selectedAssetId
- Clicking a card calls onSelect(asset) — the parent will handle closing the slide-over
- Loading state: show skeleton placeholders while fetching
- Empty state: show a message "No assets yet. Upload your first image above."
- Error state: show error message with retry button

Use React state for the asset list, loading, error, search term, and active tag filter. Use useEffect to fetch when workspaceId, search, or tag filter changes.

---

Step 4: Create AssetAttachment component

File: components/assets/AssetAttachment.tsx

The inline control that lives next to a form field. Shows either an "Attach image" button or a thumbnail preview.

Props:
- workspaceId: string
- assetId: string | null
- onAttach: (assetId: string) => void
- onRemove: () => void
- label?: string (default: "Reference image")

Behavior:

EMPTY STATE (assetId is null):
- Render a small, subtle button: an image icon (simple SVG) + the label text
- Muted color (gray-400 text, gray-200 border)
- Clicking opens the SlideOver with WorkspaceAssetBrowser inside
- When user selects an asset in the browser, call onAttach(asset.id) and close the slide-over

ATTACHED STATE (assetId is not null):
- Fetch asset metadata from GET /api/workspaces/${workspaceId}/assets/${assetId} on mount (or when assetId changes)
- Render a compact preview row:
  - Small thumbnail (48x48px, rounded, object-cover) showing the image via its url
  - Filename text next to the thumbnail (truncated, small text)
  - A small "×" remove button at the right end
- Clicking the "×" calls onRemove()
- Clicking anywhere else on the row (not the ×) opens the slide-over to change the selection
- If the asset fetch fails (deleted asset), show a "Missing asset" placeholder and the remove button

SLIDE-OVER INTEGRATION:
- Use useState to track isOpen for the slide-over
- Render SlideOver with title "Select Asset" and width "max-w-md"
- Pass WorkspaceAssetBrowser as child with onSelect that calls onAttach and sets isOpen false
- Pass selectedAssetId to WorkspaceAssetBrowser to highlight the currently attached asset

The component manages its own slide-over state internally. The parent only needs to provide the four required props.

---

Step 5: Create barrel export

File: components/assets/index.ts

Export all asset components:
export { AssetUploadZone } from './AssetUploadZone'
export { WorkspaceAssetBrowser } from './WorkspaceAssetBrowser'
export { AssetAttachment } from './AssetAttachment'
export type { ContentAssetResponse } from './AssetUploadZone'

Also:
File: components/ui/index.ts (create if it doesn't exist, or append)

Export: export { SlideOver } from './SlideOver'

---

Step 6: Manual test plan

Describe how to test each component. Since these are React components, testing means:

1. Create a temporary test page at app/test-assets/page.tsx that:
   - Requires authentication (redirect if not logged in)
   - Accepts a hardcoded workspaceId (or gets it from a query param)
   - Renders AssetUploadZone to test upload
   - Renders a button "Open Asset Browser" that opens the SlideOver with WorkspaceAssetBrowser
   - Renders AssetAttachment to test the full attach/remove flow
   - Shows the currently selected assetId in text so you can verify state changes

2. Test flow:
   a. Navigate to /test-assets?workspaceId={your_workspace_id}
   b. Upload an image via the upload zone — verify it appears
   c. Open the asset browser — verify the uploaded image appears in the grid
   d. Click the asset — verify onSelect fires
   e. Use AssetAttachment to attach the asset — verify thumbnail appears
   f. Click "×" to remove — verify it returns to empty state
   g. Upload a second image, verify both appear in the browser
   h. Test drag-and-drop upload
   i. Test search filtering
   j. Test the Escape key closes the slide-over
   k. Test clicking the backdrop closes the slide-over

At the end of your message:
1. List all files created
2. Note any assumptions about existing code
3. Call out anything that may need adjustment based on the actual codebase
```

---

## After Prompt 2: Verify

1. `npm run build` — no type errors
2. Navigate to the test page and run through the manual test flow
3. Verify the slide-over animation is smooth
4. Verify upload, browse, attach, and remove all work end-to-end

Once verified, commit:

```powershell
git add .
git commit -m "feat: Content Assets UI — SlideOver, AssetUploadZone, AssetBrowser, AssetAttachment

- Generic SlideOver panel component with portal, backdrop, escape key
- Drag-and-drop AssetUploadZone with validation and progress state
- WorkspaceAssetBrowser with search, tag filtering, thumbnail grid
- AssetAttachment inline control for field-level image attachment
- Test page at /test-assets for manual verification"
```

Then delete the test page before merging:

```powershell
# Remove the test page before merging to main
Remove-Item -Recurse app/test-assets
git add .
git commit -m "chore: remove test-assets page"
```

---

## What Phase A delivers

After both prompts are complete and verified, you have:

1. **ContentAsset Prisma model** — workspace-scoped, with tags, alt text, sourceContext
2. **Local file storage service** — with an interface ready for S3 swap
3. **Full CRUD API** — upload, list (with filters), get, update, delete, serve file
4. **Four reusable UI components:**
   - `SlideOver` — generic, reusable across EDUTex (SME review, settings, etc.)
   - `AssetUploadZone` — drag-and-drop upload with validation
   - `WorkspaceAssetBrowser` — searchable thumbnail grid in a slide-over
   - `AssetAttachment` — drop-in field-level control with 4-prop API

Phase B (storyboard integration) will import `AssetAttachment` into `ContentScreenComponent.tsx` and add `visualsAssetId` attributes. Phase C (Job Aids) will use the same `AssetAttachment` in the step editor.
