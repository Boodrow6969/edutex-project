# Claude Code Prompt: Learning Objectives Wizard — Push to Storyboard

## Context

You are working on EDUTex, a Next.js 15 / React 19 / TypeScript / Prisma / PostgreSQL instructional design platform.

The Learning Objectives Wizard Screen 6 (Export & Downstream Handoff) has a "Push to Storyboard" button that is currently a placeholder. We are making it functional.

**What "Push to Storyboard" means:** For each learning objective, create a CONTENT_SCREEN block in the course's storyboard page, pre-populated with objective-derived content. This gives the instructional designer a head start on their storyboard — each objective becomes a content screen stub they can flesh out.

## Before Writing Code

Read these files in this order:

1. `prisma/schema.prisma` — Find the Page model (note the `type` field and PageType enum), Block model (note `type`, `content`, `sortOrder`), and the Objective model
2. `app/api/pages/[pageId]/blocks/route.ts` — Understand how blocks are created (POST handler), what fields are required, what validation exists (VALID_BLOCK_TYPES array)
3. `lib/tiptap/sync.ts` — Find the `blockToNode` function and look at the CONTENT_SCREEN case to understand the expected content JSON shape for a content screen block
4. `components/tiptap/nodes/ContentScreenComponent.tsx` — See what fields the ContentScreen renders (screenType, screenTitle, onScreenText, voiceoverScript, interactionType, designerNotes, developerNotes, etc.)
5. Screen 6 component (likely `components/objectives/Screen6Export.tsx` or similar) — See the current placeholder button and how other buttons (Word/PDF export) are already wired
6. `ObjectivesWizard.tsx` — See how objective data and courseId are available
7. `lib/auth-helpers.ts` — for auth patterns

## What to Build

### Part A: API Route — `app/api/courses/[courseId]/objectives/push-to-storyboard/route.ts`

Create a POST endpoint that:

1. **Authenticates** with `getCurrentUserOrThrow()` and `assertCourseAccess()`

2. **Finds or creates the storyboard page** for this course:
   - Query: find a Page where `courseId` matches AND `type` is `STORYBOARD` (check the PageType enum for the exact value — it might be `STORYBOARD` or similar)
   - If no storyboard page exists, **create one** with:
     - `title`: "Storyboard"
     - `type`: the storyboard PageType value
     - `courseId`: from the route param
     - `slug`: "storyboard"
   - Return the page ID either way

3. **Fetches all objectives** for this course, including:
   - All ABCD fields (title, description, condition, criteria)
   - bloomLevel, priority
   - linkedTriageItemId with the TriageItem's title (for the parent task name)
   
4. **Checks for existing pushed blocks** to avoid duplicates:
   - Query existing CONTENT_SCREEN blocks on the storyboard page
   - Check if any block's `content` JSON contains an `objectiveId` field matching an objective ID
   - Only create blocks for objectives that haven't already been pushed
   - Track which were skipped vs created for the response

5. **Gets the current max sortOrder** on the storyboard page's blocks (so new blocks append at the end)

6. **Creates one CONTENT_SCREEN block per un-pushed objective:**

   For each objective, create a Block with:
   ```typescript
   {
     pageId: storyboardPage.id,
     type: 'CONTENT_SCREEN', // Use the BlockType enum value
     sortOrder: maxSortOrder + index + 1,
     content: {
       // Tracking field — links this block back to the objective
       objectiveId: objective.id,
       
       // Content pre-population
       screenId: `OBJ-${String(index + 1).padStart(3, '0')}`,
       screenTitle: objective.title,
       screenType: mapBloomToScreenType(objective.bloomLevel),
       onScreenText: buildOnScreenText(objective),
       voiceoverScript: '',
       visuals: '',
       interactionType: mapBloomToInteraction(objective.bloomLevel),
       interactionDetails: '',
       designerNotes: buildDesignerNotes(objective),
       developerNotes: '',
       duration: '',
     }
   }
   ```

7. **Helper functions** (define these in the same file or a small util):

   ```typescript
   // Map Bloom's level to a sensible default screen type
   function mapBloomToScreenType(bloomLevel?: string | null): string {
     switch (bloomLevel?.toUpperCase()) {
       case 'REMEMBER':
       case 'UNDERSTAND':
         return 'content';
       case 'APPLY':
         return 'practice';
       case 'ANALYZE':
       case 'EVALUATE':
         return 'scenario';
       case 'CREATE':
         return 'practice';
       default:
         return 'content';
     }
   }

   // Map Bloom's level to a default interaction type
   function mapBloomToInteraction(bloomLevel?: string | null): string {
     switch (bloomLevel?.toUpperCase()) {
       case 'REMEMBER':
         return 'knowledge_check';
       case 'UNDERSTAND':
         return 'knowledge_check';
       case 'APPLY':
         return 'guided_practice';
       case 'ANALYZE':
         return 'scenario';
       case 'EVALUATE':
         return 'scenario';
       case 'CREATE':
         return 'guided_practice';
       default:
         return '';
     }
   }

   // Build the on-screen text from ABCD fields
   function buildOnScreenText(objective: ObjectiveData): string {
     const parts: string[] = [];
     if (objective.title) parts.push(`Objective: ${objective.title}`);
     if (objective.condition) parts.push(`Condition: ${objective.condition}`);
     if (objective.criteria) parts.push(`Success Criteria: ${objective.criteria}`);
     return parts.join('\n\n');
   }

   // Build designer notes with context
   function buildDesignerNotes(objective: ObjectiveData): string {
     const notes: string[] = [];
     notes.push(`[Auto-generated from Learning Objectives Wizard]`);
     if (objective.bloomLevel) notes.push(`Bloom's Level: ${objective.bloomLevel}`);
     if (objective.priority) notes.push(`Priority: ${objective.priority}`);
     if (objective.parentTaskTitle) notes.push(`Parent Task: ${objective.parentTaskTitle}`);
     if (objective.description && objective.description !== objective.title) {
       notes.push(`Full Description: ${objective.description}`);
     }
     return notes.join('\n');
   }
   ```

8. **Return response:**
   ```json
   {
     "success": true,
     "storyboardPageId": "...",
     "created": 5,
     "skipped": 2,
     "message": "5 objectives pushed to storyboard. 2 were already present."
   }
   ```

9. Use try/catch with `errorResponse()` for all error paths

### Part B: Wire Screen 6 Button

In the Screen 6 component:

1. Find the "Push to Storyboard" placeholder button

2. Wire its onClick:
   ```typescript
   const handlePushToStoryboard = async () => {
     try {
       setPushing('storyboard');
       const response = await fetch(
         `/api/courses/${courseId}/objectives/push-to-storyboard`,
         { method: 'POST' }
       );
       if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || 'Push failed');
       }
       const result = await response.json();
       // Show success message with created/skipped counts
       setSuccessMessage(
         `${result.created} objective${result.created !== 1 ? 's' : ''} pushed to storyboard.` +
         (result.skipped > 0 ? ` ${result.skipped} already present.` : '')
       );
     } catch (err) {
       console.error('Push to storyboard error:', err);
       setErrorMessage(err instanceof Error ? err.message : 'Push failed');
     } finally {
       setPushing(null);
     }
   };
   ```

3. Add loading state on the button (spinner + "Pushing..." text, disabled while in progress)

4. Add a success/info banner that appears after push completes, showing the created/skipped counts

5. Optionally: add a "View Storyboard →" link in the success banner that navigates to the storyboard page using the returned `storyboardPageId`. The route would be something like:
   `/workspace/${workspaceId}/course/${courseId}/storyboard` or
   `/workspace/${workspaceId}/course/${courseId}/page/${storyboardPageId}`
   Check the existing routing pattern in the app to determine the correct path.

### Part C: Handle Edge Cases

1. **No objectives exist:** Return `{ success: true, created: 0, skipped: 0, message: "No objectives to push." }` — don't create a storyboard page if there are no objectives

2. **All objectives already pushed:** Return the skipped count, don't create duplicates

3. **Re-push after editing objectives:** The duplicate check uses `objectiveId` in the block content. If an objective was edited after being pushed, the existing block is NOT updated (the designer may have already customized it). Only truly new objectives get new blocks.

4. **Storyboard page already has non-objective blocks:** New blocks append after existing blocks (via maxSortOrder). Don't disturb existing content.

## Important Notes

- Check the exact BlockType enum value in schema.prisma — it might be `CONTENT_SCREEN` or something else. Use the correct enum value.
- Check the exact PageType enum value — it might be `STORYBOARD`, `STORYBOARD_PAGE`, or something different. Use whatever exists.
- The `content` field on Block is a JSON type in Prisma. The shape must match what `blockToNode` in `sync.ts` expects for CONTENT_SCREEN blocks. Read that function carefully.
- The `objectiveId` field in the content JSON is a new addition for tracking purposes. It won't affect TipTap rendering (it'll be ignored by the ContentScreen component), but it prevents duplicate pushes.

## Testing

After implementation:

1. Navigate to a course with objectives
2. Go to Objectives Wizard → Screen 6
3. Click "Push to Storyboard"
4. Verify success message shows correct count
5. Navigate to the storyboard page → verify new CONTENT_SCREEN blocks exist with:
   - Screen titles matching objective titles
   - screenType mapped from Bloom's level
   - Designer notes containing Bloom's level, priority, parent task
   - On-screen text with objective + condition + criteria
6. Go back to Screen 6, click "Push to Storyboard" again → should report all skipped (no duplicates)
7. Add a new objective in Screen 4, go back to Screen 6, push again → should create only the new one
8. Test with a course that has NO storyboard page yet → should create one automatically
9. Test with a course that has NO objectives → should show "No objectives to push"

Run `npm run build` after all changes.

## Files to Create/Modify

- **Create:** `app/api/courses/[courseId]/objectives/push-to-storyboard/route.ts`
- **Modify:** Screen 6 component (wire button handler, add loading/success states)

## Do Not

- Do not modify the Prisma schema
- Do not modify any TipTap extensions or sync logic
- Do not modify existing storyboard blocks or pages
- Do not update existing pushed blocks when objectives change (designer may have customized them)
- Do not create a storyboard page if there are no objectives to push
