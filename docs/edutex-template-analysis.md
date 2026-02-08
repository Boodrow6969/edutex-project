# EDUTex Template Analysis & Integration Specification

> **Migration Note (2026-02-08):** The `Project` model was renamed to `Course` and `projectId` FKs were renamed to `courseId`. References to `projectId` in data models below reflect the original spec.

**Analysis Date:** December 30, 2025  
**Source:** LDT Standard Templates (28 files)  
**Purpose:** Define data models, input/output mapping, and business stakeholder requirements for EDUTex platform integration

---

## Executive Summary

This analysis examines 28 instructional design templates currently used in professional practice. The templates span the full ADDIE lifecycle and reveal clear patterns for what EDUTex must:

1. **Collect as INPUT** — Data gathered during analysis and design phases
2. **Generate as OUTPUT** — Deliverables for stakeholders, facilitators, and learners
3. **Support for BUSINESS QUANTIFICATION** — Metrics, KPIs, and ROI data for managers

The templates demonstrate a sophisticated workflow that connects business needs to measurable training outcomes—exactly the pipeline EDUTex aims to systematize.

---

## Template Inventory & Classification

### Category 1: Analysis & Intake (INPUT-focused)
| Template | Purpose | EDUTex Module |
|----------|---------|---------------|
| Training Needs Analysis 2025.xlsx | Gap analysis: Org goals → Dept goals → Skills → Training recommendations | Needs Analysis |
| Course Intake Form Template | Project initiation metadata, audience, logistics | Project Setup |
| Business Need Analysis (in ADDIE Strategy) | 10-question stakeholder interview framework | Needs Analysis |

### Category 2: Design Strategy (CORE DESIGN)
| Template | Purpose | EDUTex Module |
|----------|---------|---------------|
| ADDIE Design Strategy Template | Multi-sheet design document: Business Need → Design Strategy → Lessons → Communication | Design Strategy |
| Power of 5 Design Strategy | Persona-based curriculum design with differentiated content by audience level | Design Strategy |
| HLDD Template | High-Level Design Document—formal agreement/contract with stakeholders | Design Documentation |
| Project Charter Template | Project scope, milestones, governance | Project Management |

### Category 3: Development Guides (OUTPUT-focused)
| Template | Purpose | EDUTex Output |
|----------|---------|---------------|
| Storyboard Template | Visuals + Script for eLearning/video | Storyboard Generator |
| Facilitator Guide Template | Instructor materials, scripts, logistics | Facilitator Guide Generator |
| Participant Guide Template | Learner workbooks, activities | Participant Materials |
| Job Aid Template | Quick-reference performance support | Job Aid Generator |
| Reference Guide Template | Comprehensive reference documentation | Reference Materials |

### Category 4: Project Management & QA
| Template | Purpose | EDUTex Feature |
|----------|---------|---------------|
| Project Plan Template | Timeline, milestones, resource allocation | Project Dashboard |
| Project Kickoff Template (PPTX) | Stakeholder presentation | Export/Presentation |
| Instructional Design Checklist | ADDIE phase checklist | Task Management |
| Course QA Checklist | Quality assurance validation | QA Module |
| Test Plan Template | LMS testing protocol | Testing Module |

### Category 5: Supporting Materials
| Template | Purpose |
|----------|---------|
| Curriculum/Program Map | Multi-course program architecture |
| Executive Summary Template | Leadership briefing document |
| Communication Plan | Stakeholder communication schedule |
| Manager's Toolkit | Manager support materials |
| Policy/Procedure Templates | Documentation standards |

---

## Data Models for EDUTex

### Model 1: BusinessNeedAnalysis

Derived from the 10-question Business Need Analysis framework.

```typescript
interface BusinessNeedAnalysis {
  id: string;
  projectId: string;
  
  // Core Questions (mapped to Design Strategy fields)
  opportunityOrProblem: string;           // Q1 → Business Challenge/Opportunity
  businessGoal: string;                    // Q2 → Business Goal
  targetPerformers: string[];              // Q3 → Audience definition
  performanceRequirements: string;         // Q4 → Knowledge, Skills, Attitudes
  performanceGap: string;                  // Q5 → Training Evaluation basis
  risksToPerformance: string[];            // Q6 → Risk factors
  performanceActivators: string[];         // Q7 → Reinforcement strategies
  supportingStakeholders: StakeholderRole[]; // Q8 → Training as % of Solution
  kpis: KPI[];                             // Q9 → Training Evaluation metrics
  personaDescriptions: Persona[];          // Q10 → Audience personas
  
  // Metadata
  interviewDate: Date;
  interviewedBy: string;
  stakeholderName: string;
  status: 'draft' | 'reviewed' | 'approved';
}

interface KPI {
  metric: string;
  currentValue?: string;
  targetValue?: string;
  measurementMethod: string;
}

interface Persona {
  name: string;
  level: string;           // e.g., "Managing Director", "Team Manager"
  workType: string;
  customerFacing: boolean;
  characteristics: string;
}
```

### Model 2: DesignStrategy

Central design document that connects business needs to training solution.

```typescript
interface DesignStrategy {
  id: string;
  projectId: string;
  needsAnalysisId: string;
  
  // Business Alignment
  businessChallenge: string;              // From Q1
  businessGoal: string;                   // From Q2
  
  // Solution Breakdown
  trainingAsPercentOfSolution: SolutionComponent[];
  
  // Evaluation Strategy (Kirkpatrick + ROI)
  evaluationPlan: {
    level1Reactions: EvaluationMethod;
    level2Learning: EvaluationMethod;
    level3Behavior: EvaluationMethod;
    level4Results: EvaluationMethod;
    level5ROI?: EvaluationMethod;
  };
  
  // Data Collection Methods
  dataCollectionMethods: {
    level: 1 | 2 | 3 | 4 | 5;
    method: string;
    timing: string;
    responsible: string;
  }[];
  
  // Curriculum Structure
  lessons: Lesson[];
  
  // Communication Plan
  communicationPlan: CommunicationItem[];
  
  status: 'draft' | 'stakeholder_review' | 'approved';
}

interface SolutionComponent {
  component: string;        // e.g., "Training", "Leadership Reinforcement", "Peer Accountability"
  percentage: number;       // e.g., 0.20 for 20%
  description?: string;
}

interface EvaluationMethod {
  description: string;
  metrics: string[];
  dataSource: string;
}
```

### Model 3: Lesson

Detailed lesson design with all instructional components.

```typescript
interface Lesson {
  id: string;
  designStrategyId: string;
  
  // Core Fields (in recommended completion order)
  lessonName: string;                      // Field 1
  objective: string;                       // Field 2
  assessment: string;                      // Field 3
  activities: string;                      // Field 4
  skillsLearned: string[];                 // Field 5
  knowledge: string;                       // Field 6
  reinforcement: string;                   // Field 7
  durationMinutes: number;                 // Field 8
  
  // Persona targeting (for differentiated curricula)
  targetPersona?: string;                  // e.g., "Managing Director", "Team Manager"
  
  // Sequence
  sequenceOrder: number;
  dayNumber?: number;                      // For multi-day programs
  isPrework: boolean;
  
  // Design Notes
  designNotes?: string;
  facilatorNotes?: string;
}
```

### Model 4: HLDD (High-Level Design Document)

Formal stakeholder agreement document.

```typescript
interface HLDD {
  id: string;
  projectId: string;
  
  // Project Information
  businessCase: string;
  requestedBy: string[];
  stakeholders: string[];
  strategicLearningConsultant: string;
  instructionalDesigner: string;
  
  // Objectives & Measurement
  projectObjectives: string[];
  businessKPIs: string[];
  
  // Audience
  targetAudience: string;
  secondaryAudience?: string;
  
  // Curriculum Elements (up to 5)
  curriculumElements: CurriculumElement[];
  
  // Assessment & LMS
  assessmentPlan: string;
  lmsStrategy: string;
  behaviorMeasurementMethod: string;
  completionReportingNeeded: boolean;
  
  // Post-Implementation
  businessLeaderActions: string[];
  ldtActions: string[];
  closeOutObjectives: string;
  
  // Timeline & Risk
  estimatedDeliveryDate: Date;
  risksToTimeline: string[];
  
  // Governance
  reviewersApprovers: string[];
  finalSignOffApprover: string;
  businessSMEs: string[];
  projectReporting: string;
  
  // Signatures
  signatures: {
    client: { name: string; date?: Date; signed: boolean };
    slc: { name: string; date?: Date; signed: boolean };
    slcManager: { name: string; date?: Date; signed: boolean };
  };
}

interface CurriculumElement {
  name: string;
  description: string;
  deliveryMethod: string;
  duration: string;
}
```

### Model 5: CourseIntake

Project initiation and logistics.

```typescript
interface CourseIntake {
  id: string;
  
  // Metadata
  formCreatedBy: string;
  dateSubmitted: Date;
  
  // Course Overview
  title: string;
  duration: string;
  description: string;
  courseOwner: string;
  sme: string;
  topic: string;
  
  // Audience & Access
  intendedAudience: string;
  isMandatory: boolean;
  mandatoryConditions?: string;
  isPartOfCurriculum: boolean;
  curriculumName?: string;
  hasPrerequisite: boolean;
  prerequisiteName?: string;
  
  // Delivery
  deliveryType: 'in-person' | 'online' | 'hybrid' | 'other';
  deliveryTypeOther?: string;
  selfEnrollment: boolean;
  searchable: boolean;
  certificateOnCompletion: boolean;
  
  // Assignment
  assignOnCreation: boolean;
  assignmentGroup?: string;
  enrollmentList?: { firstName: string; lastName: string; email: string }[];
  
  // Dates
  availableDate: Date;
  dueDate?: Date;
  daysAfterAssignment?: number;
  
  // In-Person Details (if applicable)
  inPersonDetails?: {
    location: string;
    sessionType: 'single' | 'multi-day';
    dates: Date[];
    times: string;
  };
}
```

---

## Business Stakeholder Outputs

These are the key outputs managers and executives need from EDUTex:

### 1. Executive Briefing Data
Derived from Executive Summary Template:

```typescript
interface ExecutiveBriefing {
  projectId: string;
  
  eventOverview: {
    title: string;
    dates: string;
    location: string;
    purpose: string;
  };
  
  keyWins: string[];
  majorOpportunities: string[];
  nextSteps: string[];
  acknowledgments: string;
  
  // Quantified Results
  metrics: {
    participantCount: number;
    completionRate: number;
    satisfactionScore: number;
    levelTwoResults?: string;
    levelThreeResults?: string;
    levelFourResults?: string;
    roi?: string;
  };
}
```

### 2. Training as % of Solution Report
Critical for setting business expectations:

```typescript
interface SolutionBreakdownReport {
  projectId: string;
  businessGoal: string;
  
  components: {
    name: string;
    percentage: number;
    owner: string;
    status: 'planned' | 'in-progress' | 'complete';
  }[];
  
  // Visual: Pie chart showing training vs. other interventions
  // Message: "Training alone won't solve this—here's the full picture"
}
```

### 3. Evaluation Dashboard
Kirkpatrick levels with business-friendly metrics:

```typescript
interface EvaluationDashboard {
  projectId: string;
  
  level1: {
    metric: string;            // e.g., "NPS", "Satisfaction Score"
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  
  level2: {
    assessmentType: string;
    passRate: number;
    averageScore: number;
  };
  
  level3: {
    behaviorChange: string;
    measurementMethod: string;
    observedChange: string;
  };
  
  level4: {
    businessOutcome: string;
    kpiImpact: string;
    attribution: string;
  };
  
  level5?: {
    investmentCost: number;
    measuredBenefit: number;
    roi: number;
  };
}
```

### 4. KPI Tracking Report
Links training to business metrics:

```typescript
interface KPITrackingReport {
  projectId: string;
  reportDate: Date;
  
  kpis: {
    name: string;
    baseline: string;
    target: string;
    current: string;
    trainingContribution: string;
    notes: string;
  }[];
  
  // Visual: Progress bars or trend charts
}
```

---

## Input → Output Flow

This diagram shows how data flows through EDUTex:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INPUTS                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Course Intake Form          →  Project metadata, logistics         │
│  Business Need Analysis      →  10 questions, stakeholder data      │
│  Training Needs Analysis     →  Org/Dept goals, skills, gaps        │
│  SME Interviews              →  Content, context, constraints       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDUTEX PROCESSING                               │
├─────────────────────────────────────────────────────────────────────┤
│  Needs Analysis Module       →  Structured problem definition       │
│  Objective Generator         →  Measurable learning objectives      │
│  Activity Pattern Matcher    →  Theory-grounded activities          │
│  Evaluation Planner          →  Kirkpatrick alignment               │
│  Curriculum Architect        →  Lesson sequencing                   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          OUTPUTS                                     │
├─────────────────────────────────────────────────────────────────────┤
│  FOR STAKEHOLDERS                                                    │
│    • HLDD (agreement document)                                       │
│    • Project Charter                                                 │
│    • Executive Summary / Briefing                                    │
│    • KPI Tracking Report                                             │
│    • Evaluation Dashboard                                            │
│                                                                      │
│  FOR DESIGNERS                                                       │
│    • Design Strategy Document                                        │
│    • Lesson Plans                                                    │
│    • Storyboards                                                     │
│    • ID Checklist                                                    │
│                                                                      │
│  FOR FACILITATORS                                                    │
│    • Facilitator Guide                                               │
│    • Communication Plan                                              │
│    • Manager's Toolkit                                               │
│                                                                      │
│  FOR LEARNERS                                                        │
│    • Participant Guide                                               │
│    • Job Aids                                                        │
│    • Reference Guides                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Critical Field Mappings

### Business Need Analysis → Design Strategy

| BNA Question | Design Strategy Field |
|--------------|----------------------|
| Q1: What is the opportunity/problem? | Business Challenge/Opportunity |
| Q2: What is the business goal? | Business Goal |
| Q4: Performance requirements? | Knowledge, Skills, Attitudes |
| Q5: Difference in performance needed? | Training Evaluation basis |
| Q8: Who supports the goal? | Training as % of Solution |
| Q9: KPIs that measure performance? | Training Evaluation metrics |
| Q10: Persona descriptions? | Audience segmentation |

### Design Strategy → HLDD

| Design Strategy | HLDD Field |
|-----------------|------------|
| Business Challenge | Business Case |
| Business Goal | Project Objectives |
| Training Evaluation metrics | Business KPIs |
| Lessons summary | Curriculum Elements |
| Evaluation Plan | Assessment Plan |

### Lesson → Facilitator Guide

| Lesson Field | Facilitator Guide Section |
|--------------|--------------------------|
| Lesson Name | Lesson Title |
| Objective | Learning Objective |
| Duration | Timeline |
| Activities | Instructions |
| Knowledge | Content/Concepts |
| Assessment | Debrief/Check Questions |
| Reinforcement | Post-Training Actions |

---

## Persona-Based Curriculum Pattern

The Power of 5 template reveals a sophisticated pattern for differentiated training:

```typescript
interface PersonaBasedCurriculum {
  programName: string;
  
  // Shared competency themes across all personas
  competencyThemes: string[];   // e.g., ["Setting Expectations", "Coaching", "Accountability", "Engagement", "Change"]
  
  // Differentiated by persona
  personaTracks: {
    persona: string;           // e.g., "Managing Director"
    focusArea: string;         // e.g., "Enterprise-level strategic"
    lessons: {
      theme: string;
      lessonName: string;
      objective: string;
      format: string;          // "Micro video", "Case study", "eLearning"
      duration: string;
      reinforcement: string;
    }[];
  }[];
}
```

**Key Insight:** The same competency is taught differently based on organizational level:
- **Managing Directors**: Strategic/enterprise focus, mentor others, model accountability
- **Directors**: Translate strategy to department OKRs, build systems
- **Managers**: Day-to-day coaching, team-level implementation
- **Team Managers**: Daily execution, on-the-job reinforcement

---

## Recommended EDUTex Feature Priorities

### Phase 1: Core Analysis Pipeline (Current Focus)
1. ✅ Needs Analysis Module (4-question framework)
2. 🔄 Business Need Analysis integration (10-question interview)
3. 🔜 Objective Generator with Bloom's alignment
4. 🔜 KPI definition and tracking setup

### Phase 2: Design Strategy Generation
1. Design Strategy document generator
2. Lesson planning with activity patterns
3. Evaluation plan builder (Kirkpatrick)
4. Training-as-%-of-solution calculator

### Phase 3: Stakeholder Outputs
1. HLDD generator (formal agreement document)
2. Executive Summary generator
3. KPI dashboard / Evaluation dashboard
4. Project status reporting

### Phase 4: Development Outputs
1. Storyboard generator
2. Facilitator Guide generator
3. Participant Guide generator
4. Job Aid generator

### Phase 5: Advanced Features
1. Persona-based curriculum builder
2. Multi-course program architecture
3. Communication plan generator
4. LMS integration preparation

---

## Appendix: Template File Index

| File | Type | Primary Use | EDUTex Relevance |
|------|------|-------------|------------------|
| ADDIE Design Strategy Template - 2025.xlsx | Excel (9 sheets) | Full design workflow | HIGH - Core data model |
| Course Intake Form Template - 2025.xlsx | Excel | Project initiation | HIGH - Project setup |
| Course QA checklist.docx | Word | Quality assurance | MEDIUM - QA module |
| Curriculum or Course Overview Template 2025.docx | Word | Program architecture | MEDIUM - Curriculum view |
| Curriculum_Program Map Template.docx | Word | Multi-course mapping | MEDIUM - Program view |
| Email Communication Plan Template 2025.docx | Word | Stakeholder comms | LOW - Export feature |
| Executive Summary Template 2025.docx | Word | Leadership briefing | HIGH - Stakeholder output |
| Facilitator Guide Template 2025.docx | Word | Instructor materials | HIGH - Output generator |
| HLDD Template.docx | Word | Formal agreement | HIGH - Core output |
| Instructional_Design_Checklist.docx | Word | ADDIE phase checklist | MEDIUM - Task tracking |
| Job Aid Template 2025.docx | Word | Performance support | HIGH - Output generator |
| LDT Job Aid Template 2025.docx | Word | Internal job aid | LOW - Reference |
| LDT Standard Templates Usage Guide.xlsx | Excel | Template guidance | LOW - Documentation |
| Managers Toolkit Template 2025.docx | Word | Manager support | MEDIUM - Output |
| NEW Executive Summary Survey Results Template 2025.docx | Word | Survey-based summary | MEDIUM - Evaluation |
| Participant Guide Template 2025.docx | Word | Learner workbook | HIGH - Output generator |
| Policy Template - Blank - 01.07.25.docx | Word | Policy documentation | LOW - Reference |
| Power of 5 Design Strategy.xlsx | Excel (4 sheets) | Persona-based design | HIGH - Advanced feature |
| Procedure Template - Blank - 01.07.25.docx | Word | Procedure docs | LOW - Reference |
| Program Implementation and Logistics Guide.docx | Word | Rollout planning | MEDIUM - Implementation |
| Project Charter Template 2025.docx | Word | Project governance | MEDIUM - Project setup |
| Project Kickoff Template 2025.pptx | PowerPoint | Stakeholder kickoff | LOW - Export feature |
| Project Plan Template 2025.xlsx | Excel | Timeline/milestones | MEDIUM - Project mgmt |
| Reference Guide Template 2025.docx | Word | Comprehensive reference | MEDIUM - Output |
| Storyboard Template 2025.docx | Word | eLearning design | HIGH - Output generator |
| Test Plan Template for new LMS Courses - 2025.xlsx | Excel | LMS testing | LOW - QA feature |
| Training Needs Analysis 2025.xlsx | Excel | Gap analysis | HIGH - Needs module |
| Zenarate _JA 2025 .docx | Word | Specific job aid | LOW - Reference |

---

*Document generated for EDUTex project knowledge integration*
