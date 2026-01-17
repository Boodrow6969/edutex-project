# EDUTex Figma Design Specification

**Analysis Date:** December 30, 2025  
**Source:** 19 Figma PDF exports  
**Purpose:** Technical specification for implementation

---

## Design System Overview

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#2463EB` | Buttons, links, active states |
| Background | `#FFFFFF` | Main content area |
| Sidebar | `#1E293B` (dark navy) | Left navigation |
| Card BG | `#FFFFFF` | Content cards |
| Border | `#E5E7EB` | Card borders, dividers |
| Text Primary | `#111827` | Headings |
| Text Secondary | `#6B7280` | Descriptions, labels |
| Success | `#22C55E` | Published, completed, on-track |
| Warning | `#F59E0B` | Medium priority, in-progress |
| Danger | `#EF4444` | High priority, at-risk |
| Info | `#3B82F6` | Draft, open status |

### Typography (Inferred)
- Headings: Inter/System font, Bold, 24-32px
- Subheadings: Semi-bold, 18-20px
- Body: Regular, 14-16px
- Labels: Medium, 12-14px
- Captions: Regular, 12px, gray

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] EduTex          [@] Role Dropdown    [🌙] Dark Mode     │
│ AI-Powered Design                                               │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  SIDEBAR   │  MAIN CONTENT AREA                    [AI Panel]  │
│  ~180px    │  ~flex-1                              ~curved     │
│            │                                       blue blob   │
│  Main      │  ┌─────────────────────────────────┐              │
│  ─────     │  │ Page Header                     │              │
│  Dashboard │  │ Title + Description + Actions   │              │
│  Courses   │  └─────────────────────────────────┘              │
│  Learners  │                                                    │
│  Analytics │  ┌─────────────────────────────────┐              │
│  Content   │  │ Tab Bar (for course views)      │              │
│  Feedback  │  └─────────────────────────────────┘              │
│            │                                                    │
│  Security  │  ┌─────────────────────────────────┐              │
│  ─────     │  │ Content Cards / Forms           │              │
│  Audit     │  │                                 │              │
│            │  │                                 │  [AI Asst]   │
│            │  └─────────────────────────────────┘   button    │
│  [⚙]      │                                                    │
│  Settings  │                                                    │
└────────────┴────────────────────────────────────────────────────┘
```

---

## Role-Based Views

### Three User Roles with Distinct Dashboards

| Role | Dashboard Focus | Sidebar Visibility |
|------|-----------------|-------------------|
| **Instructional Designer** | My assignments, task queue, SME feedback, QA checklist | Full access |
| **Manager** | Program oversight, go-live readiness, resource utilization, risk tracker | Full access |
| **Stakeholder/SME** | Module review, feedback center, change log, alignment tracker | Limited (review-focused) |

---

## Screen Inventory

### Global Navigation Screens

| Screen | File | Key Components |
|--------|------|----------------|
| Designer Dashboard | `dashboard.pdf` | Module assignments (3 cards), Task queue, SME feedback tracker, QA metrics checklist, Recent updates feed |
| Manager Dashboard | `manager_dashboard.pdf` | Progress stats (4 cards), Go-live readiness (progress bars), Resource utilization, Performance chart, Risk tracker |
| Stakeholder Dashboard | `stakeholder_dashboard.pdf` | Module overview cards, Feedback & review center, Change log, Alignment tracker, Communication feed |
| Courses | `courses.pdf` | Course card grid, search, filters (status, author), grid/list toggle |
| Learners | `learners.pdf` | Learner list with avatar, progress bar, enrolled count, last active |
| Analytics | `analytics.pdf` | Line chart (engagement), Bar chart (time/module), Horizontal bars (pass rates), Pie chart (drop-off) |
| Content Assets | `content_assetts.pdf` | Media grid, type filters, file cards with tags, version, author |
| Feedback & QA | `feedback_and_QA.pdf` | Issue list with status/priority badges, assignee, comments, file links |
| Settings | `settings.pdf` | 4 tabs: Users, Permissions, Integrations, Branding |

### Course-Level Screens (Tab Bar Navigation)

**Tab Bar:** Needs Analysis | Task Analysis | Storyboard | Quiz Builder | Job Aids | Evaluation Plan

| Tab | File | Sub-structure |
|-----|------|---------------|
| **Needs Analysis** | `needs_analysis.pdf` (4 pages) | 4 sub-tabs: Problem, Stakeholders, Performance, Success Metrics |
| **Task Analysis** | `task_analysis.pdf` | Description only (minimal) |
| **Storyboard** | `storyboard_builder.pdf` | Empty state + Add Module modal |
| **Quiz Builder** | `quiz_builder.pdf` | Empty state + Add Question modal |
| **Job Aids** | `job_aid_manager.pdf` | Empty state + Create Job Aid modal |
| **Evaluation Plan** | `evaluation_plan.pdf` | Empty state only |

### Special Views

| Screen | File | Purpose |
|--------|------|---------|
| Course Landing/Workspace | `course_landing_page.pdf` | ADDIE-based status, Next Task, Upcoming Tasks |

---

## Needs Analysis Module - Detailed Specification

### Structure: 4 Sub-Tabs

#### Tab 1: Problem
```
┌─────────────────────────────────────────────────────────────┐
│ Problem Definition                                          │
│ Define the core problem to solve and business need          │
├─────────────────────────────────────────────────────────────┤
│ Problem Statement *                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Describe the specific problem or challenge...           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Business Need                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ What business outcome will this solve? Why important?   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Department / Division                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ e.g., Sales, Customer Support, Operations               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Reality Check                                               │
├─────────────────────────────────────────────────────────────┤
│ Constraints                                                 │
│ ┌───────────────────────────────────────────────────┐ [+]  │
│ │ Add a constraint (budget, time, resources...)     │      │
│ └───────────────────────────────────────────────────┘      │
│                                                             │
│ Assumptions                                                 │
│ ┌───────────────────────────────────────────────────┐ [+]  │
│ │ Add an assumption, e.g. What do Learners know?    │      │
│ └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 2: Stakeholders
```
┌─────────────────────────────────────────────────────────────┐
│ Learner Personas                                            │
│ Define the learner personas who will benefit                │
│ ┌───────────────────────────────────────────────────┐ [+]  │
│ │ e.g., New Sales Reps, Support Agents Level 1-2    │      │
│ └───────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│ Stakeholders                                                │
│ Identify key stakeholders who have interest                 │
│ ┌───────────────────────────────────────────────────┐ [+]  │
│ │ e.g., VP of Sales, Head of Customer Success       │      │
│ └───────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│ Subject Matter Experts (SMEs)                               │
│ Identify SMEs who will provide content expertise            │
│ ┌───────────────────────────────────────────────────┐ [+]  │
│ │ e.g., Product Manager, Technical Lead             │      │
│ └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 3: Performance
```
┌─────────────────────────────────────────────────────────────┐
│ Performance Analysis                                        │
│ Identify the gap between current and desired states         │
├─────────────────────────────────────────────────────────────┤
│ Current State                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Describe current performance level and what learners    │ │
│ │ are currently able to do...                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Desired State                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Describe target performance level and what learners     │ │
│ │ should be able to do after training...                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 4: Success Metrics
```
┌─────────────────────────────────────────────────────────────┐
│ Success Metrics (Kirkpatrick Model)                         │
│ Define how success will be measured across all four levels  │
├─────────────────────────────────────────────────────────────┤
│ Level 1: Reaction                                           │
│ How satisfied are learners with the training?               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ e.g., 85% positive satisfaction scores                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Level 2: Learning                                           │
│ Did learners acquire the intended knowledge and skills?     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ e.g., 80% pass rate on knowledge assessment             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Level 3: Behavior                                           │
│ Are learners applying what they learned on the job?         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ e.g., 70% demonstrate improved performance              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Level 4: Results                                            │
│ What business impact did the training achieve?              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ e.g., 15% improvement in customer satisfaction          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Patterns

### Empty State
```
┌─────────────────────────────────────────────────────────────┐
│                          [icon]                             │
│                                                             │
│                     No [Items] Yet                          │
│                                                             │
│         [Description of what can be created]                │
│                                                             │
│              [ + Create First [Item] ]                      │
│                    (primary button)                         │
└─────────────────────────────────────────────────────────────┘
```

### Card (Course/Module)
```
┌─────────────────────────────────────────────────────────────┐
│ Title                                        [status badge] │
│ Description text in gray...                                 │
│                                                             │
│ ⏱ Duration    Type                                         │
│                                                             │
│ Progress ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  70%    │
│                                                             │
│ 👥 [avatars]                    Last modified X days ago   │
│                                                             │
│ [ Edit ]  [share] [download]                               │
└─────────────────────────────────────────────────────────────┘
```

### Modal
```
┌─────────────────────────────────────────────────────────────┐
│ Modal Title                                            [X]  │
│ Subtitle/description                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Field Label                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Placeholder text...                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Field Label                          Field Label            │
│ ┌───────────────────────┐            ┌───────────────────┐  │
│ │ Dropdown         [v]  │            │ Dropdown      [v] │  │
│ └───────────────────────┘            └───────────────────┘  │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [Cancel]  [ Primary Action ]   │
└─────────────────────────────────────────────────────────────┘
```

### Status Badges
| Status | Background | Text |
|--------|------------|------|
| draft | `#DBEAFE` | `#1E40AF` |
| inprogress | `#FEF3C7` | `#92400E` |
| published | `#D1FAE5` | `#065F46` |
| open | `#DBEAFE` | `#1E40AF` |
| in-review | `#FEF3C7` | `#92400E` |
| resolved | `#D1FAE5` | `#065F46` |
| high | `#FEE2E2` | `#991B1B` |
| medium | `#FEF3C7` | `#92400E` |
| low | `#DBEAFE` | `#1E40AF` |

---

## Implementation Priority

### Phase 1: Core Layout + Navigation
1. Update Sidebar to match Figma (icons, groupings, active states)
2. Add role dropdown in top bar
3. Add AI Assistant floating button (right side)
4. Implement consistent page header pattern

### Phase 2: Needs Analysis (Our Focus)
1. Implement 4-tab structure within Needs Analysis
2. Build form fields for each tab
3. Add multi-input fields with [+] buttons (Constraints, Assumptions, Personas, etc.)
4. Wire to existing `analyzeNeeds` API
5. Save/load functionality

### Phase 3: Designer Dashboard
1. My Modules/Assignments cards
2. Task Queue list
3. SME Feedback Tracker
4. QA & Review Metrics checklist
5. Recent Updates Feed

### Phase 4: Course-Level Tools
1. Quiz Builder with modal
2. Storyboard Builder with modal
3. Job Aids Manager with modal
4. Evaluation Plan

### Phase 5: Additional Dashboards
1. Manager Dashboard
2. Stakeholder Dashboard

### Phase 6: Supporting Screens
1. Courses grid
2. Learners list
3. Analytics charts
4. Content Assets library
5. Feedback & QA
6. Settings

---

## Critical Design Decision

### Needs Analysis: Figma vs. Conversational Approach

**Figma shows a form-based approach:**
- 4 tabs with structured fields
- Direct data entry
- Comprehensive but potentially complex

**We previously designed a conversational approach:**
- 4 guiding questions
- Talking notes for IDs
- Simpler but less structured

**Recommendation:** Implement the Figma structure as the UI, but incorporate the conversational talking notes as:
1. Helper text under each section heading
2. An expandable "Guidance" panel
3. AI Assistant prompts in the right panel

This gives you the professional form structure while retaining the instructional design guidance.

---

*Document generated for EDUTex implementation planning*
