# EDUTex Changelog

## v0.14.0 — February 28, 2026: Learning Objectives Wizard + Task Analysis UI

### Learning Objectives Wizard — New Feature
- 6-screen wizard: Context & Gap Check, Content Priority, Task Breakdown, Objective Builder (Guided/Freeform), Validation Dashboard, Export & Downstream Handoff
- Horizontal stepper with non-linear navigation and step status indicators
- Prisma schema additions: Objective fields (ABCD structured + freeform, bloom level/knowledge, priority, linked triage item), TriageItem, SubTask, GapClassification on Course
- API routes: `/api/courses/[courseId]/gap`, `/api/courses/[courseId]/triage-items` (with sub-tasks), `/api/courses/[courseId]/objectives`, `/api/objectives/[objectiveId]`
- Components: Stepper, NASlideOver, Screen1-6, ComposedBanner, ContextStrip, BloomVerbPicker, AKPicker, ObjCard
- Autosave on gap classification (debounced)
- View toggle between Guided (ABCD) and Freeform modes with data preservation in both directions

### NA Slide-Over — Bug Fix / Redesign
- **Problem:** Slide-over tabs were wrong — only 3 of 5 showing, questions categorized incorrectly, Screen 1 summary fields empty
- **Root cause:** `buildNASections()` and `buildNASummary()` used hardcoded guesses against courseAnalysis fields instead of actual submission responses from QUESTION_MAP
- **Fix:** Dynamic tab mapping layer in constants.ts routes QUESTION_MAP sections to 5 consolidated tabs prioritized by "What They Need to Do" as hero tab
- Tab structure: What They Need to Do > The System/Change > Who's Learning > Constraints & Environment > Project & Stakeholders
- `buildNASummary()` now pulls from specific question IDs (SYS_05, SYS_03, SYS_11, SHARED_06, SHARED_25) with courseAnalysis fallbacks
- Training-type-aware labels: NEW_SYSTEM shows "Business Problem" / "Current System / Process" / "Proficiency at Go-Live"
- Default slide-over tab changed from "Project Context" to "What They Need to Do"

### Content Priority Screen — UX Improvements
- Terminology: "Must" / "Should" changed to "Must Have" / "Should Have" / "Nice to Have" across all 6 wizard screens
- Always-visible coaching text per column: criteria, consequence, and decision question
- Move buttons: single-letter M/S/N replaced with directional arrow + target label
- Footer: theory citations (Mager 1997, Moore 2017) with left accent bar
- New items default to "Should Have" instead of "Must Have" to reduce scope creep

### Task Analysis UI — Overhaul
- New components: TaskAnalysisHeader, TaskInfoBanner, ReferencePanel, ModeSelector, TaskAnalysisListView
- Rebuilt components: LearnerContextSection, PriorityScoringPanel, ProceduralStepBuilder, TaskAnalysisDetailView, TaskIdentitySection

### Bugs Fixed
- `lib/courses/getCourseOverview.ts` — `courseType` missing from Prisma select
- `Screen5Validation.tsx` — hardcoded "Business Goal" label replaced with dynamic `naSummary.labels.businessGoal`

### Known Issues
- Other training types (PERFORMANCE_PROBLEM, COMPLIANCE, ROLE_CHANGE) have stub tab mappings — need full mapping when those forms are tested
- Drag-and-drop for Content Priority triage is deferred
- Objective autosave not yet implemented (gap classification autosave works)
- Push to Storyboard / Assessment Builder buttons present but non-functional
- Task Analysis bilateral sync is placeholder only
- Real AI integration deferred (MOCK_AI=true)

---

## [0.13.1] - 2026-02-21
### Fixed
- Stakeholder Data panels in Tasks & Competencies and Training Decision now filter by section title instead of hardcoded question IDs, enabling support for all training types (Performance Problem, New System, Compliance, Role Change)
- Reconciled migration history for multi-machine development (laptop/desktop)
- Merged needs-analysis-reconciliation branch to main with dashboard revamp

---

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
