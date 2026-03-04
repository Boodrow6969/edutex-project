Remove STORYBOARD_FRAME from the codebase. Here's what needs to happen:

1. prisma/schema.prisma — Remove STORYBOARD_FRAME from the BlockType enum.

2. lib/tiptap/sync.ts — Remove the legacy conversion case that converts STORYBOARD_FRAME blocks to paragraphs.

3. lib/types/blocks.ts — Remove the type mapping for STORYBOARD_FRAME.

4. app/api/pages/[pageId]/blocks/route.ts — Remove STORYBOARD_FRAME from the allowed types array.

5. Delete these dead code files if they still exist:
   - components/pages/StoryboardView.tsx
   - lib/types/storyboard.ts

6. Search the entire codebase for "STORYBOARD_FRAME" to confirm no remaining references.

7. Run npx prisma generate

8. Run npm run build — confirm zero errors.

9. If build passes: npx prisma migrate dev --name remove-storyboard-frame

Report results at each step.