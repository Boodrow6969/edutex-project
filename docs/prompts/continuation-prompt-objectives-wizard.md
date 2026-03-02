# Learning Objectives Wizard — Continuation Prompt

## Context

The Learning Objectives Wizard is partially implemented. Schema, API routes, and 15 component files are in place. The build passes. A security hardening sprint happened in between, so the codebase may have changes to auth helpers, API route patterns, or middleware since the wizard was first built. **Search the project for current patterns before making changes.**

The design prototype is at `docs/learning-objectives-v6.jsx` — this is the visual and behavioral source of truth.

## What's Already Done

### Schema (migrated and applied)
- Objective model enhanced with: audience, verb, bloomKnowledge (BloomKnowledgeType enum), freeformText, objectivePriority (ObjectivePriority enum), requiresAssessment, wiifm, linkedTriageItemId, sortOrder
- New models: TriageItem, SubTask
- Course model: gapKnowledge, gapSkill booleans
- `title` field stores behavior text, `description` stores composed full-sentence objective

### API Routes (6 new + extended existing)
- PATCH /api/courses/[courseId]/gap
- GET/POST /api/courses/[courseId]/triage-items
- PATCH/DELETE /api/courses/[courseId]/triage-items/[itemId]
- POST /api/courses/[courseId]/triage-items/[itemId]/sub-tasks
- PATCH/DELETE .../sub-tasks/[subTaskId]
- Existing objectives routes extended for wizard fields

### Components (15 files)
Located in `app/workspace/[workspaceId]/course/[courseId]/objectives/`:
- ObjectivesWizard.tsx, Stepper.tsx, NASlideOver.tsx
- Screen1Context.tsx through Screen6Export.tsx
- BloomVerbPicker.tsx, AKPicker.tsx, ComposedBanner.tsx, ContextStrip.tsx, ObjCard.tsx
- types.ts, constants.ts

## What Needs To Be Done

### 1. Functional Verification & Bug Fixes
Before adding anything new, verify each screen works end-to-end. Search for the current implementation of each component and test against the prototype behavior:

- **Screen 1**: Gap checkboxes save via API and reload on revisit
- **Screen 2**: Triage items CRUD works (create, move between columns, delete). Custom items persist.
- **Screen 3**: Sub-tasks add/edit/delete under parent tasks. Accordion expand/collapse works.
- **Screen 4**: 
  - Guided mode: ABCD fields save, Bloom verb picker and AK picker both set bloomLevel correctly, Composed Banner updates live, AI Review toggle works
  - Freeform mode: textarea saves to freeformText field
  - **Guided ↔ Freeform switching**: When switching to Guided with existing freeform text, a blue reference strip must appear above ABCD fields showing the original text. When switching to Freeform with existing ABCD data, textarea auto-populates from composed ABCD fields. Neither direction destroys data.
  - Link to Parent Task dropdown works in both modes
- **Screen 5**: Validation cards compute correctly from real objective data (traceability, Bloom's distribution bar chart, priority breakdown, assessment alignment)
- **Screen 6**: Objectives grouped by parent task. Orphan warning shows for uncovered tasks. "Create Objectives" button navigates to builder AND creates a blank objective.

### 2. Needs Analysis Data Integration
The NA slide-over (NASlideOver.tsx) may be using hardcoded placeholder data from the prototype. It needs to pull from the actual Needs Analysis submission for the current course.

- Search for how Needs Analysis data is stored (likely in a Page with type NEEDS_ANALYSIS or similar, with blocks/JSON content)
- The slide-over has 5 tabs: Project Context, About the System, Audience & Learner Profile, Constraints & Environment, Stakeholder Pain Points
- Each tab should populate from real NA submission data
- If no NA submission exists for this course, show an empty state with a link to start one
- The slide-over must open to context-specific tabs — check that the `defaultTab` prop is wired correctly from each trigger point:
  - Parent Tasks section → "system" tab
  - Audience Data button → "audience" tab  
  - Condition/System Info button → "system" tab
  - Freeform header button → "project" tab
  - Global header button → "project" tab

### 3. Triage Pre-Population from Needs Analysis
Screen 2 (Content Priority) should pre-populate triage items from NA-identified tasks when a course first enters the wizard and has no existing triage items.

- Search for where NA stores identified tasks/skills (likely in the stakeholder submission data)
- On first load with zero triage items: auto-create TriageItem records from NA tasks, all defaulting to "must" column, source="NA"
- If triage items already exist, don't re-populate (user has already organized them)

### 4. Navigation Behavior Verification
- `Continue →` advances to next sequential step
- `skip to builder` jumps to Screen 4 — only visible on Screens 1, 2, 3
- `← Back` goes to previous step — hidden on Screen 1
- All stepper tabs are clickable anytime (non-linear)
- Step status indicators update: ○ (not started), ◑ (in progress), ● (complete)

### 5. Autosave
- Gap classification (Screen 1): debounced save on checkbox change
- Triage items (Screen 2): save on move/create/delete (immediate, not debounced)
- Sub-tasks (Screen 3): debounced save on text change, immediate on status change
- Objectives (Screen 4): debounced save following existing autosave pattern (search for TaskAnalysisDetailView.tsx for the pendingRef + flushSave pattern)

### 6. Terminology Consistency Check
Search all wizard files and verify:
- "Parent Task" used everywhere (never "linked task" or just "task" when referring to NA-sourced task)
- "Needs Analysis Data" full label everywhere (never "NA Data" or "NA")
- Priority tiers: Must / Should / Nice to Have (unified across triage, editor, validation, export)

## What Is NOT Being Built (Deferred)
Do not implement any of these:
- Gagné's Outcomes or Fink's Significant Learning taxonomy tabs
- Task Analysis bilateral sync (placeholder only)
- Real AI integration (keep static coaching logic)
- Drag-and-drop reordering
- Push to Storyboard / Assessment Builder actual integration (buttons present, non-functional)
- Export to .docx/.pdf (button present, non-functional)
- Copy to Design Strategy / HLDD (button present, non-functional)

## Important Codebase Notes
- **Security work happened since initial implementation.** Search for current auth patterns before modifying API routes. Look at `lib/auth-helpers.ts` for getCurrentUserOrThrow, assertCourseAccess, errorResponse.
- API routes use the try/catch + auth + errorResponse pattern — no server actions.
- The app uses Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL.
- React 19: useRef requires initial value (e.g., `useRef<T>(undefined)` not `useRef<T>()`).
- Color palette: primary #03428e, primary-light #e8eef7, border #e2e8f0, text #1e293b, muted #64748b.
- Font: Segoe UI stack.

## How To Proceed
1. Search the project to understand current state of each wizard component
2. Run the app and navigate to the objectives wizard to see what works vs. what doesn't
3. Fix issues in priority order: data loading → CRUD operations → autosave → NA integration → triage pre-population
4. After each fix, verify `npm run build` still passes
