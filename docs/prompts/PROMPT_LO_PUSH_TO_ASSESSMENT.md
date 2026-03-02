# Claude Code Prompt: Learning Objectives Wizard — Push to Assessment Builder

## Context

You are working on EDUTex, a Next.js 15 / React 19 / TypeScript / Prisma / PostgreSQL instructional design platform.

The Learning Objectives Wizard Screen 6 (Export & Downstream Handoff) has a "Push to Assessment Builder" placeholder card. We are making it functional.

**What "Push to Assessment Builder" means:** For each learning objective that has `requiresAssessment: true`, create an `AssessmentItem` record and link it to the objective via `ObjectiveAssessmentLink`. For objectives where `requiresAssessment` is false, still create items but flag them as lower priority in the rationale. This gives the instructional designer a head start on assessment planning.

## Before Writing Code

Read these files to confirm the patterns described below:

1. `prisma/schema.prisma` — Confirm the `AssessmentItem` model fields, `AssessmentType` enum values, `ObjectiveAssessmentLink` model fields, and the `BloomLevel` enum
2. `app/api/courses/[courseId]/objectives/push-to-storyboard/route.ts` — Use this as the pattern reference for auth, error handling, and response shape (just built in the previous step)
3. `app/workspace/[workspaceId]/course/[courseId]/objectives/components/Screen6Export.tsx` — Current component with the existing Push to Storyboard wiring. The "Push to Assessment Builder" is still a placeholder card.

## Known Schema Facts

**AssessmentType enum (9 values):**
`MULTIPLE_CHOICE`, `MULTIPLE_SELECT`, `TRUE_FALSE`, `SHORT_ANSWER`, `MATCHING`, `ORDERING`, `SCENARIO_BASED`, `PERFORMANCE_CHECKLIST`, `ESSAY`

**AssessmentItem model fields:**
- `id` (String, @id cuid)
- `courseId` (String)
- `type` (AssessmentType)
- `stem` (String, @db.Text) — the question/prompt text
- `options` (Json?) — answer options
- `correctAnswer` (Json?)
- `feedback` (Json?)
- `bloomLevel` (BloomLevel)
- `difficulty` (Int, default 2) — 1-5 scale
- `externalId` (String?)
- `rationale` (String?, @db.Text)
- `aiGenerated` (Boolean, default false)
- `aiReasoning` (String?, @db.Text)
- `order` (Int, default 0)
- `createdAt`, `updatedAt`
- Relations: `course` (Course), `objectives` (ObjectiveAssessmentLink[])

**ObjectiveAssessmentLink model fields:**
- `id` (String, @id cuid)
- `objectiveId` (String)
- `assessmentItemId` (String)
- `bloomLevelAssessed` (BloomLevel)
- `isAligned` (Boolean, default true)
- `alignmentNotes` (String?)
- Relations: `objective` (Objective), `assessmentItem` (AssessmentItem)
- Unique constraint: `@@unique([objectiveId, assessmentItemId])`

**BloomLevel enum:** `REMEMBER`, `UNDERSTAND`, `APPLY`, `ANALYZE`, `EVALUATE`, `CREATE`

**Objective model key fields (relevant subset):**
- `id`, `title`, `bloomLevel` (BloomLevel), `objectivePriority` (ObjectivePriority?)
- `condition`, `criteria`, `audience`, `verb`
- `requiresAssessment` (Boolean)
- `linkedTriageItemId` (String?)
- Relation: `linkedTriageItem` (TriageItem?)
- Relation: `assessmentLinks` (ObjectiveAssessmentLink[])

**Screen6Export props:**
```typescript
interface Screen6Props {
  objs: WizardObjective[];
  triageItems: TriageItemData[];
  audiences: string[];
  courseId: string;
  courseName: string;
  onCreateObjective: () => void;
}
```

## What to Build

### Part A: API Route — `app/api/courses/[courseId]/objectives/push-to-assessment/route.ts`

Create a POST endpoint following the same pattern as push-to-storyboard:

1. **Authenticate** with `getCurrentUserOrThrow()` and `assertCourseAccess()`

2. **Fetch all objectives** for this course:
   ```typescript
   const objectives = await prisma.objective.findMany({
     where: { courseId },
     include: {
       linkedTriageItem: true,
       assessmentLinks: true,  // Check for existing links
     },
     orderBy: { sortOrder: 'asc' },
   });
   ```

3. **Check if objectives exist.** If zero, return:
   ```json
   { "success": true, "created": 0, "skipped": 0, "message": "No objectives to push." }
   ```

4. **Filter out already-linked objectives:**
   ```typescript
   const newObjectives = objectives.filter(obj => obj.assessmentLinks.length === 0);
   const skipped = objectives.length - newObjectives.length;
   ```

5. **Get current max order** for assessment items in this course:
   ```typescript
   const maxOrderResult = await prisma.assessmentItem.aggregate({
     where: { courseId },
     _max: { order: true },
   });
   const startOrder = (maxOrderResult._max.order ?? -1) + 1;
   ```

6. **For each un-linked objective, create an AssessmentItem AND an ObjectiveAssessmentLink** in a transaction:

   ```typescript
   const results = await prisma.$transaction(async (tx) => {
     const created: string[] = [];

     for (let i = 0; i < newObjectives.length; i++) {
       const obj = newObjectives[i];

       const assessmentItem = await tx.assessmentItem.create({
         data: {
           courseId,
           type: mapBloomToAssessmentType(obj.bloomLevel),
           stem: buildStem(obj),
           options: null,       // Designer fills in later
           correctAnswer: null, // Designer fills in later
           feedback: null,      // Designer fills in later
           bloomLevel: obj.bloomLevel,
           difficulty: mapBloomToDifficulty(obj.bloomLevel),
           rationale: buildAssessmentRationale(obj),
           aiGenerated: false,
           order: startOrder + i,
         },
       });

       await tx.objectiveAssessmentLink.create({
         data: {
           objectiveId: obj.id,
           assessmentItemId: assessmentItem.id,
           bloomLevelAssessed: obj.bloomLevel,
           isAligned: true,
           alignmentNotes: `Auto-generated from Learning Objectives Wizard. ${
             obj.requiresAssessment
               ? 'Objective marked as requiring assessment.'
               : 'Assessment item created for coverage — objective not explicitly marked as requiring assessment.'
           }`,
         },
       });

       created.push(assessmentItem.id);
     }

     return created;
   });
   ```

7. **Helper functions** (define in the same file above the route handler):

   ```typescript
   function mapBloomToAssessmentType(bloomLevel: string): string {
     // Returns AssessmentType enum values
     switch (bloomLevel) {
       case 'REMEMBER':
         return 'MULTIPLE_CHOICE';
       case 'UNDERSTAND':
         return 'SHORT_ANSWER';
       case 'APPLY':
         return 'PERFORMANCE_CHECKLIST';
       case 'ANALYZE':
         return 'SCENARIO_BASED';
       case 'EVALUATE':
         return 'ESSAY';
       case 'CREATE':
         return 'PERFORMANCE_CHECKLIST';
       default:
         return 'MULTIPLE_CHOICE';
     }
   }

   function mapBloomToDifficulty(bloomLevel: string): number {
     // 1-5 scale, higher Bloom = higher difficulty
     switch (bloomLevel) {
       case 'REMEMBER':    return 1;
       case 'UNDERSTAND':  return 2;
       case 'APPLY':       return 3;
       case 'ANALYZE':     return 4;
       case 'EVALUATE':    return 4;
       case 'CREATE':      return 5;
       default:            return 2;
     }
   }

   function buildStem(obj: {
     title: string;
     condition?: string | null;
     criteria?: string | null;
     bloomLevel: string;
   }): string {
     // Create an assessment stem prompt from the objective
     const parts: string[] = [];
     parts.push(`[Assessment for: ${obj.title}]`);
     if (obj.condition) parts.push(`Context: ${obj.condition}`);
     if (obj.criteria) parts.push(`Expected performance: ${obj.criteria}`);
     parts.push('');
     parts.push('[Replace this placeholder with your assessment question/prompt]');
     return parts.join('\n');
   }

   function buildAssessmentRationale(obj: {
     bloomLevel: string;
     requiresAssessment: boolean;
     objectivePriority?: string | null;
     linkedTriageItem?: { text: string } | null;
   }): string {
     const notes: string[] = [];
     notes.push('[Auto-generated from Learning Objectives Wizard]');
     notes.push(`Bloom's Level: ${obj.bloomLevel}`);
     notes.push(`Assessment Type: ${mapBloomToAssessmentType(obj.bloomLevel)} (suggested based on Bloom's level)`);
     if (obj.objectivePriority) notes.push(`Objective Priority: ${obj.objectivePriority}`);
     if (obj.linkedTriageItem?.text) notes.push(`Parent Task: ${obj.linkedTriageItem.text}`);
     notes.push(`Requires Assessment: ${obj.requiresAssessment ? 'Yes' : 'No (created for coverage)'}`);
     return notes.join('\n');
   }
   ```

8. **Return response:**
   ```json
   {
     "success": true,
     "created": 5,
     "skipped": 2,
     "message": "5 assessment items created and linked. 2 objectives already had assessments."
   }
   ```

9. Wrap everything in try/catch with `errorResponse()`.

### Part B: Wire Screen 6 Button

In `app/workspace/[workspaceId]/course/[courseId]/objectives/components/Screen6Export.tsx`:

1. **Extend the pushing state** to support both storyboard and assessment:
   - Change `pushing` type from `'storyboard' | null` to `'storyboard' | 'assessment' | null`

2. **Add a separate result state for assessment** (or make the existing pushResult generic enough to handle both — your call on cleanest approach. Simplest: add `assessmentResult` state mirroring `pushResult`):
   ```typescript
   const [assessmentResult, setAssessmentResult] = useState<{
     type: 'success' | 'error';
     message: string;
   } | null>(null);
   ```

3. **Add handler:**
   ```typescript
   const handlePushToAssessment = async () => {
     try {
       setPushing('assessment');
       setAssessmentResult(null);
       const response = await fetch(
         `/api/courses/${courseId}/objectives/push-to-assessment`,
         { method: 'POST' }
       );
       const result = await response.json();
       if (!response.ok) {
         throw new Error(result.error || 'Push failed');
       }
       setAssessmentResult({
         type: 'success',
         message: result.message,
       });
     } catch (err) {
       console.error('Push to assessment error:', err);
       setAssessmentResult({
         type: 'error',
         message: err instanceof Error ? err.message : 'Push failed',
       });
     } finally {
       setPushing(null);
     }
   };
   ```

4. **Replace the "Push to Assessment Builder" placeholder card** with a functional button:
   - Follow the exact same pattern as the Push to Storyboard button
   - onClick: `handlePushToAssessment`
   - Disabled while `pushing !== null` (either push operation disables both buttons)
   - Loading text: "Pushing..."

5. **Add result banner** below the assessment button (same styling as storyboard result banner):
   - Success: green banner with created/skipped message
   - Error: red banner with error message
   - No navigation link needed (Assessment Builder doesn't have a dedicated page yet)

### Part C: Edge Cases

1. **No objectives:** Returns `created: 0`, shows "No objectives to push"
2. **All already linked:** Returns `skipped: N, created: 0`, shows "N objectives already had assessments"
3. **Mixed:** Shows both counts
4. **Re-push safe:** Uses `assessmentLinks.length === 0` check — objectives with existing links are skipped
5. **Bloom level drives defaults:** Assessment type, difficulty, and stem are all derived from Bloom's level but can be changed later by the designer

## Testing

1. Course with objectives (some with requiresAssessment=true, some false) → creates items for all, links all
2. Click push again → reports all skipped
3. Check database: `AssessmentItem` records exist with correct bloomLevel, type, difficulty
4. Check database: `ObjectiveAssessmentLink` records link each item to its objective
5. Course with zero objectives → "No objectives to push"
6. Both push buttons disabled while either operation is in flight

Run `npm run build` after all changes.

## Files to Create/Modify

- **Create:** `app/api/courses/[courseId]/objectives/push-to-assessment/route.ts`
- **Modify:** `app/workspace/[workspaceId]/course/[courseId]/objectives/components/Screen6Export.tsx`

## Do Not

- Do not modify the Prisma schema
- Do not modify existing AssessmentItem records on re-push
- Do not skip objectives where requiresAssessment is false — create items for all objectives, just note it in the rationale
- Do not create placeholder UI for the Assessment Builder page (that's a separate feature)
