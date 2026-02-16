Read the file docs/STATUS.md. Then make these two updates:

FILE 1: Create a new file CHANGELOG.md in the project root with this content:

# EDUTex Changelog

## v0.12.0 — February 13, 2026: Machine-Consumability Migration

Schema and type system overhaul to make all data structures machine-readable for future adaptive engine integration. No UI changes, no feature behavior changes — all new fields are optional.

### Workstream 1: String-to-Enum Conversions
- Added 7 new Prisma enums: CourseStatus, CoursePhase, CourseType, StoryboardStatus, CurriculumStatus, ConstraintType, BlueprintPriority
- Converted 9 string fields to proper enums across Course, Curriculum, Storyboard, BlueprintObjective, and Constraint models
- Updated 21 files: API routes, components, modals, hooks, types, and seed data
- courseType field upgraded from free text input to structured dropdown with 7 options
- Phase dropdown now uses ADDIE-aligned values (Intake, Analysis, Design, Development, Implementation, Evaluation)

### Workstream 2: LearningTask Model
- New LearningTask model for instructional task analysis (separate from project management Task model)
- 4 new enums: TaskFrequency, TaskCriticality, TaskComplexity, KnowledgeType
- Self-referential hierarchy for task decomposition (parentTaskId)
- External taxonomy mapping (externalId/externalSource) for O*NET, ESCO, or internal competency codes
- Design decision capture (rationale, aiGenerated, aiReasoning)
- Links to TaskAnalysis for future migration from JSON blob to individual records

### Workstream 3: Objective Links and Assessment Infrastructure
- New AssessmentItem model with 9-value AssessmentType enum (Quiz Builder foundation)
- ObjectiveTaskLink join table: many-to-many Objective to LearningTask
- ObjectiveAssessmentLink join table with Bloom's level alignment tracking
- Objective model extended: Mager's ABCD (condition/criteria), external taxonomy mapping, design rationale fields
- External ID fields (externalId/externalSource) added to Course and Curriculum models

### Workstream 4: Block Content Contracts
- Added _type discriminator to all 13 block content interfaces
- Split flat ContentScreenContent into 6 per-screenType sub-interfaces (Content, Video, Practice, Assessment, Scenario, TitleIntro)
- Added type guard functions: isContentScreen, isVideoScreen, isAssessmentScreen, isScenarioScreen
- Updated all 9 createDefault factories with _type field
- Injected _type into sync.ts nodeToBlock for all content paths
- Zero database changes — TypeScript only

### Workstream 5: Design Rationale Fields
- NeedsAnalysis: isTrainingSolution, nonTrainingFactors, solutionRationale, aiAnalysis, aiRecommendations
- Storyboard: designApproach, mediaSelectionNotes

### Database Migrations
- 20260213161302_convert_strings_to_enums
- 20260213211628_add_learning_task_model
- 20260213220225_add_objective_links_and_assessment_items
- 20260213224029_add_design_rationale_fields

---

## v0.11.0 — February 9, 2026
Content Assets Phase A+B — ContentAsset model, local storage service, full CRUD API, reusable components, storyboard integration (Content, Title/Intro, Video screens).

## v0.10.0 — February 8, 2026
Archive/restore for workspaces, courses, curricula. Delete confirmation modals. Toast notification system. Sidebar context menus. Enhanced workspace DELETE with name confirmation and transactional cascade.


FILE 2: Update docs/STATUS.md with these changes:

1. Change "Last Updated" to: February 13, 2026
2. Change "Current Version" to: 0.12.0
3. In the "What's Built" section, add a new subsection after "Stakeholder Needs Analysis" and before the "---" separator:

### Machine-Consumable Data Layer — Complete (v0.12.0)
- 9 string fields converted to proper Prisma enums across 5 models
- LearningTask model with enum-typed task analysis attributes and hierarchical decomposition
- AssessmentItem model with 9 assessment types (Quiz Builder foundation)
- Objective to LearningTask and Objective to AssessmentItem join tables with alignment tracking
- Objective extended with Mager's ABCD components, external taxonomy mapping, design rationale
- External ID fields on Course, Curriculum, Objective, LearningTask for LMS/taxonomy integration
- Block content _type discriminators on all 13 content interfaces
- ContentScreen split into 6 typed sub-interfaces matching sync.ts field sets
- Design rationale fields on NeedsAnalysis and Storyboard
- 4 database migrations, zero breaking changes

4. In "Recently Completed", add this line at the top (before the v0.11.0 entry):
- **v0.12.0 (Feb 13, 2026):** Machine-consumability migration — 7 new enums, LearningTask model, AssessmentItem model, Objective link tables, block content contracts with _type discriminators, design rationale fields. 4 schema migrations, 5 workstreams, zero breaking changes.

Do not change anything else in STATUS.md.
