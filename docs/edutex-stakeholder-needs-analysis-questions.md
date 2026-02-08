# EDUTex Stakeholder Needs Analysis — Question Content Specification

> **Migration Note (2026-02-08):** The `Project` model was renamed to `Course`. References to `projectId` in the data model section at the bottom of this document reflect the original spec; the live schema uses `courseId` or `workspaceId`.

## Document Purpose

This specification defines every question in the Stakeholder Needs Analysis webform across all four training types. Each question includes three content layers:

1. **Question Text** — What both the ID and stakeholder see
2. **ID Notes** — Coaching notes for the instructional designer (visible in-app only, never exported)
3. **Stakeholder Guidance** — Plain-language explanation with concrete examples (visible on the external stakeholder form and in exported documents)

This document drives the data model. Field types, conditional logic, shared vs. type-specific questions, and validation rules are all derived from the content defined here.

---

## Architecture Overview

### Training Types

| Code | Label | When to Use |
|------|-------|-------------|
| `PERFORMANCE_PROBLEM` | Performance Problem | Existing process or behavior isn't meeting standards |
| `NEW_SYSTEM` | New System / Software Deployment | Introducing a tool, platform, or technology people need to learn |
| `COMPLIANCE` | Compliance / Policy Change | Regulatory, legal, or policy-driven requirement |
| `ROLE_CHANGE` | Role Change / Expansion | Job responsibilities are being added, restructured, or elevated |

### Question Structure

Each question has the following metadata:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., `SHARED_01`, `PERF_03`) |
| `section` | string | Grouping label displayed on the form |
| `questionText` | string | The question itself |
| `idNotes` | string | Concise coaching notes for the instructional designer (always visible in-app) |
| `idNotesExtended` | string (nullable) | Deeper reference content — frameworks, examples, worked scenarios — rendered in a popover/modal on click. Most questions won't need this; use it for questions that reference ID frameworks the designer may need a refresher on. |
| `stakeholderGuidance` | string | Help text + examples for the stakeholder |
| `fieldType` | enum | `SHORT_TEXT`, `LONG_TEXT`, `SINGLE_SELECT`, `MULTI_SELECT`, `DATE`, `NUMBER`, `SCALE` |
| `required` | boolean | Whether the question must be answered |
| `options` | string[] | For `SINGLE_SELECT` and `MULTI_SELECT` only |
| `displayOrder` | number | Rendering order within section |
| `appliesTo` | string[] | Which training types use this question (`ALL` or specific codes) |
| `conditional` | object | Optional — show this question only if another answer meets a condition |

### Form Flow

The form renders in sections. Questions marked `appliesTo: ALL` appear for every training type. Type-specific questions appear only when that type is selected. The stakeholder sees a clean, linear form — the branching is invisible to them.

---

## SECTION 1: Project Context (Shared — All Types)

These questions establish the who/what/when regardless of training type. They appear first on every form.

---

### SHARED_01 — Project or Initiative Name

**Question Text:**  
What is the name of this project or initiative?

**ID Notes:**  
Use this as the display name in the project list. If the stakeholder gives a vague name like "training" or "new system," you'll want to refine this during review. This isn't a formal title — it's a working label.

**Stakeholder Guidance:**  
Give this project a short, descriptive name so everyone can reference it easily. It doesn't need to be the final course title.  
*Examples: "2026 Salesforce Migration Training," "Q3 Safety Policy Update," "New Hire Onboarding Redesign"*

**Field Type:** `SHORT_TEXT`  
**Required:** Yes  
**Applies To:** `ALL`  
**Display Order:** 1

---

### SHARED_02 — Business Sponsor / Requesting Leader

**Question Text:**  
Who is the executive sponsor or leader requesting this training?

**ID Notes:**  
This is the person with budget authority and decision-making power — not necessarily the SME or the person filling out this form. Knowing the sponsor helps you understand organizational priority and who signs off on the final product. If the stakeholder *is* the sponsor, that's worth noting during review.

**Stakeholder Guidance:**  
This is the leader who initiated or approved this training request. They're typically the person accountable for the business outcome the training supports.  
*Examples: "Maria Chen, VP of Operations," "Tom Parker, Director of Compliance"*

**Field Type:** `SHORT_TEXT`  
**Required:** Yes  
**Applies To:** `ALL`  
**Display Order:** 2

---

### SHARED_03 — Your Role in This Project

**Question Text:**  
What is your role in relation to this training project?

**ID Notes:**  
This tells you who you're actually talking to. A sponsor gives strategic answers. A manager gives operational answers. An SME gives technical answers. Calibrate how you interpret all other responses based on this answer. If they select "Other," dig into that during review — they might be an admin assistant filling this out on behalf of someone else.

**Stakeholder Guidance:**  
Select the role that best describes your relationship to this project. This helps us tailor follow-up questions and know who to contact for specific types of information.

**Field Type:** `SINGLE_SELECT`  
**Required:** Yes  
**Options:**
- Executive Sponsor (I approved or initiated this request)
- Department Manager (I manage the team that needs training)
- Subject Matter Expert (I have deep knowledge of the content area)
- Project Manager (I'm coordinating the initiative this training supports)
- Other (please describe in the next field)

**Applies To:** `ALL`  
**Display Order:** 3

---

### SHARED_04 — Role Description (Conditional)

**Question Text:**  
Please describe your role in this project.

**ID Notes:**  
Only appears if they select "Other" in SHARED_03. This free-text field catches edge cases — HR business partners, external consultants, executive assistants acting as proxies, etc.

**Stakeholder Guidance:**  
Briefly describe how you're involved in this project and what perspective you bring.

**Field Type:** `SHORT_TEXT`  
**Required:** Yes (when visible)  
**Applies To:** `ALL`  
**Display Order:** 4  
**Conditional:** Show only when `SHARED_03 == "Other"`

---

### SHARED_05 — Target Audience

**Question Text:**  
Who needs this training? Describe the audience as specifically as you can.

**ID Notes:**  
You need enough detail to build a learner persona. Push for specifics during review if the answer is too vague ("everyone" or "the team"). Key things to extract: job titles, experience level, team size, geographic spread, and whether the audience is homogeneous or mixed. Multiple distinct audiences often signal the need for differentiated training paths — the same competency taught differently based on organizational level or experience.

**Stakeholder Guidance:**  
Tell us about the people who will take this training. Include details like job titles, departments, experience levels, and approximate number of learners. The more specific you are, the better we can design training that fits their actual work.  
*Example: "45 field service technicians across 3 regions. Most have 2-5 years experience with our legacy system. About 10 are new hires with no prior exposure."*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ALL`  
**Display Order:** 5

---

### SHARED_06 — Urgency / Timeline

**Question Text:**  
What is the target date or deadline for this training to be available?

**ID Notes:**  
A hard deadline (compliance date, system go-live) vs. a soft goal ("sometime in Q2") tells you entirely different things about project constraints. Flag hard deadlines prominently in your review — they dictate scope, format decisions, and whether phased delivery makes sense. If the timeline is unrealistic for the scope, that's a critical review finding.

**Stakeholder Guidance:**  
If there's a specific date this training needs to be ready (like a system go-live or regulatory deadline), enter it here. If it's more of a general timeframe, describe that instead.  
*Examples: "March 15, 2026 — system go-live," "By end of Q2, flexible on exact date," "ASAP — incidents are happening now"*

**Field Type:** `SHORT_TEXT`  
**Required:** Yes  
**Applies To:** `ALL`  
**Display Order:** 6

---

### SHARED_07 — What Does Success Look Like?

**Question Text:**  
How will you know this training was successful? What would be different afterward?

**ID Notes:**  
This is the single most important question on the form. The answer (or lack of one) tells you whether the stakeholder is thinking in terms of measurable outcomes or just wants a checkbox. Vague answers like "people will understand the new system" need to be translated into observable behaviors during review. This directly feeds your KPI definitions, evaluation plan, and objective writing. *(ℹ️ Measuring Training Impact — The Four Levels)*

**ID Notes Extended — Measuring Training Impact:**

This question targets the two levels of evaluation that matter most to the business: whether people change their behavior on the job, and whether business results improve. Understanding all four levels helps you interpret stakeholder answers and push for the right kind of success criteria.

**Level 1 — Reaction:** Did learners like the training? (Smile sheets, satisfaction surveys.) Easy to measure but tells you almost nothing about whether the training worked. If the stakeholder's success criteria is "good feedback scores," that's a red flag — push deeper.

**Level 2 — Learning:** Did learners acquire the knowledge or skill? (Quiz scores, skill demonstrations during training.) Better than Level 1, but still measures what happens *in the classroom*, not on the job.

**Level 3 — Behavior:** Are learners doing things differently on the job? (Observation, manager reports, quality audits, call monitoring.) This is the first level that measures real impact. When the stakeholder says "call resolution time drops" or "technicians follow the procedure correctly," they're describing Level 3.

**Level 4 — Results:** Did business metrics improve? (Revenue, safety incidents, customer satisfaction, compliance audit findings.) This is what the sponsor cares about. The connection between training and Level 4 results is often indirect — many factors contribute — but establishing the expected business metrics now creates the evaluation framework.

**How to use this during review:**

| Stakeholder Answer | Evaluation Level | What to Do |
|---|---|---|
| "People will feel more confident" | Reaction | Push for observable behaviors — confidence isn't measurable |
| "They'll pass the certification exam" | Learning | Good, but ask what changes on the job after they pass |
| "Reps use the pricing tool correctly on every quote" | Behavior | Strong — this is an observable behavior you can measure |
| "Customer complaints drop 20% by Q4" | Results | Excellent — but clarify how you'll attribute this to training vs. other factors |
| "I don't know — I just need them trained" | None | Critical finding. Work with the sponsor to define success *before* design begins. |

**Stakeholder Guidance:**  
Think beyond "people completed the training." What would you see people doing differently on the job? What business metric would improve? Describe the change you'd observe if the training worked perfectly.  
*Examples: "Call resolution time drops from 12 minutes to 8 minutes," "Zero compliance findings in the next audit," "New hires are independently productive within 2 weeks instead of 6"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ALL`  
**Display Order:** 7

---

### SHARED_08 — Existing Materials or Prior Training

**Question Text:**  
Does any training, documentation, or reference material already exist for this topic?

**ID Notes:**  
This tells you whether you're building from scratch or redesigning. Existing materials are goldmines for content analysis — even bad ones tell you what's been tried. Ask for access to anything they mention during review. Also surfaces potential political issues: if someone else built the "old" training, tread carefully on criticism.

**Stakeholder Guidance:**  
List any existing training courses, job aids, procedure documents, SOPs, or reference materials related to this topic — even if they're outdated. This helps us build on what exists rather than starting from zero.  
*Examples: "There's a 2023 onboarding deck in SharePoint," "The vendor provides a user guide PDF," "Nothing formal — just tribal knowledge"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `ALL`  
**Display Order:** 8

---

### SHARED_09 — Constraints or Considerations

**Question Text:**  
Are there any constraints, limitations, or special considerations we should know about?

**ID Notes:**  
This is your catch-all for things that affect design decisions: budget limits, technology restrictions (no video, must work offline), union rules, language needs, accessibility requirements, political sensitivities, shift schedules that limit seat time, etc. Stakeholders often forget to mention constraints until they become blockers — this question surfaces them early.

**Stakeholder Guidance:**  
Tell us about anything that might affect how we design or deliver this training. Think about budget, technology, scheduling, language, accessibility, or organizational factors.  
*Examples: "Learners only have 30-minute windows between shifts," "Must be available in English and Spanish," "No budget for video production," "Some learners don't have company laptops"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `ALL`  
**Display Order:** 9

---

### SHARED_10 — Preferred Delivery Format

**Question Text:**  
Do you have a preference for how this training is delivered?

**ID Notes:**  
Stakeholder preferences aren't design decisions — you'll make the final recommendation based on audience, content type, and constraints. But knowing their expectations helps you manage the conversation. If they expect a 2-hour eLearning course and the analysis suggests a job aid + 15-minute micro-lesson, you'll need to navigate that gap during design review. Flag significant mismatches between preference and your analysis recommendation. *(ℹ️ Delivery Format Selection Guide)*

**ID Notes Extended — Delivery Format Selection Guide:**

Use this reference when comparing the stakeholder's preference against what the analysis actually calls for. The right format depends on content type, audience constraints, and performance requirements — not stakeholder preference alone.

| Format | Best For | Watch Out For |
|---|---|---|
| **Self-paced eLearning** | Consistent procedural content, large/dispersed audiences, compliance training that needs completion tracking | Overused for content that needs discussion or practice with feedback. Not ideal for complex decision-making skills. |
| **Virtual instructor-led (VILT)** | Complex topics needing discussion, scenario practice with live feedback, small-to-medium groups, soft skills | Scheduling logistics with shift workers or global teams. Requires a skilled facilitator, not just a presenter. |
| **In-person classroom** | Hands-on skills, equipment operation, team-building, high-stakes simulations | Expensive at scale. Often requested out of habit when VILT would work equally well. |
| **Blended** | Most robust option for complex skills — combines knowledge transfer (async) with practice/application (live). | Requires more design effort and coordination. Stakeholders sometimes say "blended" when they mean "do both just in case." |
| **Job aid / Quick reference** | Infrequent tasks, complex procedures with many steps, reference information | Not training — it's performance support. If the task is frequent and critical, people need to *learn* it, not look it up every time. |
| **Video / Recorded walkthrough** | Software demonstrations, process overviews, expert explanations | Expensive to update when content changes. Passive — no practice or assessment built in. |
| **On-the-job coaching / Mentoring** | Role transitions, leadership development, nuanced judgment skills | Depends entirely on coach quality. Needs structure or it becomes "sit next to someone and hope you learn." |

**Common mismatches to flag during review:**

- Stakeholder wants a 2-hour eLearning → Analysis shows the content is 15 minutes of procedure + a job aid
- Stakeholder wants classroom → Audience is 500 people across 12 locations
- Stakeholder wants video → Content changes quarterly (maintenance burden)
- Stakeholder says "no preference" → Good — they're giving you design authority. Use it wisely.

**Stakeholder Guidance:**  
Select any delivery formats you think would work well for this audience. The instructional design team will make a final recommendation based on the full analysis, but your input helps us understand expectations.

**Field Type:** `MULTI_SELECT`  
**Required:** No  
**Options:**
- Self-paced eLearning
- Virtual instructor-led (live online session)
- In-person classroom
- Blended (combination of formats)
- Job aid / quick reference guide
- Video / recorded walkthrough
- On-the-job coaching or mentoring
- No preference — recommend what works best

**Applies To:** `ALL`  
**Display Order:** 10

---

### SHARED_11 — Additional Stakeholders or SMEs

**Question Text:**  
Who else should we involve in the analysis or design of this training? Please distinguish between people who have *expertise to contribute* and people who need *approval authority.*

**ID Notes:**  
This builds your stakeholder map. People named here become candidates for SME interviews, review cycles, and pilot testing. Pay attention to who they *don't* mention — sometimes the most important voice is the one the sponsor forgets about (e.g., the frontline supervisor, the IT admin who configures the system, the union rep).

Watch for the "too many approvers" trap. When every stakeholder listed here expects sign-off authority, review cycles multiply and contradictory feedback creates gridlock. During your review, clarify roles explicitly: who *contributes input* vs. who *approves the final product.* If you see three or more names here, proactively set up a RACI agreement before the first review cycle. *(ℹ️ What's RACI?)*

**ID Notes Extended — RACI Framework for Training Projects:**

RACI clarifies who does what so feedback cycles don't become a free-for-all. Each person on the project gets exactly one letter per decision or deliverable:

**R — Responsible:** Does the work. That's you — the instructional designer building the training.

**A — Accountable:** Makes the final decision and owns the outcome. Usually the executive sponsor. *There can only be one "A" per deliverable.* This is the rule that prevents gridlock. When three people all think they're the final approver, nothing gets signed off.

**C — Consulted:** Provides expert input before decisions are made. SMEs, team leads, technical specialists. You actively seek their feedback, but they don't have veto power. Two-way conversation.

**I — Informed:** Gets updates but isn't part of the decision. Managers scheduling teams for training, IT prepping the LMS, communications teams planning rollout emails. One-way — you tell them what was decided.

**Example: Storyboard Review Cycle**

| Person | RACI Role | What They Do |
|---|---|---|
| Maria Lopez, VP Operations | **A** — Accountable | Final sign-off. Reviews once, after you've incorporated all C feedback. |
| Jake Torres, Senior Analyst | **C** — Consulted | Reviews for technical accuracy. Flags errors in workflow descriptions. |
| Priya Shah, Team Lead | **C** — Consulted | Reviews for learner realism. "That's not how we actually do it on the floor." |
| Legal Department | **C** — Consulted | Reviews only the compliance language sections, not the full storyboard. |
| Regional Managers (5) | **I** — Informed | Get a summary of the training plan and rollout timeline. No review cycle. |

**Example: Assessment Design**

| Person | RACI Role | What They Do |
|---|---|---|
| You (Instructional Designer) | **R** — Responsible | Writes assessment items aligned to objectives. |
| Department Manager | **A** — Accountable | Approves the passing score and assessment format. |
| SME | **C** — Consulted | Validates that scenarios and answer options are realistic. |
| HR / Compliance | **C** — Consulted | Confirms assessment meets regulatory documentation requirements. |
| Learners (pilot group) | **I** — Informed | Take the pilot assessment; their results inform revisions but they don't review the design. |

**When to set up RACI:** If the stakeholder lists three or more names in this question, draft a simple RACI table during your review and share it at the kickoff meeting. It's much easier to establish roles upfront than to untangle conflicting feedback after the first review cycle.

**Stakeholder Guidance:**  
List anyone who has relevant expertise, will need to review or approve the training, or represents the learner perspective. Include their name, role, and the best way to contact them.

A note on review efficiency: Training projects move fastest when there's a clear distinction between people who *provide input* and the one or two people who *make final decisions.* When too many people have approval authority, feedback often conflicts and timelines stall. As you list names below, consider noting whether each person should contribute expertise or hold approval authority — we'll use this to set up a smooth review process.

*Examples: "Jake Torres, Senior Analyst — power user, input/expertise," "Maria Lopez, VP Operations — final approver," "Priya Shah, Team Lead — learner perspective, input only," "Legal department — review for regulatory accuracy, approval on compliance language only"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `ALL`  
**Display Order:** 11

---

## SECTION 2: Performance Problem

These questions only appear when the training type is `PERFORMANCE_PROBLEM`. They start from the business problem and work toward what people need to *do* differently — always grounding the analysis in measurable performance gaps rather than training requests.

---

### PERF_01 — The Problem or Opportunity

**Question Text:**  
What specific problem are you trying to solve, or what opportunity are you trying to capture?

**ID Notes:**  
This is the "why are we doing this?" question. You're looking for a business problem, not a training request. If the answer is "we need a course on X," that's a solution masquerading as a problem — note it and dig into the actual business impact during review. The answer here feeds directly into the Business Challenge/Opportunity field in your Design Strategy document.

**Stakeholder Guidance:**  
Describe the business situation driving this request. Focus on what's going wrong (or what opportunity exists), not on the training itself.  
*Examples: "Customer satisfaction scores dropped 15% after the last product update," "We're losing deals because reps can't articulate the new pricing model," "Three safety incidents in the last quarter were caused by the same procedural error"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 20

---

### PERF_02 — Current vs. Desired Performance

**Question Text:**  
What are people doing now, and what should they be doing instead?

**ID Notes:**  
This is the performance gap in behavioral terms. "They don't understand X" is not a gap — it's a guess at the cause. Push for observable behaviors: what do you *see* them doing wrong? What would you *see* if they were doing it right? This directly feeds your task analysis and objective writing. If the stakeholder can't articulate the gap in behavioral terms, that's a signal for deeper SME analysis. *(ℹ️ Observable Behaviors vs. Knowledge Statements)*

**ID Notes Extended — Observable Behaviors vs. Knowledge Statements:**

Stakeholders naturally describe gaps in terms of knowledge ("they don't understand...") rather than behavior ("they don't do..."). Your job is to translate knowledge statements into observable actions, because you can only train and measure what you can see.

**Translation examples:**

| Stakeholder Says (Knowledge) | What They Probably Mean (Behavior) | Follow-Up Question |
|---|---|---|
| "They don't understand the new pricing model" | Reps are quoting incorrect prices to customers | "What are you seeing them do wrong when they quote prices?" |
| "They need to know the safety procedures" | Workers are skipping steps in the lockout/tagout sequence | "Which specific procedures are being skipped or done incorrectly?" |
| "They don't get the new policy" | Employees are handling customer data in ways that violate the policy | "Can you describe a recent situation where someone handled this incorrectly?" |
| "They need to be aware of the changes" | (Vague — could mean anything) | "If they were fully aware, what would they be doing differently day-to-day?" |

**The acid test:** If you can't observe it, you can't measure it. If you can't measure it, you can't assess whether training worked. Every gap description should pass this test: *"Could a manager walk past someone's desk and see whether they're doing this correctly?"*

**When stakeholders resist:** Some stakeholders genuinely can't describe the gap in behavioral terms — especially for soft skills or decision-making. In those cases, ask for *critical incidents*: "Tell me about a recent time when someone handled this poorly. What happened?" Stories surface behaviors naturally.

**Stakeholder Guidance:**  
Describe the gap between current and desired performance in terms of what people actually *do* on the job. Try to be specific about actions, not just knowledge.  
*Examples: "Currently: Reps quote prices from memory and often get it wrong. Desired: Reps use the pricing configurator and verify before quoting." / "Currently: Technicians skip the lockout/tagout step when they're in a hurry. Desired: Lockout/tagout is completed 100% of the time, no exceptions."*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 21

---

### PERF_03 — Business Impact

**Question Text:**  
What is the measurable impact of this problem on the business?

**ID Notes:**  
You need numbers or at least quantifiable consequences. "It's costing us money" isn't enough. This answer defines your ROI story and establishes the business-level metrics you'll use to evaluate whether the training moved the needle. If they can't quantify the impact, it may signal that the problem isn't well-understood or isn't as critical as presented. That's a legitimate finding — document it.

**Stakeholder Guidance:**  
Help us understand the scale of this problem using numbers where possible. Think about costs, time, quality, customer impact, risk, or lost revenue.  
*Examples: "We've had $200K in billing errors this quarter," "Average handle time is 40% above benchmark," "We've received 3 regulatory warnings in 12 months," "Employee turnover in this role is 2x the company average"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 22

---

### PERF_04 — Root Cause Hypothesis

**Question Text:**  
Why do you think people aren't performing as expected? What's getting in the way?

**ID Notes:**  
This is the classic "is it a training problem?" filter. The answer tells you whether the stakeholder sees this as a knowledge/skill gap or an environmental/motivational issue. If the root cause isn't a skill/knowledge gap, training alone won't fix it — document this as a critical finding and recommend the "training as % of solution" framework. *(ℹ️ Is This a Training Problem?)*

**ID Notes Extended — Is This a Training Problem?**

The most important diagnostic question in instructional design: *"Could they do it if their life depended on it?"*

If **yes** — they have the skill but aren't using it. Training won't help. The problem is environmental or motivational:

| Non-Training Cause | Solution Category | Examples |
|---|---|---|
| No feedback | Management intervention | People don't know they're doing it wrong. Add quality monitoring, dashboards, manager observation. |
| No consequences | Incentive/accountability | Nothing happens when they do it wrong — or right. Realign KPIs, recognition, performance reviews. |
| Punished for doing it right | Remove obstacles | Following the correct procedure takes longer and they get penalized for slow throughput. Fix the conflict. |
| Obstacles in the way | Process/tool redesign | The tool makes it hard, the process has unnecessary steps, required resources are unavailable. |
| Not motivated | Engagement/change management | They know how and have the tools, but don't care. This is a leadership and culture problem, not a training problem. |

If **no** — they genuinely don't know how. Training (or performance support) is part of the solution:

| Skill Gap Type | Training Approach |
|---|---|
| Never learned it | Full training: teach the skill from foundations |
| Learned it but forgot (infrequent task) | Refresher + job aid for ongoing support |
| Learned it but can't transfer (context changed) | Bridging training: connect old skill to new context |
| Partially skilled (can do basics, not advanced) | Targeted upskilling: skip what they know, build on it |

**How to use the stakeholder's answer:**

Read their root cause hypothesis through this lens. If they say "they know the process but skip steps when they're busy," that's a *motivation/consequence* problem — training alone won't fix it. If they say "they were never shown the updated procedure," that's a genuine skill gap. Most real-world problems are a mix — document the training and non-training components separately, and use that to frame "training as % of solution" in your design strategy.

**Stakeholder Guidance:**  
In your opinion, what's causing the performance gap? Think broadly — it might not be a knowledge issue. Consider whether people have the right tools, clear expectations, enough time, proper feedback, or organizational support.  
*Examples: "They were never trained on the updated procedure," "The old software made it easy — the new interface is confusing," "They know the process but skip steps when they're under time pressure," "There's no consequence for doing it wrong, so people take shortcuts"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 23

---

### PERF_05 — What Has Been Tried

**Question Text:**  
What has already been done to address this problem?

**ID Notes:**  
This prevents you from recommending something that already failed. It also reveals the organizational appetite for solutions — have they tried coaching? New tools? Policy changes? Nothing? If training was already tried and didn't work, that's critical context: either the training was bad, or training isn't the solution. Either way, you need to know before you design.

**Stakeholder Guidance:**  
List any steps already taken to fix this problem — training, coaching, new tools, process changes, communications, etc. Include what worked partially and what didn't work at all.  
*Examples: "We sent a reminder email but nothing changed," "The vendor did a 1-hour webinar but it was too high-level," "We updated the SOP but people aren't reading it," "This is the first time we're addressing it formally"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 24

---

### PERF_06 — Environmental or Non-Training Factors

**Question Text:**  
Are there factors outside of training that contribute to this problem?

**ID Notes:**  
This is your "training as % of solution" question. Almost no performance problem is 100% solvable by training alone. The stakeholder may not realize this, so this question plants the seed. Document environmental factors as recommendations for complementary interventions alongside training. *(ℹ️ Training as % of Solution)*

**ID Notes Extended — Training as % of Solution Framework:**

This framework makes explicit what experienced IDs know intuitively: training is almost never the whole answer. It forces you to estimate what percentage of the performance gap can realistically be closed by training, and what other interventions are needed.

**How to estimate the split:**

After reviewing the stakeholder's answers to PERF_04 (root cause) and PERF_06 (environmental factors), categorize each contributing cause:

| Cause Category | Addressable by Training? | Alternative Intervention |
|---|---|---|
| Lack of knowledge or skill | ✅ Yes | Training, practice, assessment |
| Lack of awareness (don't know it matters) | ✅ Partially | Training for awareness + management reinforcement |
| Forgetting (infrequent task) | ✅ Partially | Refresher training + job aid for ongoing support |
| Poor tools or interface | ❌ No | UX redesign, tool replacement, workaround documentation |
| Unclear expectations | ❌ No | Management communication, updated job descriptions, KPI alignment |
| No feedback loop | ❌ No | Quality monitoring, dashboards, manager observation cadence |
| No consequences | ❌ No | Performance management, accountability structures |
| Conflicting priorities | ❌ No | Workload management, priority alignment from leadership |
| Understaffing / time pressure | ❌ No | Hiring, process simplification, scope reduction |

**Example breakdown:**

*Problem: "Customer service reps aren't using the new CRM workflow correctly."*

| Factor | Training? | % of Solution |
|---|---|---|
| Reps were never trained on the new workflow | ✅ Training | 40% |
| The CRM interface is confusing and requires too many clicks | ❌ Tool redesign | 25% |
| Managers aren't monitoring CRM usage or coaching reps | ❌ Management intervention | 20% |
| Reps are evaluated on call volume, not CRM accuracy | ❌ KPI realignment | 15% |

**Training = 40% of the solution.** This means even perfect training will only close 40% of the gap. Present this to the stakeholder during design review — it sets realistic expectations and positions you as a strategic partner, not just a course builder.

**How to present this finding:** Frame it positively. Don't say "training won't work." Say "Training will address the skill gap, which is about 40% of the problem. For the full impact you're looking for, here are the complementary actions that will close the other 60%." Then list the non-training recommendations. Stakeholders respect this — it shows you understand the business problem, not just the training request.

**Stakeholder Guidance:**  
Training is often just one part of the solution. Are there other factors that need to be addressed alongside the training for it to be effective? Be honest — identifying these now saves time and money later.  
*Examples: "The software interface is genuinely confusing — a redesign is also needed," "Managers don't follow up or hold people accountable," "We're understaffed, so people rush through procedures," "The current KPIs actually reward the wrong behavior"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `PERFORMANCE_PROBLEM`  
**Display Order:** 25

---

## SECTION 3: New System / Software Deployment

These questions appear when the training type is `NEW_SYSTEM`. This is the context-aware variant that adapts for situations where traditional needs analysis questions ("what's going wrong?") don't work because the system is new and no one has used it yet.

---

### SYS_01 — System Being Deployed

**Question Text:**  
What system, software, or tool is being introduced?

**ID Notes:**  
Get the exact product name and version. This determines whether vendor training exists, what documentation is available, and whether you can get sandbox/demo access for your own analysis. Also ask about the deployment model (cloud vs. on-prem, SaaS vs. custom) during review — it affects how quickly the interface might change after training goes live.

**Stakeholder Guidance:**  
Provide the name of the system or software being deployed, including version if known. If it's a custom-built tool, describe what it does.  
*Examples: "Salesforce Lightning — migrating from Classic," "Workday HCM — new implementation," "Custom warehouse management app built by our internal dev team"*

**Field Type:** `SHORT_TEXT`  
**Required:** Yes  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 30

---

### SYS_02 — What It Replaces

**Question Text:**  
What existing tools, systems, or processes does this replace? If it's entirely new functionality, describe what people do today without it.

**ID Notes:**  
The replacement context is your bridge to learner analysis. If they're moving from System A to System B, you can do a comparative task analysis. If it's net-new, you need to understand the manual/workaround processes that exist today. Either way, this gives you the "from → to" narrative that anchors the training. Also flags potential resistance: replacing a beloved tool is different from replacing a hated one.

**Stakeholder Guidance:**  
Help us understand what changes for the learners. Are they switching from one system to another, or learning something entirely new?  
*Examples: "Replacing our legacy Excel-based tracking with a proper CRM," "This is an addition — they'll keep using the current tools but add this for reporting," "Currently this process is done manually with paper forms"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 31

---

### SYS_03 — Key Tasks in the New System

**Question Text:**  
What are the main tasks or workflows people will need to perform in the new system?

**ID Notes:**  
This is your task analysis seed. Stakeholders for new systems often dump feature lists here instead of tasks — "they'll use the dashboard, the reporting module, the admin panel." Translate feature lists into action-oriented tasks during review. What does someone actually *do* with the dashboard? What reports do they run, and when, and why? This feeds directly into your objective writing and activity design.

**Stakeholder Guidance:**  
List the key things people will need to *do* in the new system — not features, but actual tasks. Think about a typical day or week.  
*Examples: "Create and assign support tickets, run weekly performance reports, update customer records after calls, escalate cases that meet certain criteria" / "Enter time daily, submit expense reports, approve direct reports' requests, run headcount reports monthly"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 32

---

### SYS_04 — Proficiency Expectations

**Question Text:**  
What does "proficient use" look like by the go-live date? What should people be able to do independently?

**ID Notes:**  
This is the "success criteria" question reframed for system deployments. It forces the stakeholder to define the minimum viable competency — not "knows the system" but "can independently perform X, Y, Z without calling the help desk." This defines your training scope: everything above this line is in scope, everything below is a nice-to-have or Phase 2. Connect this to your objective writing and assessment design.

**Stakeholder Guidance:**  
By go-live day, what should people be able to do on their own? Be realistic — we can always build advanced training later. Focus on the must-haves for Day 1.  
*Examples: "Create, edit, and close a support ticket. Search for existing tickets. Run the daily queue report. That's it for go-live — advanced reporting can wait." / "Complete the full onboarding workflow for a new hire, including document generation and benefits enrollment"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 33

---

### SYS_05 — Deployment Timeline and Phases

**Question Text:**  
What is the deployment timeline? Is it a phased rollout or big-bang?

**ID Notes:**  
Phased rollouts let you iterate on training between waves — huge advantage. Big-bang means everyone needs to be trained simultaneously, which limits format options and requires more robust support materials (job aids, help desk prep). The timeline also tells you when you need sandbox access, how much content might change before go-live, and whether a pilot group is available for testing.

**Stakeholder Guidance:**  
Describe the rollout plan. Will everyone switch at once, or will it roll out in phases across teams, locations, or dates?  
*Examples: "Big-bang: All 500 users switch on April 1," "Phase 1: Pilot with 30 users in March. Phase 2: Full rollout in May." / "Region by region over 6 months, starting with NA in Q2"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 34

---

### SYS_06 — Demo / Sandbox Access

**Question Text:**  
Can the training team get access to a demo environment or sandbox of the system?

**ID Notes:**  
If yes, this is your most valuable resource — you can do your own task analysis, capture screenshots/recordings, and build realistic practice activities. If no, you're designing blind based on vendor docs and SME descriptions, which is risky. Flag "no access" as a project risk during review. Ask about the timeline for when access becomes available.

**Stakeholder Guidance:**  
Will the instructional design team be able to log into a test or demo version of the system to explore it and capture training content?

**Field Type:** `SINGLE_SELECT`  
**Required:** Yes  
**Options:**
- Yes — sandbox/demo access is available now
- Yes — but not until a future date (please specify below)
- No — we'll need to work from documentation and demos
- Unsure — I need to check with IT/the vendor

**Applies To:** `NEW_SYSTEM`  
**Display Order:** 35

---

### SYS_07 — Sandbox Availability Date (Conditional)

**Question Text:**  
When will sandbox or demo access be available?

**ID Notes:**  
Critical for your project plan. Training development can't meaningfully start without system access (for screenshots, task walkthroughs, assessment scenarios). If this date is close to go-live, flag the compressed timeline as a risk.

**Stakeholder Guidance:**  
Provide the expected date or timeframe when the training team can access the demo environment.

**Field Type:** `SHORT_TEXT`  
**Required:** Yes (when visible)  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 36  
**Conditional:** Show only when `SYS_06 == "Yes — but not until a future date"`

---

### SYS_08 — Vendor-Provided Training

**Question Text:**  
Does the vendor provide any training, documentation, or learning resources?

**ID Notes:**  
Vendor training is almost never sufficient by itself — it's generic, not tailored to your workflows, and usually too feature-focused. But it's a useful starting point for content analysis and can supplement your custom training for advanced topics. Also check: is vendor training *required* before your training (e.g., certification prerequisites), or is it optional?

**Stakeholder Guidance:**  
List any training resources the software vendor provides — webinars, help articles, certification courses, videos, user guides, etc. We can build on these rather than duplicating them.  
*Examples: "The vendor offers a 3-day admin certification course," "There's an online help center with how-to articles," "They offered a 1-hour recorded demo — I can share the link," "Nothing useful — their documentation is written for developers, not end users"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 37

---

### SYS_09 — Post-Go-Live Support Plan

**Question Text:**  
What support will be available to users after go-live? Will there be designated Change Champions, super users, or floor support — and if so, have they been identified yet?

**ID Notes:**  
This defines what training *doesn't* need to cover and shapes your job aid / performance support recommendations. If there's robust help desk support, you can focus training on workflows and decision-making rather than step-by-step procedures. If support is thin, your training needs to be more comprehensive and your job aids more detailed.

Pay close attention to whether they mention Change Champions, super users, or floor walkers. These people are your force multipliers — but only if they're prepared. If the plan includes designated support people, that's a separate training workstream: those individuals need deeper system knowledge *and* the skills to coach others through problems, which is a different skillset than just being a proficient user. Flag this as a train-the-trainer need during your review if it hasn't already been scoped. *(ℹ️ Change Champions & Train-the-Trainer)*

**ID Notes Extended — Change Champions & Train-the-Trainer:**

A Change Champion (also called super user, floor walker, or go-live buddy) is someone embedded in the team who provides real-time support during and after the transition. This model is one of the most effective go-live strategies — but it introduces a second audience with different training needs.

**Why Change Champions need their own training:**

A good end-user can follow the process. A good Change Champion can diagnose *why someone else is stuck* and walk them through it without doing it for them. Those are fundamentally different skills:

| End-User Training | Change Champion Training |
|---|---|
| Perform standard workflows correctly | Perform standard *and* advanced workflows, including workarounds |
| Know where to find help | *Be* the help — troubleshoot common errors live |
| Follow the process | Explain *why* the process works this way |
| Complete their own tasks | Coach someone through a task while that person does it |
| Recognize when to escalate | Know the difference between a user error, a configuration issue, and a system bug |

**Train-the-trainer scoping checklist — raise these during review:**

- **Who are they?** Have specific people been identified, or is the plan still "we'll figure it out"? Vague plans often mean no one is actually prepared when go-live hits.
- **When do they train?** Change Champions need training *before* the general population — ideally 2-4 weeks ahead so they can practice and build confidence.
- **What's their time commitment?** During go-live week, are they fully released from normal duties to support others, or expected to do both? If both, the support will be thin regardless of how well they're trained.
- **How many per location/team?** A common ratio is 1 Change Champion per 15-25 end users, but it depends on complexity. For complex systems, closer to 1:10.
- **What resources do they get?** Change Champions need different materials than end users — troubleshooting guides, escalation paths, FAQ documents based on common issues from pilot, and a direct channel to IT support.
- **What happens after go-live stabilizes?** Do they return to normal duties? Stay as ongoing system experts? This affects whether you're building a temporary support model or a permanent one.

**Impact on your training plan:**

If Change Champions are part of the support model, your project now has two training tracks:

| Track | Audience | Content | Timing |
|---|---|---|---|
| **Track 1: Change Champion** | Designated super users (small group) | Deep system training + coaching skills + troubleshooting + escalation procedures | 2-4 weeks before general rollout |
| **Track 2: End-User** | General population | Standard workflows + where to get help (including "ask your Change Champion") | Per rollout schedule |

The Change Champion training is often best delivered as a hands-on workshop (live, not eLearning) because it needs to include practice coaching scenarios — not just system skills. Budget and scope this as a separate deliverable.

**Stakeholder Guidance:**  
What resources will users have after training when they get stuck? Think about help desks, Change Champions or super users, floor walkers, chat support, internal documentation, etc.

If you're planning to designate Change Champions or super users — people in each team who provide hands-on support during the transition — let us know who they are and when they'll be available. These individuals typically need their own training ahead of the general rollout so they're prepared to coach others, not just use the system themselves.

*Examples: "We're designating 5 Change Champions per department — they'll be fully released from normal duties during go-live week," "IT help desk will have a dedicated queue for the first 30 days," "No dedicated support planned — they'll need to figure it out from training and job aids," "The vendor offers 24/7 chat support for the first 90 days," "We have super users in mind but haven't formalized anything yet"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `NEW_SYSTEM`  
**Display Order:** 38

---

## SECTION 4: Compliance / Policy Change

These questions appear when the training type is `COMPLIANCE`. Compliance training has unique constraints: hard deadlines, attestation requirements, and consequences for non-compliance that make the stakes fundamentally different from elective training.

---

### COMP_01 — Regulation or Policy

**Question Text:**  
What regulation, law, or policy is driving this training requirement?

**ID Notes:**  
Get the specific citation, not just a general description. "OSHA requirements" is too vague — "OSHA 29 CFR 1910.147 (Lockout/Tagout)" lets you verify the actual requirements. For internal policies, get the document name, version, and effective date. This determines whether you can find the regulatory language to validate what actually needs to be trained vs. what the stakeholder *thinks* needs to be trained. Sometimes stakeholders over-scope compliance training out of anxiety.

**Stakeholder Guidance:**  
Provide the specific regulation, law, standard, or internal policy that requires this training. Include reference numbers or document names if available.  
*Examples: "OSHA 29 CFR 1910.147 — Control of Hazardous Energy (Lockout/Tagout)," "HIPAA Privacy Rule — annual refresher," "Company Policy HR-2025-003: Updated Harassment Prevention," "SOX Section 404 — Internal Controls compliance for finance team"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `COMPLIANCE`  
**Display Order:** 40

---

### COMP_02 — What Changed

**Question Text:**  
What specifically changed, and why does it require training?

**ID Notes:**  
For regulatory updates, the change might be narrow (one clause updated) or broad (entirely new regulation). For internal policy changes, understand whether this is a refinement of existing practice or a fundamentally new requirement. The scope of change directly determines training scope. If "nothing changed, this is annual refresher," that shifts the design toward reinforcement and assessment rather than new learning — a very different instructional approach.

**Stakeholder Guidance:**  
Describe what's new or different. If this is an annual refresher with no changes, say so — that helps us design differently than we would for a major policy update.  
*Examples: "New CCPA amendment adds data deletion request handling requirements," "No change — this is our annual refresher on the existing code of conduct," "The harassment prevention policy now includes remote/hybrid workplace scenarios," "Entirely new regulation effective July 1 — nothing like this existed before"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `COMPLIANCE`  
**Display Order:** 41

---

### COMP_03 — Compliance Deadline

**Question Text:**  
By what date must all affected employees complete this training?

**ID Notes:**  
Compliance deadlines are hard stops — they don't flex. This date drives everything: format selection, rollout strategy, and what can realistically be built in time. If the deadline is impossibly tight, you may need to recommend a phased approach (e.g., quick awareness session now + full training later) rather than one comprehensive course. Always confirm whether this date is a regulatory deadline, an internal target, or an audit date.

**Stakeholder Guidance:**  
Provide the hard deadline for training completion. Is this date set by the regulation itself, by an upcoming audit, or by internal policy?  
*Examples: "Regulatory deadline: December 31, 2026," "Internal target: All employees by Q3 to be audit-ready by Q4," "Audit is March 15 — everyone must be complete by March 1"*

**Field Type:** `SHORT_TEXT`  
**Required:** Yes  
**Applies To:** `COMPLIANCE`  
**Display Order:** 42

---

### COMP_04 — Consequences of Non-Compliance

**Question Text:**  
What happens if employees don't complete this training or don't comply with the policy?

**ID Notes:**  
This is your motivation lever and your urgency calibration. Consequences range from "a reminder email from HR" to "the company gets fined $10M" to "someone could die." The severity determines how much rigor the training needs: casual awareness vs. assessed certification with documented proof of competency. It also tells you how seriously the organization takes this — if there are no consequences, completion rates will be low regardless of how good the training is.

**Stakeholder Guidance:**  
Describe what's at stake — for the individual, the team, and the organization. Think about regulatory fines, legal liability, audit findings, safety risks, or disciplinary actions.  
*Examples: "Individual: Written warning, then termination. Organization: Up to $50K per violation from the regulator." / "Audit finding that triggers mandatory corrective action plan" / "Safety risk: failure to follow this procedure could result in serious injury"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `COMPLIANCE`  
**Display Order:** 43

---

### COMP_05 — Attestation or Certification Requirements

**Question Text:**  
Is there a formal attestation, certification, or assessment requirement?

**ID Notes:**  
This determines whether you need a graded assessment vs. just a completion stamp. Some regulations require scored tests with minimum passing thresholds, signed attestation forms, or manager sign-offs. This directly shapes your assessment design. Clarify during review: is the attestation a regulatory requirement or organizational policy? *(ℹ️ Assessment Types for Compliance)*

**ID Notes Extended — Assessment Types for Compliance Training:**

The attestation requirement determines your assessment design strategy. Different requirements call for fundamentally different approaches:

| Requirement | Assessment Approach | Design Implications |
|---|---|---|
| **Completion tracking only** | No formal assessment needed. Consider adding knowledge checks for learning value, but they don't gate completion. | Lightest design. Focus on engagement and scenario-based awareness rather than testing. |
| **Signed attestation** | Learner signs a statement confirming they read/understood the policy. No scored test. | Include the attestation language in the training. Make sure the content clearly covers every clause the learner is attesting to. LMS needs e-signature or checkbox functionality. |
| **Scored assessment (pass/fail)** | Formal test with minimum passing score (typically 80%). Failed attempts require remediation and retake. | Design questions that test *application*, not recall. Scenario-based items ("what would you do when...") are more defensible in audits than trivia questions ("what year was the regulation enacted?"). Build a question pool larger than the test to prevent answer sharing. |
| **Scored assessment + attestation** | Both a passing score AND a signed acknowledgment. Most rigorous. | Combine the above. The assessment proves comprehension; the attestation proves the learner takes personal responsibility. |
| **Manager sign-off / observation** | Manager confirms the employee demonstrated the behavior on the job. | Training must include practice activities that mirror the on-the-job behaviors. Provide managers with an observation checklist. This is on-the-job behavior evaluation baked into the compliance requirement. |

**Passing score guidance:** If the regulation doesn't specify a score, the organization sets one. 80% is the most common default. For high-consequence topics (safety, patient care), consider 100% with unlimited retakes — the message is "you must get this right, and we'll give you every opportunity to do so."

**Audit defensibility:** Auditors want to see that the assessment actually tests what the regulation requires — not just that people clicked through slides. Map every assessment item back to a specific regulatory requirement. This mapping becomes part of your documentation.

**Stakeholder Guidance:**  
Does the regulation or policy require proof that employees understood the content — like a test, a signed acknowledgment, or a certification?

**Field Type:** `SINGLE_SELECT`  
**Required:** Yes  
**Options:**
- Yes — scored assessment with minimum passing score
- Yes — signed attestation / acknowledgment form
- Yes — both assessment and attestation
- No — completion tracking is sufficient
- Unsure — I need to verify the requirement

**Applies To:** `COMPLIANCE`  
**Display Order:** 44

---

### COMP_06 — Behavioral Requirements

**Question Text:**  
What specific behaviors or actions does this policy require of employees?

**ID Notes:**  
Move beyond "understand the policy" — what do people need to *do* differently? This is where compliance training crosses from information dump to actual performance support. These behaviors become your learning objectives and drive activity design. If the stakeholder can only describe knowledge ("they need to know about X") and not behaviors ("they need to do Y when Z happens"), that's a signal to push for scenario-based design. *(ℹ️ Scenario-Based Compliance Design)*

**ID Notes Extended — Scenario-Based Compliance Design:**

Most compliance training fails because it teaches *information about* the policy instead of *decisions under* the policy. The fix is straightforward: identify the decisions people make on the job where the policy is relevant, then build practice around those decision points.

**The shift from information to decisions:**

| Information-Based (Weak) | Decision-Based (Strong) |
|---|---|
| "HIPAA protects patient health information" | "A colleague asks you to look up a patient's records for a friend. What do you do?" |
| "Report suspicious transactions within 24 hours" | "A customer deposits $9,500 in cash. They mention they'll deposit the rest tomorrow. Is this reportable?" |
| "PPE is required in Zone 3" | "You need to grab a tool from Zone 3 for a 30-second task. Your safety goggles are in your locker two floors up. What do you do?" |

**How to extract decisions from the stakeholder's behavioral requirements:**

For each behavior they list, ask: *"When would someone face a choice about whether to follow this requirement?"* The answer gives you your scenario setup. The common mistakes give you your wrong-answer options. The consequences give you your feedback.

**Example extraction:**

Stakeholder says: *"Verify patient identity using two identifiers before releasing information."*

- **Scenario setup:** A nurse calls requesting lab results for a patient, gives the patient name but says she doesn't have the medical record number handy because the system is slow.
- **Decision point:** Do you release the results with only one identifier?
- **Common mistake:** Releasing with one identifier because the caller sounds legitimate and is in a hurry.
- **Correct action:** Politely require the second identifier regardless of circumstances.
- **Consequence of mistake:** HIPAA violation, potential fine, patient privacy breach.

This one behavioral requirement just generated a complete practice activity. Repeat for each behavior listed in this question.

**Stakeholder Guidance:**  
List the specific actions employees must take (or stop doing) to comply with this policy. Focus on what they need to *do* on the job, not just what they need to *know.*  
*Examples: "Report suspicious transactions within 24 hours using the SAR form," "Verify patient identity using two identifiers before releasing information," "Dispose of hazardous materials only in designated containers — never in regular trash," "Obtain written consent before sharing customer data with third parties"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `COMPLIANCE`  
**Display Order:** 45

---

### COMP_07 — Recurrence / Refresh Cycle

**Question Text:**  
Is this training a one-time requirement, or does it need to be repeated on a schedule?

**ID Notes:**  
Recurring training needs a different design strategy than one-time. Year-over-year refreshers should be lighter, scenario-based, and focused on assessment rather than re-teaching. Consider a modular approach where the core content persists but a "what's new" module gets swapped each cycle. Flag this for your content maintenance plan and LMS configuration.

**Stakeholder Guidance:**  
Will this training need to be taken again periodically?

**Field Type:** `SINGLE_SELECT`  
**Required:** Yes  
**Options:**
- One-time only
- Annual refresher
- Every 2-3 years
- Triggered by policy updates (as-needed)
- Unsure — I need to check the regulation

**Applies To:** `COMPLIANCE`  
**Display Order:** 46

---

## SECTION 5: Role Change / Expansion

These questions appear when the training type is `ROLE_CHANGE`. Role transitions require a capability-gap focus — what can they do now, what do they need to do, and what's the bridge between?

---

### ROLE_01 — Nature of the Change

**Question Text:**  
Describe the role change. Is this a promotion, lateral move, new responsibilities being added, or a restructuring?

**ID Notes:**  
The type of change determines the instructional approach. Promotions typically need leadership/soft skill development. Lateral moves need technical reskilling. Added responsibilities need targeted upskilling. Restructuring may need a blend plus change management. This also helps you understand the emotional context — people approach a welcome promotion differently than a forced restructure.

**Stakeholder Guidance:**  
Tell us what's changing about the role and why.  
*Examples: "Individual contributors are being promoted to team lead positions," "Marketing coordinators are absorbing social media management duties from a disbanded team," "Customer service reps are being cross-trained to handle technical support calls," "Department merger — two teams with different processes need to align on one approach"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 50

---

### ROLE_02 — New Responsibilities

**Question Text:**  
What specific new tasks, responsibilities, or decisions will these employees need to handle?

**ID Notes:**  
This is your task analysis seed, similar to SYS_03 but focused on role competencies rather than system features. Push for concrete tasks during review — "they'll need to manage people" is too vague. What does "manage people" mean in this organization? Conducting 1:1s? Writing performance reviews? Approving time off? Handling complaints? Each specific task becomes a training objective candidate.

**Stakeholder Guidance:**  
List the new or expanded responsibilities as specifically as possible. Think about a typical week in the new role — what tasks would be new or different?  
*Examples: "Conduct weekly 1:1 meetings, write quarterly performance reviews, approve PTO requests, handle first-level employee complaints" / "Create and manage social media content calendars, respond to customer inquiries on social channels, generate monthly engagement reports"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 51

---

### ROLE_03 — Current Capabilities

**Question Text:**  
What relevant skills, knowledge, or experience do these employees already have?

**ID Notes:**  
This defines the starting point so you can design for the actual gap rather than starting from zero. Experienced professionals being promoted already have organizational knowledge and technical skills — they don't need to relearn the business. They need the *new* skills their new role demands. This also helps you identify which new skills have adjacent existing skills (e.g., someone who's been an informal mentor may have a head start on coaching skills).

**Stakeholder Guidance:**  
Describe what these employees already know or can do that's relevant to their new role. This helps us build on existing strengths rather than repeating what they already know.  
*Examples: "They're technically strong — all have 3+ years as individual contributors. They know our products and processes inside-out. What they lack is formal people management skills." / "They understand basic social media as personal users, but have no experience with brand voice, scheduling tools, or analytics."*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 52

---

### ROLE_04 — Readiness Evaluation

**Question Text:**  
How will you evaluate whether someone is ready to perform in the expanded role?

**ID Notes:**  
This shapes your assessment strategy and defines what "done" looks like for training. If they say "there's no formal evaluation," that's a recommendation opportunity. The key question is whether the evaluation measures what people actually *do on the job* after training, not just what they learned in the classroom. If certification or formal assessment exists, build the training backward from those requirements. *(ℹ️ Readiness Evaluation Methods)*

**ID Notes Extended — Readiness Evaluation Methods:**

Role transitions are harder to assess than procedural skills because the competencies are often complex and context-dependent. Here are proven methods, ranked from lightest to most rigorous:

| Method | Effort | Validity | Best For |
|---|---|---|---|
| **Self-assessment checklist** | Low | Low (people overestimate readiness) | Low-stakes role additions, initial baseline only |
| **Manager observation checklist** | Medium | Medium-High | Behavioral skills like coaching, customer interaction, decision-making |
| **Structured shadow period** | Medium | Medium | New managers, complex roles where judgment matters |
| **Scenario-based simulation** | High | High | High-stakes roles, leadership, safety-critical positions |
| **30/60/90 day milestone framework** | Medium | High (measured over time) | Any role transition — builds in progressive expectations |
| **Certification exam** | High | High (for knowledge) | Technical roles, regulated positions |

**The 30/60/90 Day Framework (recommended default):**

If the stakeholder says "no formal evaluation," recommend this structure. It provides built-in checkpoints without requiring heavy assessment infrastructure:

| Checkpoint | Focus | Example Criteria |
|---|---|---|
| **30 days** | Can perform core tasks with support | "Conducts 1:1 meetings using the provided template. Asks for help when escalation is needed." |
| **60 days** | Can perform core tasks independently | "Independently handles routine team issues. Identifies situations that need escalation before they become problems." |
| **90 days** | Performs at full capacity, handles edge cases | "Manages a team conflict without manager intervention. Delivers first quarterly performance review with feedback from HR rating it 'meets expectations.'" |

This framework also creates natural touchpoints for reinforcement training — if someone is struggling at the 30-day checkpoint, you can intervene with targeted support rather than waiting for a formal failure.

**Building training backward from assessment:** If a formal assessment exists (certification, skills test, panel review), get the criteria *first.* Design the training so that every practice activity directly prepares the learner for what they'll be evaluated on. Objectives, activities, and assessments should all point at the same target — when they're aligned, nothing in the training is wasted and nothing on the assessment is a surprise.

**Stakeholder Guidance:**  
How will managers know that someone is ready to take on the new responsibilities? Is there a formal evaluation, or will it be more informal?  
*Examples: "Manager observation during a 2-week shadow period," "Must pass the team lead assessment with 80% or higher," "No formal evaluation — they'll just start doing the work and we'll course-correct," "90-day probationary period with weekly check-ins and a formal review at the end"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 53

---

### ROLE_05 — Transition Timeline

**Question Text:**  
When does this role change take effect, and what does the transition period look like?

**ID Notes:**  
Is there a gradual handoff or an abrupt switch? A 3-month transition gives you time for blended learning with on-the-job practice. A "they start Monday" situation requires survival-level training now with a longer development program to follow. Also ask during review: will they be doing *both* the old and new roles during transition, or fully released from old duties?

**Stakeholder Guidance:**  
Describe the timeline for the transition. Will people move into the new role all at once, or gradually take on new responsibilities?  
*Examples: "Effective immediately — they were promoted last week," "Gradual transition over 3 months starting in April," "New responsibilities added quarterly as each phase rolls out," "They'll shadow the current person for 2 weeks, then take over fully"*

**Field Type:** `LONG_TEXT`  
**Required:** Yes  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 54

---

### ROLE_06 — Support Structures

**Question Text:**  
What support will be available to help people succeed in the new role beyond training?

**ID Notes:**  
Training is one intervention — mentoring, coaching, communities of practice, manager support, and clear documentation are equally important for role transitions. This question surfaces what already exists and identifies gaps in the support ecosystem. If nothing exists, that's a finding for your recommendations. Connect to the "training as % of solution" framework: what percentage of the transition success depends on training vs. these other support structures?

**Stakeholder Guidance:**  
Beyond training, what will help these employees succeed? Think about mentoring, coaching, peer groups, manager check-ins, tools, or other resources.  
*Examples: "Each new team lead will be paired with an experienced manager as a mentor," "We have a monthly new-manager cohort where they discuss challenges," "Nothing structured — they'll need to figure it out," "Their previous manager will be available for questions during the transition period"*

**Field Type:** `LONG_TEXT`  
**Required:** No  
**Applies To:** `ROLE_CHANGE`  
**Display Order:** 55

---

## Data Model Implications

Based on this content specification, the data model needs to support:

### Question Definition Table
Stores the master question library. Populated at deployment, not user-editable.

- `id` — Unique question identifier (SHARED_01, PERF_03, etc.)
- `section` — Display section name
- `questionText` — The question
- `idNotes` — Concise designer coaching text (always visible)
- `idNotesExtended` — Nullable. Deeper reference content (frameworks, examples, worked scenarios) rendered in popover/modal on click
- `stakeholderGuidance` — Help text for stakeholders
- `fieldType` — Enum: SHORT_TEXT, LONG_TEXT, SINGLE_SELECT, MULTI_SELECT, DATE, NUMBER, SCALE
- `required` — Boolean
- `options` — JSON array (for select types)
- `displayOrder` — Integer
- `appliesTo` — Array of training type codes (or "ALL")
- `conditionalOn` — Nullable: `{ questionId, operator, value }` — show only when condition met

### Stakeholder Submission Table
One row per token/form submission session.

- `id` — Submission ID
- `tokenId` — FK to the access token
- `projectId` — FK to the EDUTex project
- `trainingType` — Enum: PERFORMANCE_PROBLEM, NEW_SYSTEM, COMPLIANCE, ROLE_CHANGE
- `status` — Enum: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REVISION_REQUESTED
- `submittedAt` — Nullable timestamp
- `reviewedAt` — Nullable timestamp
- `reviewedBy` — Nullable FK to user

### Response Table
One row per question per submission.

- `id` — Response ID
- `submissionId` — FK to submission
- `questionId` — FK to question definition (e.g., "SHARED_07")
- `value` — Text (stores all types as text; select values store the option string)
- `updatedAt` — Timestamp
- `updatedBy` — Name of the person who last edited (from attribution system)

### Access Token Table
Generated by the ID, used by stakeholders to access the form.

- `id` — Token ID
- `token` — Unique string (UUID or short code)
- `projectId` — FK to EDUTex project
- `trainingType` — Enum (set when ID creates the link)
- `createdBy` — FK to user (the ID who generated it)
- `createdAt` — Timestamp
- `expiresAt` — Nullable timestamp
- `isActive` — Boolean
- `stakeholderName` — Nullable (populated when stakeholder first identifies themselves)
- `stakeholderEmail` — Nullable

### Change Log Table
Attribution tracking per the Option 3 decision.

- `id` — Log entry ID
- `submissionId` — FK to submission
- `questionId` — FK to question
- `changedBy` — Name (from session, set by attribution modal)
- `previousValue` — Text
- `newValue` — Text
- `changedAt` — Timestamp

---

## Question Count Summary

| Section | Count | Required | Optional |
|---------|-------|----------|----------|
| Shared (All Types) | 11 | 7 | 4 |
| Performance Problem | 6 | 4 | 2 |
| New System / Software | 9 | 6 | 3 |
| Compliance / Policy | 7 | 6 | 1 |
| Role Change / Expansion | 6 | 5 | 1 |

**Total unique questions:** 39  
**Questions per form (approximate):**
- Performance Problem: 11 shared + 6 type = 17 questions
- New System: 11 shared + 9 type = 20 questions
- Compliance: 11 shared + 7 type = 18 questions
- Role Change: 11 shared + 6 type = 17 questions

---

## Extended Notes Index

Questions with `idNotesExtended` content (rendered as popover/modal in the ID review interface):

| Question ID | Extended Topic | Content |
|---|---|---|
| SHARED_07 | Measuring Training Impact — The Four Levels | Evaluation levels with translation table for stakeholder answers |
| SHARED_10 | Delivery Format Selection Guide | When to use each format, common stakeholder-vs-analysis mismatches |
| SHARED_11 | RACI Framework | Role definitions, two worked examples (storyboard review, assessment design) |
| PERF_02 | Observable Behaviors vs. Knowledge Statements | Translation table, acid test, critical incidents technique |
| PERF_04 | Is This a Training Problem? | "Could they do it if their life depended on it?" diagnostic with non-training solutions |
| PERF_06 | Training as % of Solution | Estimation framework with worked example breakdown |
| SYS_09 | Change Champions & Train-the-Trainer | Two-track training model, scoping checklist, Champion vs. end-user skills comparison |
| COMP_05 | Assessment Types for Compliance | Requirement-to-approach mapping, audit defensibility, passing score guidance |
| COMP_06 | Scenario-Based Compliance Design | Information-to-decision shift, decision extraction method with worked example |
| ROLE_04 | Readiness Evaluation Methods | Method comparison table, 30/60/90 day framework, backward design from assessment |

---

## Next Steps

1. **Review & iterate** on this content — adjust questions, rewrite guidance, add/remove as needed
2. **Step 1: Data Model** — Build Prisma schema from the data model implications section above
3. **Step 3: API Routes** — CRUD for tokens, submissions, responses, change log
4. **Step 4: Stakeholder Form UI** — Public-facing form driven by question definitions + training type
5. **Step 5: ID Review UI** — In-app review interface with approve/request revision workflow

---

## References

The frameworks and principles woven throughout this specification draw from established instructional design research and practice. This page maps the practical guidance in the spec back to its source material for anyone who wants to go deeper.

### Needs Analysis & Performance Diagnosis

| Concept in This Spec | Source | Where It Appears |
|---|---|---|
| "Is it a training problem?" diagnostic — *Could they do it if their life depended on it?* | Mager, R. F., & Pipe, P. (1997). *Analyzing Performance Problems* (3rd ed.). Center for Effective Performance. | PERF_04 extended notes |
| Starting from the business problem, not the training request; working backward from decisions people make on the job | Moore, C. (2017). *Map It: The Hands-On Guide to Strategic Training Design.* Montesa Press. | PERF_01 ID Notes, COMP_06 extended notes, Section 2 framing |
| Training as % of solution — isolating training vs. non-training causes | Gilbert, T. F. (2007). *Human Competence: Engineering Worthy Performance* (Tribute ed.). Pfeiffer. | PERF_06 extended notes |
| Needs analysis questioning frameworks and stakeholder interview techniques | Brown, A. H., & Green, T. D. (2024). *The Essentials of Instructional Design* (5th ed.). Routledge. | Shared questions structure, Section 1 framing |
| Instructional design intake forms and contextual analysis | McDonald, J. K., & West, R. E. (Eds.). *Design for Learning: Principles, Processes, and Praxis.* EdTech Books. | SHARED_05, SHARED_09 |

### Evaluation & Assessment

| Concept in This Spec | Source | Where It Appears |
|---|---|---|
| Four levels of training evaluation (Reaction → Learning → Behavior → Results) | Kirkpatrick, D. L., & Kirkpatrick, J. D. (2006). *Evaluating Training Programs: The Four Levels* (3rd ed.). Berrett-Koehler. | SHARED_07 extended notes, PERF_03, COMP_05, ROLE_04 |
| Constructive alignment — objectives, activities, and assessments pointing at the same target | Biggs, J., & Tang, C. (2011). *Teaching for Quality Learning at University* (4th ed.). Open University Press. | ROLE_04 extended notes |
| Observable behaviors as the basis for objectives and assessment design | Mager, R. F. (1997). *Preparing Instructional Objectives* (3rd ed.). Center for Effective Performance. | PERF_02 extended notes |

### Learning Design Principles

| Concept in This Spec | Source | Where It Appears |
|---|---|---|
| Scenario-based design — practice built around realistic decisions with consequences | Clark, R. C. (2013). *Scenario-Based e-Learning.* Pfeiffer. | COMP_06 extended notes |
| Differentiated training paths by audience level (same competency, different depth) | Internal pattern derived from persona-based curriculum design | SHARED_05 ID Notes |
| Delivery format selection based on content type and performance requirements | Clark, R. C., & Mayer, R. E. (2016). *e-Learning and the Science of Instruction* (4th ed.). Wiley. | SHARED_10 extended notes |
| Retrieval practice and spaced repetition as design principles | Brown, P. C., Roediger, H. L., & McDaniel, M. A. (2014). *Make It Stick: The Science of Successful Learning.* Harvard University Press. | COMP_07 ID Notes (recurrence design) |

### Project Management & Stakeholder Engagement

| Concept in This Spec | Source | Where It Appears |
|---|---|---|
| RACI framework for role clarity on projects | Project Management Institute. (2021). *A Guide to the Project Management Body of Knowledge (PMBOK Guide)* (7th ed.). PMI. | SHARED_11 extended notes |
| 30/60/90 day milestone framework for role transitions | Common industry practice in talent development and onboarding | ROLE_04 extended notes |
