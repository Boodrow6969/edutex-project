# EDUTex Stakeholder Needs Analysis — Accumulated Changes
## Changes since the Cursor implementation (SHARED rewrite + NEW_SYSTEM 12 questions + PERF/COMP/ROLE dynamic sections)

**Purpose:** Complete spec for all changes discussed after the last successful build. This is the single prompt document for Claude Code.

---

## Change 1: Section Rename — Role Change

**File:** `lib/questions/roleChange.ts`
**Status:** ALREADY DONE by user in Cursor.

All ROLE_ questions: `section` changed from `"The Change"` to `"New Role & Responsibilities"`.

No further action needed.

---

## Change 2: Section Rename — Performance Problem

**File:** `lib/questions/performanceProblem.ts`

All PERF_01 through PERF_06 currently have `section: "The Problem"`. Change to `"Performance & Impact"`.

PERF_07 and PERF_08 currently have `section: "Success Criteria"`. Keep as-is.

---

## Change 3: Scope "Who Will Use This System" to NEW_SYSTEM only

**File:** `lib/questions/shared.ts`

The following questions currently have `appliesTo: "ALL"`. Change to `appliesTo: [TrainingType.NEW_SYSTEM]`:

| ID | Question | Reason |
|---|---|---|
| SHARED_06 | Audience by Role (table) | Replaced by type-specific LP_ questions |
| SHARED_07 | Role-Based Differences (select) | Replaced by type-specific LP_ questions |
| SHARED_07B | Role-Based Differences (detail) | Conditional on SHARED_07 |
| SHARED_08 | Technology Comfort Level | System-specific |
| SHARED_09 | Prior System Experience | System-specific |
| SHARED_09B | Prior System Duration | Conditional on SHARED_09 |

These questions retain their current `section: "Who Will Use This System"` — that section name is now only seen by NEW_SYSTEM stakeholders.

---

## Change 4: Scope Rollout Plan to NEW_SYSTEM only

**File:** `lib/questions/shared.ts`

The following questions currently have `appliesTo: "ALL"`. Change to `appliesTo: [TrainingType.NEW_SYSTEM]`:

| ID | Question | Reason |
|---|---|---|
| SHARED_12 | Rollout Approach | System deployment concept |
| SHARED_12B | Rollout Approach (conditional detail for phased/pilot) | Conditional on SHARED_12 |
| SHARED_13 | Phase Details (table) | System deployment concept |
| SHARED_14 | Training-to-Go-Live Timing | "Go-live" is system language |

These questions retain their current `section: "Rollout Plan"` — only seen by NEW_SYSTEM stakeholders.

---

## Change 5: Scope Change Champions to NEW_SYSTEM only

**File:** `lib/questions/shared.ts`

| ID | Current `appliesTo` | New `appliesTo` | Reason |
|---|---|---|---|
| SHARED_10 | ALL | `[TrainingType.NEW_SYSTEM]` | Train-the-trainer only applies to system deployments as a shared concept. Performance Problem gets a conditional version (see Change 7). Compliance and Role Change don't need it. |

---

## Change 6: Delete Post-Training Support from non-system types

**File:** `lib/questions/shared.ts`

| ID | Current `appliesTo` | New `appliesTo` | Reason |
|---|---|---|---|
| SHARED_11 | ALL | `[TrainingType.NEW_SYSTEM]` | Post-go-live support is a system deployment concept. Other types don't have an equivalent need for this question. |

---

## Change 7: Create Learner Profile questions

**File to create:** `lib/questions/learnerProfiles.ts`

Export as `learnerProfileQuestions: QuestionDefinition[]`

### PERFORMANCE PROBLEM — Section: "Who's Affected"

#### LP_PERF_01 — Learner Roles and Headcount *
**questionText:** "What job roles or groups are experiencing this performance issue? For each, provide approximate headcount and how often they perform the affected tasks."

**idNotes:** "Not everyone in a role may have the same problem. Push during review: is this the entire team or a subset? If it's a subset, what distinguishes the low performers from the high performers? That distinction is your design gold — it tells you what the high performers do differently, which becomes your training content."

**stakeholderGuidance:** "Tell us which roles are affected and how many people. Include how often they perform the tasks in question — daily issues need different solutions than quarterly ones.\n\n*Examples: \"45 customer service reps — handle these calls daily, about 60% are making errors\" / \"All 12 warehouse leads — this comes up during monthly inventory counts\"*"

**fieldType:** `FieldType.REPEATING_TABLE`
**tableColumns:** `["Role / Title", "Approx. Headcount", "Frequency (Daily / Weekly / Occasionally)"]`
**required:** true
**displayOrder:** 500
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`

---

#### LP_PERF_02 — Learner Differences
**questionText:** "Do different roles or groups experience this problem differently? Does one group struggle more than another?"

**idNotes:** "Differential performance across groups is a massive clue. If Group A does fine and Group B struggles with the same task, the difference is rarely knowledge — it's usually environment, tools, management, workload, or training history. This directly informs whether you build one training or differentiated paths."

**stakeholderGuidance:** "If some teams or roles have a bigger problem than others, tell us. This helps us focus where the need is greatest.\n\n*Examples: \"The new hires struggle most — people with 2+ years rarely make this mistake\" / \"Both shifts have the issue, but night shift is worse because they have no supervisor on-site\"*"

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["No, the issue is consistent across roles", "Yes (please describe below)"]`
**required:** false
**displayOrder:** 501
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`

---

#### LP_PERF_02B — Learner Differences Detail (conditional)
**questionText:** "Describe how the problem differs across roles or groups."

**idNotes:** "Look for patterns: tenure, shift, location, manager, tools, prior training. Each pattern is a potential root cause."

**stakeholderGuidance:** "Describe which groups struggle more and any patterns you've noticed."

**fieldType:** `FieldType.LONG_TEXT`
**required:** true (when visible)
**displayOrder:** 502
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`
**conditional:** `{ questionId: "LP_PERF_02", operator: "equals", value: "Yes (please describe below)" }`

---

#### LP_PERF_03 — Current Skill Level *
**questionText:** "How would you describe the current skill or knowledge level of the affected group related to this topic?"

**idNotes:** "This is your Mager diagnostic in stakeholder language. 'Never trained' = knowledge gap, training is appropriate. 'Trained but didn't stick' = either bad training or insufficient reinforcement — dig deeper. 'Know it but aren't doing it' = motivation or environment problem, training alone won't fix it. 'Mixed' = you may need differentiated paths or a pre-assessment."

**stakeholderGuidance:** "This helps us understand whether people need to learn something new or whether the issue is applying what they already know."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["They've never been trained on this", "They were trained but it didn't stick or was a long time ago", "They know the correct way but aren't doing it consistently", "Mixed — some know it, some don't"]`
**required:** true
**displayOrder:** 503
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`

---

#### LP_PERF_04 — Learner Motivation / Attitude
**questionText:** "How would you describe the affected group's attitude toward this change or improvement effort?"

**idNotes:** "Resistance isn't a training problem — it's a change management problem. If learners are resistant, the best-designed training will bounce off them. Resistant learners need 'why this matters' framing, peer testimonials, manager reinforcement, and activities that surface objections. Flag resistance as a non-training factor needing complementary intervention."

**stakeholderGuidance:** "Be honest — knowing whether people are open to this change helps us design training that meets them where they are, not where we wish they were."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Supportive — they want to improve and will engage with training", "Neutral — they'll participate if asked but aren't pushing for it", "Resistant — they don't see the need or disagree with the approach", "Mixed — varies across the group"]`
**required:** false
**displayOrder:** 504
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`

---

#### LP_PERF_05 — Nature of the Fix *
**questionText:** "Does the solution involve a new or revised procedure or process that people will need to follow?"

**idNotes:** "This determines whether you need a train-the-trainer component. A new procedure means someone needs to learn it first and potentially coach others through the change. If it's about doing existing work better, there's no new procedure to cascade — training targets consistency and reinforcement instead."

**stakeholderGuidance:** "Tell us whether this involves learning a new way of doing things or getting better at the current way."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Yes — new or revised procedure/process", "No — it's about doing existing work better or more consistently"]`
**required:** true
**displayOrder:** 505
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`

---

#### LP_PERF_06 — Change Champions (conditional on LP_PERF_05 = Yes)
**questionText:** "Will there be designated team leads, coaches, or Change Champions who learn the new procedure first and help others adopt it? If so, have they been identified?"

**idNotes:** "If yes, this creates a separate training track. Change Champions need deeper training on the new procedure PLUS coaching skills — how to walk someone through it without doing it for them. They typically train 2-4 weeks ahead of the general population. Budget and scope this as a separate deliverable."

**stakeholderGuidance:** "If you plan to have certain people learn the new procedure first so they can help their teams, let us know who they are. They'll need their own training ahead of the general rollout."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Yes — Who? (describe below)", "No", "Not yet determined"]`
**required:** false
**displayOrder:** 506
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`
**conditional:** `{ questionId: "LP_PERF_05", operator: "equals", value: "Yes — new or revised procedure/process" }`

---

#### LP_PERF_06B — Change Champions Detail (conditional)
**questionText:** "Who are the designated Change Champions or team leads, and when will they be available for training?"

**idNotes:** "Get names and timeline. Vague 'we'll figure it out' plans usually mean no one is actually prepared when rollout hits."

**stakeholderGuidance:** "List the people who will be trained first and when they're available."

**fieldType:** `FieldType.LONG_TEXT`
**required:** true (when visible)
**displayOrder:** 507
**appliesTo:** `[TrainingType.PERFORMANCE_PROBLEM]`
**conditional:** `{ questionId: "LP_PERF_06", operator: "equals", value: "Yes — Who? (describe below)" }`

---

### COMPLIANCE — Section: "Who Must Comply"

#### LP_COMP_01 — Learner Roles and Headcount *
**questionText:** "What job roles or groups must complete this compliance training? For each, provide approximate headcount and how often they encounter the regulated activity."

**idNotes:** "Compliance training often defaults to 'everyone' when only specific roles actually encounter the regulated activity. Push during review: who ACTUALLY performs the regulated tasks vs. who just needs awareness? This distinction drives whether you build one universal module or tiered training."

**stakeholderGuidance:** "List the roles that must complete this training and approximately how many people. Include how often they encounter the situations this regulation covers.\n\n*Examples: \"All 200 employees must complete the awareness module. 45 customer-facing reps need the detailed version because they handle regulated transactions daily.\"*"

**fieldType:** `FieldType.REPEATING_TABLE`
**tableColumns:** `["Role / Title", "Approx. Headcount", "Frequency (Daily / Weekly / Occasionally)"]`
**required:** true
**displayOrder:** 500
**appliesTo:** `[TrainingType.COMPLIANCE]`

---

#### LP_COMP_02 — Role-Based Compliance Differences
**questionText:** "Do different roles have different compliance requirements or need different depth of training?"

**idNotes:** "Almost always yes for real compliance programs. A bank teller's anti-money-laundering training is different from a compliance officer's. This determines whether you build one course or tiered tracks. Cross-reference with COMP_06 (scope and exceptions)."

**stakeholderGuidance:** "If some roles need deeper or different training than others, describe that here.\n\n*Example: \"All employees need the 30-minute awareness module. Managers need an additional module on reporting obligations and investigation procedures.\"*"

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["No, everyone needs the same training", "Yes (please describe below)"]`
**required:** false
**displayOrder:** 501
**appliesTo:** `[TrainingType.COMPLIANCE]`

---

#### LP_COMP_02B — Role-Based Compliance Detail (conditional)
**questionText:** "Describe how training requirements differ by role."

**idNotes:** "Each tier becomes a separate training track with its own objectives, content depth, and assessment rigor."

**stakeholderGuidance:** "Describe which roles need what level of training."

**fieldType:** `FieldType.LONG_TEXT`
**required:** true (when visible)
**displayOrder:** 502
**appliesTo:** `[TrainingType.COMPLIANCE]`
**conditional:** `{ questionId: "LP_COMP_02", operator: "equals", value: "Yes (please describe below)" }`

---

#### LP_COMP_03 — Compliance Attitude / Culture
**questionText:** "How would you describe the organization's current attitude toward this compliance topic?"

**idNotes:** "This is the single biggest predictor of whether compliance training will change behavior or just generate completion records. 'Checkbox mentality' and 'fatigued' require fundamentally different design — you need to earn attention before you can teach content. Scenario-based design, real consequences, and short formats work better than information dumps for disengaged audiences."

**stakeholderGuidance:** "Be candid. If people treat compliance training as a checkbox exercise, we'd rather know now so we can design something that actually gets their attention."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Take it seriously — leadership reinforces it and people understand why it matters", "Checkbox mentality — people complete it because they have to", "Fatigued — too many compliance trainings, people tune out", "Unaware — this is a new requirement and people don't know about it yet"]`
**required:** false
**displayOrder:** 503
**appliesTo:** `[TrainingType.COMPLIANCE]`

---

### ROLE CHANGE — Section: "Who's Transitioning"

#### LP_ROLE_01 — Learner Roles and Headcount *
**questionText:** "How many people are transitioning, and what are their current and new roles?"

**idNotes:** "Small cohorts (3-5) often benefit from coaching over formal training. Large cohorts (20+) justify structured programs. Also note whether this is a one-time transition or ongoing (new team leads every quarter = build a repeatable program)."

**stakeholderGuidance:** "Tell us how many people are affected, what their current roles are, and what they're transitioning to.\n\n*Examples: \"8 senior analysts being promoted to team lead\" / \"15 customer service reps absorbing technical support duties — another 15 next quarter\"*"

**fieldType:** `FieldType.REPEATING_TABLE`
**tableColumns:** `["Current Role", "New / Expanded Role", "Headcount"]`
**required:** true
**displayOrder:** 500
**appliesTo:** `[TrainingType.ROLE_CHANGE]`

---

#### LP_ROLE_02 — Voluntary vs. Imposed *
**questionText:** "Is this transition voluntary (e.g., promotion they applied for) or organizational (e.g., restructuring, added duties)?"

**idNotes:** "Voluntary transitions have built-in motivation. Organizational changes may carry anxiety, resentment, or grief. For imposed changes: include 'why this matters for you' framing, acknowledge the transition is hard, build space for questions. Don't pretend everyone is excited."

**stakeholderGuidance:** "This helps us understand the emotional context. People who chose a new role approach training differently than people who had change thrust upon them."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Voluntary — they chose or applied for this change", "Organizational — the change was decided for them", "Mixed — some volunteered, some were assigned"]`
**required:** true
**displayOrder:** 501
**appliesTo:** `[TrainingType.ROLE_CHANGE]`

---

#### LP_ROLE_03 — Readiness and Confidence
**questionText:** "How would you describe the group's readiness and confidence level for this transition?"

**idNotes:** "'Ready but nervous' is the ideal training audience — capacity and motivation, just need structured practice. 'Underprepared' signals the role change may be premature or pre-work is needed. 'Mixed' means pre-assessment or differentiated tracks. This informs whether you design for confidence-building (simulations, coached practice) vs. foundational skill development."

**stakeholderGuidance:** "Be realistic about where these people are starting from. Overestimating readiness leads to training that moves too fast; underestimating leads to training that feels condescending."

**fieldType:** `FieldType.SINGLE_SELECT`
**options:** `["Ready and confident — strong foundations, eager to start", "Ready but nervous — have the skills but uncertain about the new context", "Underprepared — significant skill gaps that training must address", "Mixed — varies across the group"]`
**required:** false
**displayOrder:** 502
**appliesTo:** `[TrainingType.ROLE_CHANGE]`

---

## Change 8: Update question index and component filters

**File:** `lib/questions/index.ts`

- Import `learnerProfileQuestions` from `./learnerProfiles`
- Add to `ALL_QUESTIONS` array
- Add all LP_ IDs to `QUESTION_MAP`
- `getQuestionsForType()` already merges by `appliesTo` — no logic change needed

**File:** `components/needs-analysis/AudienceProfiles.tsx`

Update `AUDIENCE_QUESTION_IDS` set to include:
- All LP_PERF_ IDs
- All LP_COMP_ IDs
- All LP_ROLE_ IDs
- Keep existing SHARED_06-09B for NEW_SYSTEM (they still render for that type)

---

## Summary of all changes

### Files to modify:
| File | Changes |
|---|---|
| `lib/questions/shared.ts` | Scope SHARED_06, 07, 07B, 08, 09, 09B, 10, 11, 12, 12B, 13, 14 to `[TrainingType.NEW_SYSTEM]` |
| `lib/questions/performanceProblem.ts` | Rename section from "The Problem" to "Performance & Impact" for PERF_01-06 |
| `lib/questions/index.ts` | Import and include `learnerProfileQuestions` |
| `components/needs-analysis/AudienceProfiles.tsx` | Add LP_ question IDs to filter set |

### Files to create:
| File | Contents |
|---|---|
| `lib/questions/learnerProfiles.ts` | 16 questions total: 8 Performance (LP_PERF_01 through 06B), 5 Compliance (LP_COMP_01 through 03), 3 Role Change (LP_ROLE_01 through 03) |

### Files already done (no action):
| File | Status |
|---|---|
| `lib/questions/roleChange.ts` | Section already renamed to "New Role & Responsibilities" by user |

### Verification:
Run `npx tsc --noEmit` to verify clean compile.

---

## Updated per-type question counts

| Type | Static Shared | Dynamic Core | Learner Profile | Total |
|---|---|---|---|---|
| New System | 20 (SHARED_01-27 minus scoped-out) | 12 (SYS_01-12) | 0 (uses SHARED_06-11) | ~38 |
| Performance Problem | 14 (project context + constraints + SMEs + concerns) | 8 (PERF_01-08) | 8 (LP_PERF_01-06B) | ~30 |
| Compliance | 14 | 7 (COMP_01-07) | 5 (LP_COMP_01-03) | ~26 |
| Role Change | 14 | 7 (ROLE_01-07) | 3 (LP_ROLE_01-03) | ~24 |

Note: Exact shared count depends on how many conditional questions are visible. New System retains the most questions because it has the most structural context to capture (system capabilities, integrations, rollout plan, audience table, Change Champions, post-go-live support).
