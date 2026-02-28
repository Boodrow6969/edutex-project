# Claude Code Prompt: Learning Objectives Wizard — Implementation

## Context

You are implementing the Learning Objectives Wizard for EDUTex, an instructional design platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL. The wizard is a tool within the existing Workspace → Curriculum → Course → Tools hierarchy.

A working React prototype exists at `learning-objectives-v6.jsx` (attached or in project root). This prototype is the **design source of truth** for layout, component structure, UX behavior, and visual design. Your job is to implement it as a production Next.js feature within the existing EDUTex codebase.

## What the Prototype Contains

A 6-screen wizard with horizontal step navigation:

1. **Context & Gap Check** — Two-column layout: read-only Needs Analysis summary + gap classification (Knowledge/Skill checkboxes with conditional coaching)
2. **Content Priority** — Three-column triage board (Must / Should / Nice to Have) with move buttons and custom task entry
3. **Task Breakdown** — Accordion per active task, sub-task rows with New/Already Can Do/Uncertain status, Task Analysis sync placeholder
4. **Objective Builder** — Split panel: left sidebar (parent task list + objective cards) + right editor with Guided/Freeform view toggle
5. **Validation Dashboard** — Single-column stacked advisory cards (Traceability, Bloom's Distribution, Priority Breakdown, Assessment Alignment, Task Analysis Sync)
6. **Export & Downstream Handoff** — Push action cards + orphan task warning + grouped objective list

## Architecture Decisions (Do Not Change These)

### Navigation
- **Horizontal stepper** at top of tool content area. EDUTex app sidebar stays untouched.
- Each step is clickable anytime (non-linear navigation).
- `Continue →` advances to next sequential step.
- `skip to builder` always jumps to Screen 4 (Objective Builder). Only visible on Screens 1–3.
- `← Back` goes to previous step. Hidden on Screen 1.
- Step status indicators: ○ (not started), ◑ (in progress), ● (complete), — (skipped).

### Guided ↔ Freeform Switching
- The toggle is a **view mode**, not a per-objective property. Same underlying data record.
- All objectives have both structured ABCD fields AND a `freeformText` field.
- **Switching to Freeform** with existing ABCD data: textarea auto-populates with composed text from ABCD fields.
- **Switching to Guided** with existing freeform text: a read-only blue reference strip appears above ABCD fields showing the original freeform text. ID manually distributes content into structured fields. No AI parsing, no guessing.
- Neither direction destroys data.

### Needs Analysis Data Slide-over
- Full label "Needs Analysis Data" everywhere — never abbreviated to "NA Data."
- Tabbed interface inside: Project Context, About the System, Audience & Learner Profile, Constraints & Environment, Stakeholder Pain Points.
- Each tab has a colored left accent bar, 16px bold section title, uppercase colored question labels, 14px answer text with generous line height.
- **Context-specific opening**: the slide-over accepts a `defaultTab` parameter.
  - Parent Tasks section → opens to "About the System" tab
  - Audience Data button → opens to "Audience & Learner Profile" tab
  - Condition's System Info button → opens to "About the System" tab
  - Freeform mode header button → opens to "Project Context" tab
  - Global header button → opens to "Project Context" tab
- Available on: Header (global), Task Breakdown (screen-level), Objective Builder sidebar, Objective Builder editor (per-section), Freeform mode.

### Terminology
- **"Parent Task"** — used consistently everywhere (sidebar, context strip, validation table headers, export group headers, Link to Parent Task dropdowns). Never "linked task" or just "task" when referring to the NA-sourced task an objective traces to.
- **Priority tiers**: Must / Should / Nice to Have — unified language in triage, editor, validation, and export.

### Export Behavior
- Orphan task warning appears **below** the 4 push action cards, **above** the All Objectives list (proximal to objectives).
- "Create Objectives" button navigates to builder AND creates a new blank objective (user lands on a blank canvas).
- No dismiss button on the orphan warning — it's persistent awareness, not a nag. IDs come back to this screen over time.
- Export always works regardless of completeness.

### Context Strip (Objective Builder — Guided Mode)
- Read-only strip above the Composed Banner showing: `Parent Task: [task text] | Gap: [type]`
- If no parent task linked: `Parent Task: Not linked`
- If upstream screens skipped, gap shows whatever was classified (or omitted).

## Data Model

### Objective Record
```typescript
interface LearningObjective {
  id: string;
  courseId: string;
  // ABCD structured fields
  audience: string;
  behavior: string;
  verb: string;
  bloomLevel: BloomLevel; // Remember | Understand | Apply | Analyze | Evaluate | Create
  bloomKnowledge: KnowledgeType; // Factual | Conceptual | Procedural | Metacognitive
  condition: string;
  criteria: string;
  // Freeform
  freeformText: string;
  // Metadata
  priority: Priority; // Must | Should | Nice to Have
  requiresAssessment: boolean;
  linkedTaskId: string | null; // FK to parent task
  rationale: string;
  wiifm: string;
  // Sort
  sortOrder: number;
}
```

### Triage Item (Content Priority — Screen 2)
```typescript
interface TriageItem {
  id: string;
  courseId: string;
  text: string;
  column: 'must' | 'should' | 'nice';
  source: 'NA' | 'TaskAnalysis' | 'Custom';
  sortOrder: number;
}
```

### Sub-Task (Task Breakdown — Screen 3)
```typescript
interface SubTask {
  id: string;
  parentTriageItemId: string;
  text: string;
  isNew: 'New' | 'Already can do' | 'Uncertain';
  sortOrder: number;
}
```

### Gap Classification (Screen 1)
```typescript
interface GapClassification {
  courseId: string;
  knowledge: boolean;
  skill: boolean;
}
```

## Prisma Schema Additions

Add these models to the existing schema. Follow existing EDUTex conventions for model naming, ID generation, and timestamp fields. The `Course` model already exists — add relations to it.

```prisma
model LearningObjective {
  id               String   @id @default(cuid())
  courseId          String
  course           Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  audience         String   @default("")
  behavior         String   @default("")
  verb             String   @default("")
  bloomLevel       String   @default("")
  bloomKnowledge   String   @default("")
  condition        String   @default("")
  criteria         String   @default("")
  freeformText     String   @default("")
  priority         String   @default("Should")
  requiresAssessment Boolean @default(false)
  linkedTaskId     String?
  linkedTask       TriageItem? @relation(fields: [linkedTaskId], references: [id], onDelete: SetNull)
  rationale        String   @default("")
  wiifm            String   @default("")
  sortOrder        Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model TriageItem {
  id        String   @id @default(cuid())
  courseId   String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  text      String
  column    String   @default("must")
  source    String   @default("NA")
  sortOrder Int      @default(0)
  subTasks  SubTask[]
  objectives LearningObjective[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SubTask {
  id              String   @id @default(cuid())
  parentItemId    String
  parentItem      TriageItem @relation(fields: [parentItemId], references: [id], onDelete: Cascade)
  text            String   @default("")
  isNew           String   @default("New")
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model GapClassification {
  id        String  @id @default(cuid())
  courseId   String  @unique
  course    Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  knowledge Boolean @default(false)
  skill     Boolean @default(false)
}
```

## File Structure

```
src/app/(workspace)/[workspaceId]/curriculum/[curriculumId]/course/[courseId]/objectives/
├── page.tsx                    # Main wizard page (server component, data fetching)
├── ObjectivesWizard.tsx        # Client component — main state + stepper + screen routing
├── components/
│   ├── Stepper.tsx             # Horizontal step nav
│   ├── NASlideOver.tsx         # Needs Analysis Data slide-over with tabbed interface
│   ├── Screen1Context.tsx      # Context & Gap Check
│   ├── Screen2Priority.tsx     # Content Priority triage board
│   ├── Screen3Tasks.tsx        # Task Breakdown accordion
│   ├── Screen4Builder.tsx      # Objective Builder (contains both Guided + Freeform views)
│   ├── Screen5Validation.tsx   # Validation Dashboard
│   ├── Screen6Export.tsx       # Export & Downstream Handoff
│   ├── ComposedBanner.tsx      # Composed objective preview with AI Review toggle
│   ├── ContextStrip.tsx        # Parent Task + Gap read-only strip
│   ├── BloomVerbPicker.tsx     # Standard 6-level verb dropdown
│   ├── AKPicker.tsx            # Anderson-Krathwohl 2D grid picker
│   └── ObjCard.tsx             # Objective card for sidebar list
├── actions.ts                  # Server actions (CRUD for objectives, triage items, subtasks, gap)
└── types.ts                    # TypeScript interfaces
```

## Implementation Order

### Phase 1: Schema + Data Layer
1. Add Prisma models, run migration
2. Create server actions in `actions.ts` for CRUD operations
3. Create `page.tsx` with data fetching (gap classification, triage items, subtasks, objectives, needs analysis data from existing NA submission)
4. Wire up `ObjectivesWizard.tsx` client component with state management

### Phase 2: Screens 1–3 (Pre-Builder)
5. Stepper component
6. Screen 1: Context & Gap Check (read from existing NeedsAnalysis data + GapClassification write)
7. Screen 2: Content Priority (TriageItem CRUD, pre-populate from NA tasks if available)
8. Screen 3: Task Breakdown (SubTask CRUD under TriageItems)

### Phase 3: Objective Builder (Screen 4)
9. Sidebar: parent task list with link status, objective card list, add button
10. Guided mode: ABCD editor with verb pickers, context strip, composed banner, AI review
11. Freeform mode: textarea + optional tags + Link to Parent Task
12. View toggle with reference strip behavior

### Phase 4: Screens 5–6 + Polish
13. Validation Dashboard (computed from objectives + triage items)
14. Export screen with orphan warning + create objective action
15. NA slide-over with context-specific tab opening
16. Autosave (debounced writes on objective/triage/subtask changes)

## Key Behaviors to Preserve from Prototype

- Triage move buttons use first letter of target column (M/S/N) for compact UI
- Bloom verb picker: clicking a level expands a dropdown of verbs; selecting a verb auto-sets bloomLevel
- Anderson-Krathwohl picker: 2D grid table, clicking a cell expands verb list for that Process×Knowledge intersection
- AI Review lives inside the Composed Banner (toggle button), not floating above
- AI Review copy is conversational coaching with theory citations, not checkbox-style
- Validation sections show ✅/⚠️ indicators with contextual coaching notes
- Bloom's Distribution includes both bar chart AND interpretation table
- Export groups objectives under "Parent Task: [name]" headers
- All coaching notes use theory citations: (Mager, 1997), (Dirksen, 2016), (Merrill, 2013), (Dick, Carey & Carey, 2015)

## What NOT to Build Yet (Deferred)

- Gagné's Outcomes taxonomy tab
- Fink's Significant Learning taxonomy tab
- Task Analysis bilateral sync (placeholder only)
- Real AI integration (MOCK_AI=true, use static coaching logic from prototype)
- Drag-and-drop reordering in triage or objective list
- Push to Storyboard / Assessment Builder actual integration (buttons present but non-functional)

## Existing Codebase Patterns to Follow

- Check existing EDUTex components for Tailwind class conventions, button styles, form patterns
- Follow existing server action patterns (error handling, revalidation)
- Use existing autosave patterns if available (check storyboard editor for reference)
- Match existing slide-over/modal patterns for the NA Data panel
- Use existing Prisma client setup and connection patterns

## Reference File

The complete prototype is `learning-objectives-v6.jsx`. Use it as the visual and behavioral reference. All inline styles in the prototype should be converted to Tailwind classes matching EDUTex conventions. The color palette, font stack, spacing, and component structure should match the prototype exactly.
