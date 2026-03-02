# Claude Code Prompt: Learning Objectives Wizard — Copy to Design Strategy

## Context

You are working on EDUTex, a Next.js 15 / React 19 / TypeScript / Prisma / PostgreSQL instructional design platform.

The Learning Objectives Wizard Screen 6 has a "Copy to Design Strategy" placeholder card. We are making it functional. This button does TWO things:

1. **Seeds a `DesignStrategy` database record** with data derived from objectives (for future module consumption)
2. **Generates a pre-filled .docx file** and triggers a download

No `DesignStrategy` model exists yet — we need to create it and run a migration.

## Before Writing Code

Read these files:

1. `prisma/schema.prisma` — Confirm no DesignStrategy model exists. Note the Course model's relation fields. Note existing enum patterns (like `BloomLevel`, `ObjectivePriority`) for style consistency.
2. `lib/export/objectives-to-docx.ts` — Use as the pattern reference for Word document generation (imports, Document structure, Packer, formatting rules)
3. `app/api/courses/[courseId]/objectives/push-to-storyboard/route.ts` — Use as the pattern reference for auth, error handling, response shape
4. `app/workspace/[workspaceId]/course/[courseId]/objectives/components/Screen6Export.tsx` — Current component. The "Copy to Design Strategy" is `actions[2]` — a placeholder with no onClick handler
5. `lib/auth-helpers.ts` — for `getCurrentUserOrThrow`, `assertCourseAccess`, `errorResponse`

## Known Facts

**No DesignStrategy model exists.** We are creating one.

**Course model** already has relations to: objectives, triageItems, assessmentItems, learningTasks, pages, tasks, deliverables, blueprints.

**Screen6Export actions[2]:**
- Icon: 📎
- Label: "Copy to Design Strategy"
- Desc: "Insert into HLDD objectives section" ← this description is wrong, should reference Design Strategy not HLDD

**Existing export pattern** in `lib/export/objectives-to-docx.ts` uses the `docx` npm package with US Letter formatting, Arial font, proper heading hierarchy.

## What to Build

### Part A: Prisma Schema — Add DesignStrategy Model

Add this model to `prisma/schema.prisma` after the Objective model (or wherever makes logical sense near other course-scoped models):

```prisma
enum DesignStrategyStatus {
  DRAFT
  STAKEHOLDER_REVIEW
  APPROVED
}

model DesignStrategy {
  id        String                @id @default(cuid())
  courseId   String                @unique  // One design strategy per course
  
  // Business Alignment (populated from Needs Analysis if available)
  businessChallenge   String?     @db.Text
  businessGoal        String?     @db.Text
  
  // Solution Breakdown
  trainingPercent     Int?        // e.g. 60 means training is 60% of solution
  solutionComponents  Json?       // Array of { component: string, percentage: number, description?: string }
  
  // Evaluation Strategy (Kirkpatrick)
  evaluationPlan      Json?       // { level1?: string, level2?: string, level3?: string, level4?: string }
  
  // Objectives snapshot (denormalized at generation time)
  objectivesSnapshot  Json?       // Array of objective summaries at time of generation
  
  // Lessons / curriculum structure stubs
  lessonStubs         Json?       // Array of { title: string, objectiveIds: string[], duration?: string, format?: string }
  
  // Communication plan stubs  
  communicationPlan   Json?       // Array of { audience: string, message: string, timing?: string, channel?: string }
  
  status              DesignStrategyStatus @default(DRAFT)
  
  generatedAt         DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  
  course              Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@map("design_strategies")
}
```

**Also add** the reverse relation on the Course model:

```prisma
// In the Course model, add:
designStrategy  DesignStrategy?
```

After editing the schema:
1. Run `npx prisma validate` to confirm correctness
2. Do NOT run the migration yet — wait until the code changes are done so we can test the build first

### Part B: Export Library — `lib/export/design-strategy-to-docx.ts`

Create a new file that generates a formatted Design Strategy Word document.

**Function signature:**
```typescript
export async function generateDesignStrategyDocx(data: {
  courseName: string;
  courseType?: string;
  exportDate: string;
  businessChallenge?: string;
  businessGoal?: string;
  trainingPercent?: number;
  solutionComponents?: Array<{ component: string; percentage: number; description?: string }>;
  evaluationPlan?: { level1?: string; level2?: string; level3?: string; level4?: string };
  objectives: Array<{
    title: string;
    bloomLevel?: string;
    priority?: string;
    condition?: string;
    criteria?: string;
    parentTaskTitle?: string;
    requiresAssessment: boolean;
  }>;
  lessonStubs?: Array<{ title: string; objectiveIds: string[]; duration?: string; format?: string }>;
  bloomDistribution: Record<string, number>;
}): Promise<Buffer>
```

**Document structure:**

1. **Title page:**
   - Title: "Design Strategy" (Heading 1, #03428e)
   - Subtitle: course name
   - Status: "DRAFT — Generated from Learning Objectives Wizard"
   - Date
   - Page break

2. **Section 1: Business Alignment**
   - Heading 2: "Business Challenge & Goal"
   - Business Challenge paragraph (or placeholder: "[To be completed — enter the business problem or opportunity this training addresses]")
   - Business Goal paragraph (or placeholder: "[To be completed — enter the measurable business goal]")

3. **Section 2: Training as % of Solution**
   - Heading 2: "Solution Breakdown"
   - If solutionComponents exist, render as table (Component | % | Description)
   - If not, render placeholder table with default rows:
     - Training | __% | [Define what training will address]
     - Leadership Reinforcement | __% | [Define management support needed]
     - Process/Environment Changes | __% | [Define non-training factors]
     - Peer Accountability | __% | [Define peer support structures]
   - Note below: "Percentages should total 100%. Training alone rarely solves the full problem."

4. **Section 3: Learning Objectives**
   - Heading 2: "Learning Objectives"
   - Table with columns: # | Objective | Bloom's Level | Priority | Requires Assessment
   - One row per objective, numbered sequentially
   - Below table: Bloom's Distribution summary (e.g., "Remember: 2, Apply: 5, Analyze: 1")

5. **Section 4: Lesson Plan Stubs**
   - Heading 2: "Curriculum Structure"
   - If lessonStubs exist, render each as a mini-section
   - If not, auto-generate stubs by grouping objectives by parent task:
     - Each parent task becomes a lesson stub
     - Orphaned objectives become a "General" lesson
   - For each lesson stub: Title, linked objectives (bulleted), duration placeholder, format placeholder

6. **Section 5: Evaluation Strategy**
   - Heading 2: "Evaluation Plan (Kirkpatrick Model)"
   - Table with columns: Level | Description | Method | Timing
   - Pre-fill Level 2 (Learning) based on assessment data:
     - Count of objectives with requiresAssessment=true
     - Assessment types from Bloom's mapping
   - Other levels get placeholder text:
     - Level 1 (Reaction): "[Learner satisfaction survey — define timing and questions]"
     - Level 3 (Behavior): "[On-the-job observation — define method and timing]"
     - Level 4 (Results): "[Business KPI measurement — link to business goal above]"

7. **Section 6: Communication Plan**
   - Heading 2: "Communication Plan"
   - Placeholder table: Audience | Message | Timing | Channel
   - Default rows: Learners, Managers, Stakeholders, SMEs — all with placeholder text

**Formatting rules (match objectives-to-docx.ts):**
- US Letter: 12240 x 15840 DXA, 1 inch margins
- Arial throughout, 12pt default
- Heading 1: 32pt bold #03428e, Heading 2: 28pt bold, Heading 3: 26pt bold
- Tables: WidthType.DXA, both columnWidths and cell width, ShadingType.CLEAR for headers
- Proper bullet lists via LevelFormat.BULLET
- PageBreak between major sections
- Never use `\n` or unicode bullets

### Part C: API Route — `app/api/courses/[courseId]/objectives/copy-to-design-strategy/route.ts`

Create a POST endpoint:

1. **Authenticate** with `getCurrentUserOrThrow()` and `assertCourseAccess()`

2. **Fetch course data:**
   ```typescript
   const course = await prisma.course.findUnique({
     where: { id: courseId },
     include: {
       objectives: {
         include: { linkedTriageItem: true },
         orderBy: { sortOrder: 'asc' },
       },
       triageItems: { orderBy: { sortOrder: 'asc' } },
       designStrategy: true,  // Check if one already exists
     },
   });
   ```

3. **Check if objectives exist.** If zero, return:
   ```json
   { "success": true, "created": false, "downloaded": false, "message": "No objectives to export." }
   ```

4. **Build objectives snapshot** (denormalized array for the JSON field):
   ```typescript
   const objectivesSnapshot = course.objectives.map(obj => ({
     id: obj.id,
     title: obj.title,
     bloomLevel: obj.bloomLevel,
     priority: obj.objectivePriority,
     condition: obj.condition,
     criteria: obj.criteria,
     requiresAssessment: obj.requiresAssessment,
     parentTask: obj.linkedTriageItem?.text ?? null,
   }));
   ```

5. **Build lesson stubs** by grouping objectives by parent task:
   ```typescript
   const taskGroups = new Map<string, { title: string; objectiveIds: string[] }>();
   const orphanObjectiveIds: string[] = [];
   
   for (const obj of course.objectives) {
     if (obj.linkedTriageItem) {
       const key = obj.linkedTriageItemId!;
       if (!taskGroups.has(key)) {
         taskGroups.set(key, { title: obj.linkedTriageItem.text, objectiveIds: [] });
       }
       taskGroups.get(key)!.objectiveIds.push(obj.id);
     } else {
       orphanObjectiveIds.push(obj.id);
     }
   }
   
   const lessonStubs = [
     ...Array.from(taskGroups.values()).map(g => ({
       title: g.title,
       objectiveIds: g.objectiveIds,
       duration: '',
       format: '',
     })),
     ...(orphanObjectiveIds.length > 0 ? [{
       title: 'General',
       objectiveIds: orphanObjectiveIds,
       duration: '',
       format: '',
     }] : []),
   ];
   ```

6. **Upsert the DesignStrategy record:**
   ```typescript
   const designStrategy = await prisma.designStrategy.upsert({
     where: { courseId },
     create: {
       courseId,
       objectivesSnapshot,
       lessonStubs,
       status: 'DRAFT',
     },
     update: {
       objectivesSnapshot,
       lessonStubs,
       generatedAt: new Date(),
       // Do NOT overwrite businessChallenge, businessGoal, evaluationPlan,
       // solutionComponents, or communicationPlan — designer may have edited those
     },
   });
   ```

7. **Compute bloom distribution:**
   ```typescript
   const bloomDistribution: Record<string, number> = {};
   for (const obj of course.objectives) {
     const level = obj.bloomLevel || 'UNKNOWN';
     bloomDistribution[level] = (bloomDistribution[level] || 0) + 1;
   }
   ```

8. **Generate the .docx:**
   ```typescript
   const buffer = await generateDesignStrategyDocx({
     courseName: course.title,
     courseType: course.courseType ?? undefined,
     exportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
     businessChallenge: designStrategy.businessChallenge ?? undefined,
     businessGoal: designStrategy.businessGoal ?? undefined,
     trainingPercent: designStrategy.trainingPercent ?? undefined,
     solutionComponents: designStrategy.solutionComponents as any ?? undefined,
     evaluationPlan: designStrategy.evaluationPlan as any ?? undefined,
     objectives: course.objectives.map(obj => ({
       title: obj.title,
       bloomLevel: obj.bloomLevel,
       priority: obj.objectivePriority ?? undefined,
       condition: obj.condition ?? undefined,
       criteria: obj.criteria ?? undefined,
       parentTaskTitle: obj.linkedTriageItem?.text ?? undefined,
       requiresAssessment: obj.requiresAssessment,
     })),
     lessonStubs: lessonStubs,
     bloomDistribution,
   });
   ```

9. **Return the .docx file:**
   ```typescript
   const safeName = course.title.replace(/[^a-zA-Z0-9]/g, '_');
   return new Response(buffer, {
     status: 200,
     headers: {
       'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'Content-Disposition': `attachment; filename="Design_Strategy_${safeName}.docx"`,
     },
   });
   ```

10. Wrap everything in try/catch with `errorResponse()`.

### Part D: Wire Screen 6 Button

In `Screen6Export.tsx`:

1. **Fix the actions[2] description** from "Insert into HLDD objectives section" to:
   ```
   "Generate a Design Strategy document pre-filled with objectives and lesson stubs"
   ```

2. **Add state:**
   ```typescript
   const [copying, setCopying] = useState<'designStrategy' | null>(null);
   const [copyResult, setCopyResult] = useState<{
     type: 'success' | 'error';
     message: string;
   } | null>(null);
   ```

3. **Add handler** (this one downloads a file AND seeds the DB — the API does both):
   ```typescript
   const handleCopyToDesignStrategy = async () => {
     try {
       setCopying('designStrategy');
       setCopyResult(null);
       const response = await fetch(
         `/api/courses/${courseId}/objectives/copy-to-design-strategy`,
         { method: 'POST' }
       );
       if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || 'Export failed');
       }
       // Response is a .docx file — download it
       const blob = await response.blob();
       const url = URL.createObjectURL(blob);
       const safeName = courseName.replace(/[^a-zA-Z0-9]/g, '_');
       const a = document.createElement('a');
       a.href = url;
       a.download = `Design_Strategy_${safeName}.docx`;
       a.click();
       URL.revokeObjectURL(url);
       setCopyResult({
         type: 'success',
         message: 'Design Strategy document generated and saved to project.',
       });
     } catch (err) {
       console.error('Copy to Design Strategy error:', err);
       setCopyResult({
         type: 'error',
         message: err instanceof Error ? err.message : 'Export failed',
       });
     } finally {
       setCopying(null);
     }
   };
   ```

4. **Replace the placeholder card** for actions[2] with a functional button:
   - onClick: `handleCopyToDesignStrategy`
   - Disabled while `copying !== null` or `pushing !== null` or `exporting !== null`
   - Loading text: "Generating..."

5. **Add result banner** below (same pattern as storyboard/assessment banners)

### Part E: Migration

After all code changes compile:

```bash
npx prisma migrate dev --name add_design_strategy_model
```

## Testing

1. Course with objectives → click "Copy to Design Strategy" → downloads .docx
2. Open the .docx → verify all sections present with correct objective data
3. Check database → DesignStrategy record exists with objectivesSnapshot and lessonStubs
4. Click again → should update the snapshot (upsert), NOT create duplicate
5. Objectives grouped into lessons by parent task
6. Orphaned objectives appear under "General" lesson
7. Course with zero objectives → "No objectives to export"
8. All buttons (export, push, copy) disable while any operation is in flight

Run `npm run build` after all changes (before migration).

## Files to Create/Modify

- **Modify:** `prisma/schema.prisma` (add DesignStrategyStatus enum, DesignStrategy model, Course relation)
- **Create:** `lib/export/design-strategy-to-docx.ts`
- **Create:** `app/api/courses/[courseId]/objectives/copy-to-design-strategy/route.ts`
- **Modify:** `app/workspace/[workspaceId]/course/[courseId]/objectives/components/Screen6Export.tsx`

## Do Not

- Do not run the migration until the build passes
- Do not overwrite user-edited fields (businessChallenge, businessGoal, evaluationPlan, solutionComponents, communicationPlan) on re-generation — only update the objective snapshot and lesson stubs
- Do not create HLDD functionality (that's a separate prompt)
- Do not use unicode bullets or WidthType.PERCENTAGE in the docx
- Do not use `\n` for line breaks in the docx — use separate Paragraph elements
