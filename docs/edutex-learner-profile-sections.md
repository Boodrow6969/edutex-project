# EDUTex Learner Profile Sections — Per Training Type

**Purpose:** Replace the system-centric "Who Will Use This System" (Section 5 in New System) with type-appropriate learner profile sections for Performance Problem, Compliance, and Role Change. New System retains its existing Section 5 unchanged.

**Architecture:** These are NEW shared-ish questions with `appliesTo` targeting specific types. They sit at the same displayOrder range as the New System audience questions (500-level) so they render in the same position on the form.

---

## What stays (all four types, reworded per type)

These core questions apply universally but need different framing:

| Concept | New System (existing) | Other Three Types (new) |
|---|---|---|
| Roles + headcount + frequency | SHARED_06: "What job roles will use this system?" | New: "What job roles or groups need this training?" |
| Role-based differences | SHARED_07: "Do different roles use the system differently?" | New: "Do different roles need different training?" |
| Change Champions | SHARED_10: "Will there be super users or Change Champions?" | Keep as-is — wording is already type-neutral |
| Post-go-live support | SHARED_11: "What support will be available after go-live?" | New: "What support will be available after training?" |

## What drops (New System only)

| Question | Why it drops for other types |
|---|---|
| SHARED_08: Technology comfort level | System-specific. Replaced by type-specific skill/knowledge questions below. |
| SHARED_09: Prior system experience | System-specific. Not relevant to performance gaps, compliance, or role changes. |

## What's new per type

---

# PERFORMANCE PROBLEM — Learner Profile

Section name: **Who's Affected**

### LP_PERF_01 — Learner Roles and Headcount *
**Question:** What job roles or groups are experiencing this performance issue? For each, provide approximate headcount and how often they perform the affected tasks.

**ID Notes:**
Not everyone in a role may have the same problem. Push during review: is this the entire team or a subset? If it's a subset, what distinguishes the low performers from the high performers? That distinction is your design gold — it tells you what the high performers do differently, which becomes your training content.

**Stakeholder Guidance:**
Tell us which roles are affected and how many people. Include how often they perform the tasks in question — daily issues need different solutions than quarterly ones.

*Examples: "45 customer service reps — handle these calls daily, about 60% are making errors" / "All 12 warehouse leads — this comes up during monthly inventory counts"*

**Field Type:** `REPEATING_TABLE` (Role, Headcount, Frequency)
**Required:** Yes
**Display Order:** 500
**Applies To:** `PERFORMANCE_PROBLEM`

---

### LP_PERF_02 — Learner Differences
**Question:** Do different roles or groups experience this problem differently? Does one group struggle more than another?

**Options:**
- No, the issue is consistent across roles
- Yes (please describe)

**ID Notes:**
Differential performance across groups is a massive clue. If Group A does fine and Group B struggles with the same task, the difference is rarely "Group B is dumber." It's usually environment, tools, management, workload, or training history. This directly informs whether you build one training or differentiated paths.

**Stakeholder Guidance:**
If some teams or roles have a bigger problem than others, tell us. This helps us focus where the need is greatest.

*Example: "The new hires struggle most — people with 2+ years rarely make this mistake" / "Both shifts have the issue, but night shift is worse because they have no supervisor on-site"*

**Field Type:** `SINGLE_SELECT` + conditional `LONG_TEXT`
**Required:** No
**Display Order:** 501
**Applies To:** `PERFORMANCE_PROBLEM`

---

### LP_PERF_03 — Current Skill Level *
**Question:** How would you describe the current skill or knowledge level of the affected group related to this topic?

**Options:**
- They've never been trained on this
- They were trained but it didn't stick or was a long time ago
- They know the correct way but aren't doing it consistently
- Mixed — some know it, some don't

**ID Notes:**
This is your Mager diagnostic in stakeholder language. "Never trained" = knowledge gap, training is appropriate. "Trained but didn't stick" = either bad training or insufficient reinforcement — dig deeper. "Know it but aren't doing it" = motivation or environment problem, training alone won't fix it. "Mixed" = you may need differentiated paths or a pre-assessment to sort learners.

**Stakeholder Guidance:**
This helps us understand whether people need to learn something new or whether the issue is applying what they already know.

**Field Type:** `SINGLE_SELECT`
**Required:** Yes
**Display Order:** 502
**Applies To:** `PERFORMANCE_PROBLEM`

---

### LP_PERF_04 — Learner Motivation / Attitude
**Question:** How would you describe the affected group's attitude toward this change or improvement effort?

**Options:**
- Supportive — they want to improve and will engage with training
- Neutral — they'll participate if asked but aren't pushing for it
- Resistant — they don't see the need or disagree with the approach
- Mixed — varies across the group

**ID Notes:**
Resistance isn't a training problem — it's a change management problem. If learners are resistant, the best-designed training in the world will bounce off them. This is critical context for your design: resistant learners need "why this matters" framing, peer testimonials, manager reinforcement, and activities that surface their objections so you can address them. Flag resistance as a non-training factor that needs complementary intervention.

**Stakeholder Guidance:**
Be honest — knowing whether people are open to this change helps us design training that meets them where they are, not where we wish they were.

**Field Type:** `SINGLE_SELECT`
**Required:** No
**Display Order:** 503
**Applies To:** `PERFORMANCE_PROBLEM`

---

# COMPLIANCE — Learner Profile

Section name: **Who Must Comply**

Note: COMP_06 (scope and exceptions) and COMP_07 (previous training) already capture key learner data. This section adds the structural pieces those don't cover.

### LP_COMP_01 — Learner Roles and Headcount *
**Question:** What job roles or groups must complete this compliance training? For each, provide approximate headcount and how often they encounter the regulated activity.

**ID Notes:**
Compliance training often defaults to "everyone" when only specific roles actually encounter the regulated activity. Push during review: who ACTUALLY performs the regulated tasks vs. who just needs awareness? This distinction drives whether you build one universal module or tiered training (awareness for all, detailed for practitioners).

**Stakeholder Guidance:**
List the roles that must complete this training and approximately how many people. Include how often they encounter the situations this regulation covers.

*Examples: "All 200 employees must complete the awareness module. 45 customer-facing reps need the detailed version because they handle regulated transactions daily." / "12 finance team members — they process these transactions weekly"*

**Field Type:** `REPEATING_TABLE` (Role, Headcount, Frequency)
**Required:** Yes
**Display Order:** 500
**Applies To:** `COMPLIANCE`

---

### LP_COMP_02 — Role-Based Compliance Differences
**Question:** Do different roles have different compliance requirements or need different depth of training?

**Options:**
- No, everyone needs the same training
- Yes (please describe)

**ID Notes:**
Almost always yes for real compliance programs. A bank teller's anti-money-laundering training is different from a compliance officer's. This determines whether you build one course or tiered tracks. Cross-reference with COMP_06 (scope and exceptions) — if they said "universal" there but describe differences here, that's a discrepancy to resolve in review.

**Stakeholder Guidance:**
If some roles need deeper or different training than others, describe that here.

*Example: "All employees need the 30-minute awareness module. Managers need an additional module on reporting obligations and investigation procedures."*

**Field Type:** `SINGLE_SELECT` + conditional `LONG_TEXT`
**Required:** No
**Display Order:** 501
**Applies To:** `COMPLIANCE`

---

### LP_COMP_03 — Compliance Attitude / Culture
**Question:** How would you describe the organization's current attitude toward this compliance topic?

**Options:**
- Take it seriously — leadership reinforces it and people understand why it matters
- Checkbox mentality — people complete it because they have to, not because they care
- Fatigued — too many compliance trainings, people tune out
- Unaware — this is a new requirement and people don't know about it yet

**ID Notes:**
This is the single biggest predictor of whether your compliance training will actually change behavior or just generate completion records. "Checkbox mentality" and "fatigued" require fundamentally different design than "take it seriously" — you need to earn attention before you can teach content. Scenario-based design, real consequences, and short formats work better than information dumps for disengaged audiences. Flag this in your design rationale.

**Stakeholder Guidance:**
Be candid. If people treat compliance training as a checkbox exercise, we'd rather know now so we can design something that actually gets their attention.

**Field Type:** `SINGLE_SELECT`
**Required:** No
**Display Order:** 502
**Applies To:** `COMPLIANCE`

---

# ROLE CHANGE — Learner Profile

Section name: **Who's Transitioning**

Note: ROLE_03 (current capabilities) already captures existing skills. This section adds structural and attitudinal context.

### LP_ROLE_01 — Learner Roles and Headcount *
**Question:** How many people are transitioning, and what are their current roles?

**ID Notes:**
Small cohorts (3-5 people) often benefit more from coaching and mentoring than formal training. Large cohorts (20+) justify structured programs. Mixed cohorts (some promoted, some lateral, some restructured) may need differentiated paths even though they're landing in the same role. Also note whether this is a one-time transition or ongoing (new team leads every quarter = build a repeatable program).

**Stakeholder Guidance:**
Tell us how many people are affected, what their current roles are, and what they're transitioning to.

*Examples: "8 senior analysts being promoted to team lead" / "15 customer service reps absorbing technical support duties — this will happen to another 15 next quarter"*

**Field Type:** `REPEATING_TABLE` (Current Role, New/Expanded Role, Headcount)
**Required:** Yes
**Display Order:** 500
**Applies To:** `ROLE_CHANGE`

---

### LP_ROLE_02 — Voluntary vs. Imposed
**Question:** Is this transition voluntary (e.g., promotion they applied for) or organizational (e.g., restructuring, added duties)?

**Options:**
- Voluntary — they chose or applied for this change
- Organizational — the change was decided for them
- Mixed — some volunteered, some were assigned

**ID Notes:**
Voluntary transitions have built-in motivation — people want to succeed in a role they chose. Organizational changes may carry anxiety, resentment, or grief (especially if a team was dissolved). The training design needs to acknowledge the emotional reality. For imposed changes: include "why this matters for you" framing, acknowledge the transition is hard, and build in space for questions and concerns. Don't pretend everyone is excited.

**Stakeholder Guidance:**
This helps us understand the emotional context. People who chose a new role approach training differently than people who had change thrust upon them.

**Field Type:** `SINGLE_SELECT`
**Required:** Yes
**Display Order:** 501
**Applies To:** `ROLE_CHANGE`

---

### LP_ROLE_03 — Readiness and Confidence
**Question:** How would you describe the group's readiness and confidence level for this transition?

**Options:**
- Ready and confident — they have strong foundations and are eager
- Ready but nervous — they have the skills but are uncertain about the new context
- Underprepared — significant skill gaps exist that training needs to address
- Mixed — varies across the group

**ID Notes:**
"Ready but nervous" is actually the ideal training audience — they have the capacity and the motivation, they just need structured practice and confidence-building. "Underprepared" signals that the role change may be premature or that pre-work is needed before formal training. "Mixed" means you may need a pre-assessment or differentiated tracks. This directly informs whether you design for confidence-building (simulations, coached practice) vs. foundational skill development.

**Stakeholder Guidance:**
Be realistic about where these people are starting from. Overestimating readiness leads to training that moves too fast; underestimating it leads to training that feels condescending.

**Field Type:** `SINGLE_SELECT`
**Required:** No
**Display Order:** 502
**Applies To:** `ROLE_CHANGE`

---

# Implementation Notes

## Shared questions that need `appliesTo` updates

The current shared.ts has audience questions (SHARED_06 through SHARED_11) with `appliesTo: "ALL"`. With this change:

| Current ID | Current `appliesTo` | New `appliesTo` | Why |
|---|---|---|---|
| SHARED_06 (Audience table) | ALL | `[NEW_SYSTEM]` only | Replaced by LP_PERF_01, LP_COMP_01, LP_ROLE_01 for other types |
| SHARED_07/07B (Role differences) | ALL | `[NEW_SYSTEM]` only | Replaced by LP_PERF_02, LP_COMP_02 for other types. Role Change doesn't need it — ROLE_01 covers this. |
| SHARED_08 (Tech comfort) | ALL | `[NEW_SYSTEM]` only | System-specific |
| SHARED_09/09B (Prior system) | ALL | `[NEW_SYSTEM]` only | System-specific |
| SHARED_10 (Change Champions) | ALL | Keep `ALL` | Wording is already type-neutral |
| SHARED_11 (Post-go-live support) | ALL | Keep `ALL`, reword to "Post-training support" | Wording needs slight adjustment but concept applies universally |

## New question count per type

| Type | Existing Dynamic | New Learner Profile | Existing Shared Audience | Net Change |
|---|---|---|---|---|
| New System | 12 | 0 (keeps SHARED_06-11) | 6 | No change |
| Performance Problem | 8 | 4 (LP_PERF_01-04) | 2 (SHARED_10, 11) | +4 new, -4 dropped = net 0 |
| Compliance | 7 | 3 (LP_COMP_01-03) | 2 (SHARED_10, 11) | +3 new, -4 dropped = net -1 |
| Role Change | 7 | 3 (LP_ROLE_01-03) | 2 (SHARED_10, 11) | +3 new, -4 dropped = net -1 |

## Naming convention

New questions use `LP_` prefix (Learner Profile) + type abbreviation + sequential number. This keeps them distinct from the dynamic core questions (PERF_, COMP_, ROLE_) and the shared questions (SHARED_).

## DisplayOrder

All learner profile questions use 500-series to sit between the dynamic core sections (200-400) and the static rollout/constraints sections (600+).
