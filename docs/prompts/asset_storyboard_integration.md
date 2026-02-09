You are working in a Next.js 15 TypeScript app called EDUTex. The storyboard editor
uses TipTap with custom node extensions. Content Assets (upload, browse, attach UI)
was just built and is working.

IMPORTANT: Work on the current branch: feature/content-assets

Goal
Wire the AssetAttachment component into ContentScreenComponent so instructional
designers can attach a reference screenshot to content blocks in the storyboard editor.

Do not modify any files other than the three listed below. Show full updated contents
for each file.

---

Step 1: Add asset ID attributes to ContentScreenNode

File: lib/tiptap/extensions/ContentScreenNode.ts

Add these new attributes inside addAttributes() alongside the existing ones:

// Reference image for the visuals description (Content type)
visualsAssetId: { default: null },

// Reference image for Title/Intro background
backgroundAssetId: { default: null },

// Note: Video scenes already store as an array of objects.
// Each scene object should support an optional assetId field.
// This is handled by the existing scenes attribute — no new
// top-level attribute needed. The component will pass assetId
// inside each scene object.

Keep all existing attributes exactly as they are.

---

Step 2: Update the sync layer

File: lib/tiptap/sync.ts

In the CONTENT_SCREEN case inside blockToNode():
- Add visualsAssetId and backgroundAssetId mapping using getString(),
  same pattern as every other string attribute
- For the scenes array mapping (if it exists), ensure each scene object
  preserves an assetId field if present

In the contentScreen case inside nodeToBlock():
- Add visualsAssetId and backgroundAssetId to the content object
- For scenes, ensure assetId is included in each scene object

---

Step 3: Add AssetAttachment to ContentScreenComponent

File: components/tiptap/nodes/ContentScreenComponent.tsx

Import AssetAttachment at the top:

import { AssetAttachment } from '@/components/assets'

You will also need access to the current workspaceId. The component receives
node attributes via the NodeViewProps from TipTap. The workspaceId is NOT
currently in the node attributes, so we need to get it from the URL.

Add a hook at the top of the component to extract workspaceId from the URL path:

import { useParams } from 'next/navigation'

Inside the component:
const params = useParams()
const workspaceId = params?.workspaceId as string

If useParams doesn't work in this context (TipTap NodeView components may not
have route context), fall back to extracting it from window.location.pathname:

const workspaceId = typeof window !== 'undefined'
  ? window.location.pathname.split('/workspace/')[1]?.split('/')[0] ?? ''
  : ''

Now integrate AssetAttachment into the field layouts:

A) In ContentFields (the layout shown when screenType is "content"):
   Add AssetAttachment directly below the "visuals" textarea.
   
   <AssetAttachment
     workspaceId={workspaceId}
     assetId={attrs.visualsAssetId}
     onAttach={(assetId) => updateAttrs({ visualsAssetId: assetId })}
     onRemove={() => updateAttrs({ visualsAssetId: null })}
     label="Reference screenshot"
   />

B) In TitleIntroFields (the layout for "introduction" screenType):
   Add AssetAttachment below the backgroundNotes textarea.
   
   <AssetAttachment
     workspaceId={workspaceId}
     assetId={attrs.backgroundAssetId}
     onAttach={(assetId) => updateAttrs({ backgroundAssetId: assetId })}
     onRemove={() => updateAttrs({ backgroundAssetId: null })}
     label="Background image"
   />

C) In VideoFields (the layout for "video" screenType):
   Inside each scene section (the map over the scenes array), add
   AssetAttachment below the scene's visual description textarea.
   
   The scenes array contains objects. When attaching, update the specific
   scene's assetId within the array:
   
   <AssetAttachment
     workspaceId={workspaceId}
     assetId={scene.assetId || null}
     onAttach={(assetId) => {
       const updated = [...scenes]
       updated[index] = { ...updated[index], assetId }
       updateAttrs({ scenes: updated })
     }}
     onRemove={() => {
       const updated = [...scenes]
       updated[index] = { ...updated[index], assetId: null }
       updateAttrs({ scenes: updated })
     }}
     label="Scene reference"
   />

D) Do NOT add AssetAttachment to Practice, Assessment, or Scenario fields
   for now. Those are less visual and can be added later if needed.

---

Step 4: Verify

Run: npm run build

Confirm zero type errors.

Then describe how to test manually:
1. Start dev server, navigate to a storyboard page
2. Insert a Content Screen block (default type)
3. Below the visuals textarea, there should be an "Attach image" / 
   "Reference screenshot" control
4. Click it — the asset browser slide-over should open
5. Select or upload an image — it should attach and show a thumbnail
6. Refresh the page — the attachment should persist (assetId saved to DB)
7. Switch screen type to "Introduction" — verify Background image attachment
8. Switch to "Video", add a scene — verify Scene reference attachment
9. Test remove on each

At the end of your message:
1. List the three files modified
2. Note how workspaceId was resolved
3. Confirm build passes