# EDUTex Changelog

## v0.13.0 — February 17, 2026: Stakeholder Needs Analysis Reconciliation

Complete rewrite of the stakeholder question system and needs analysis UI. All four training types now have type-appropriate questions with instructional design guidance built into every question. System-specific questions scoped to NEW_SYSTEM only; other types get purpose-built learner profile sections.

### Question System Rewrite
- Rewrote `shared.ts`: 27 shared questions with ID-based architecture (SHARED_01–27 + SHARED_LEGACY_SUCCESS), organized into 6 sections with displayOrder ranges
- Rewrote `newSystem.ts`: 12 dynamic questions (SYS_01–12) across About the System, Business Justification, and What Users Need to Do
- Rewrote `performanceProblem.ts`: 8 questions (PERF_01–08) across Performance & Impact and Success Criteria, with extended ID notes including Mager diagnostic framework and training-as-%-of-solution analysis
- Rewrote `compliance.ts`: 7 questions (COMP_01–07) in Regulation or Policy section, with scenario-based design guidance and assessment type framework
- Rewrote `roleChange.ts`: 7 questions (ROLE_01–07) in New Role & Responsibilities section, with 30/60/90-day readiness evaluation framework
- Created `learnerProfiles.ts`: 16 type-specific audience questions replacing system-centric shared questions for non-NEW_SYSTEM types
  - Performance Problem ("Who's Affected"): LP_PERF_01–06B — roles/headcount, differential performance, skill level, motivation, nature of fix, conditional Change Champions
  - Compliance ("Who Must Comply"): LP_COMP_01–03 + 02B — roles/headcount, tiered requirements, compliance culture
  - Role Change ("Who's Transitioning"): LP_ROLE_01–03 — roles/headcount with current→new mapping, voluntary vs. imposed, readiness
- Added `REPEATING_TABLE` field type and `tableColumns` to QuestionDefinition
- Every question includes idNotes (ID guidance), stakeholderGuidance (plain-language help text), and many include idNotesExtended (deep-dive frameworks)

### Question Scoping
- Scoped "Who Will Use This System" section (SHARED_06–11) to NEW_SYSTEM only — replaced by LP_ questions for other types
- Scoped Rollout Plan section (SHARED_12–14) to NEW_SYSTEM only — "go-live" is a system deployment concept
- Scoped sandbox access, realistic data, and vendor training questions (SHARED_16–19) to NEW_SYSTEM only

### Needs Analysis UI
- Refactored NeedsAnalysisView with tabbed layout (Analysis, Stakeholders, Objectives, Success Metrics)
- New AnalysisTab with guided ID workflow panels
- New reference components: ProjectOverviewHeader, StakeholderReference, StakeholderResponseCards
- New analysis panels: AudienceProfiles, TasksCompetencies, SuccessCriteria, TrainingDecision, ObjectivesGuidance
- Fixed all stakeholder reference panel filters — replaced broken substring matching with explicit question ID Sets

### API & Types
- New API route: `/api/courses/[courseId]/analysis-context` — aggregates stakeholder data for analysis panels
- New API route: `/api/pages/[pageId]/course-analysis` — CRUD for course analysis records
- New `lib/types/courseAnalysis.ts` with AudienceProfileData, StakeholderSubmissionDisplay, and related types

### Schema
- New Prisma models for structured course analysis data
- Migration script: `scripts/migrate-needs-to-course-analysis.ts`

---

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
