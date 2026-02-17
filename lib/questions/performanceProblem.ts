import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

/**
 * Dynamic questions for PERFORMANCE_PROBLEM training type only.
 *
 * Sections covered:
 *   "Performance & Impact" (displayOrder 200–205) — 6 questions
 *   "Success Criteria" (displayOrder 206–207) — 2 questions
 *
 * 8 questions total.
 */

export const performanceProblemQuestions: QuestionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Performance & Impact
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "PERF_01",
    section: "Performance & Impact",
    questionText:
      "What specific problem are you trying to solve, or what opportunity are you trying to capture?",
    idNotes:
      'This is the "why are we doing this?" question. You\'re looking for a business problem, not a training request. If the answer is "we need a course on X," that\'s a solution masquerading as a problem — note it and dig into the actual business impact during review. The answer here feeds directly into the Business Challenge/Opportunity field in your Design Strategy document.',
    stakeholderGuidance:
      'Describe the business situation driving this request. Focus on what\'s going wrong (or what opportunity exists), not on the training itself.\n\n*Examples: "Customer satisfaction scores dropped 15% after the last product update," "We\'re losing deals because reps can\'t articulate the new pricing model," "Three safety incidents in the last quarter were caused by the same procedural error"*',
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 200,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_02",
    section: "Performance & Impact",
    questionText:
      "What are people doing now, and what should they be doing instead?",
    idNotes:
      'This is the performance gap in behavioral terms. "They don\'t understand X" is not a gap — it\'s a guess at the cause. Push for observable behaviors: what do you *see* them doing wrong? What would you *see* if they were doing it right? This directly feeds your task analysis and objective writing. If the stakeholder can\'t articulate the gap in behavioral terms, that\'s a signal for deeper SME analysis.',
    idNotesExtended:
      "**Observable Behaviors vs. Knowledge Statements**\n\n" +
      'Stakeholders naturally describe gaps in terms of knowledge ("they don\'t understand...") rather than behavior ("they don\'t do..."). Your job is to translate knowledge statements into observable actions, because you can only train and measure what you can see.\n\n' +
      "**Translation examples:**\n\n" +
      "| Stakeholder Says (Knowledge) | What They Probably Mean (Behavior) | Follow-Up Question |\n" +
      "|---|---|---|\n" +
      '| "They don\'t understand the new pricing model" | Reps are quoting incorrect prices to customers | "What are you seeing them do wrong when they quote prices?" |\n' +
      '| "They need to know the safety procedures" | Workers are skipping steps in the lockout/tagout sequence | "Which specific procedures are being skipped or done incorrectly?" |\n' +
      '| "They don\'t get the new policy" | Employees are handling customer data in ways that violate the policy | "Can you describe a recent situation where someone handled this incorrectly?" |\n' +
      '| "They need to be aware of the changes" | (Vague — could mean anything) | "If they were fully aware, what would they be doing differently day-to-day?" |\n\n' +
      '**The acid test:** If you can\'t observe it, you can\'t measure it. If you can\'t measure it, you can\'t assess whether training worked. Every gap description should pass this test: *"Could a manager walk past someone\'s desk and see whether they\'re doing this correctly?"*\n\n' +
      "**When stakeholders resist:** Some stakeholders genuinely can't describe the gap in behavioral terms — especially for soft skills or decision-making. In those cases, ask for *critical incidents*: \"Tell me about a recent time when someone handled this poorly. What happened?\" Stories surface behaviors naturally.",
    stakeholderGuidance:
      'Describe the gap between current and desired performance in terms of what people actually *do* on the job. Try to be specific about actions, not just knowledge.\n\n*Examples: "Currently: Reps quote prices from memory and often get it wrong. Desired: Reps use the pricing configurator and verify before quoting." / "Currently: Technicians skip the lockout/tagout step when they\'re in a hurry. Desired: Lockout/tagout is completed 100% of the time, no exceptions."*',
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 201,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_03",
    section: "Performance & Impact",
    questionText:
      "What is the measurable impact of this problem on the business?",
    idNotes:
      'You need numbers or at least quantifiable consequences. "It\'s costing us money" isn\'t enough. This answer defines your ROI story and establishes the business-level metrics you\'ll use to evaluate whether the training moved the needle. If they can\'t quantify the impact, it may signal that the problem isn\'t well-understood or isn\'t as critical as presented. That\'s a legitimate finding — document it.',
    stakeholderGuidance:
      'Help us understand the scale of this problem using numbers where possible. Think about costs, time, quality, customer impact, risk, or lost revenue.\n\n*Examples: "We\'ve had $200K in billing errors this quarter," "Average handle time is 40% above benchmark," "We\'ve received 3 regulatory warnings in 12 months," "Employee turnover in this role is 2x the company average"*',
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 202,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_04",
    section: "Performance & Impact",
    questionText:
      "Why do you think people aren't performing as expected? What's getting in the way?",
    idNotes:
      'This is the classic "is it a training problem?" filter. The answer tells you whether the stakeholder sees this as a knowledge/skill gap or an environmental/motivational issue. If the root cause isn\'t a skill/knowledge gap, training alone won\'t fix it — document this as a critical finding and recommend the "training as % of solution" framework.',
    idNotesExtended:
      "**Is This a Training Problem?**\n\n" +
      'The most important diagnostic question in instructional design: *"Could they do it if their life depended on it?"*\n\n' +
      "If **yes** — they have the skill but aren't using it. Training won't help. The problem is environmental or motivational:\n\n" +
      "| Non-Training Cause | Solution Category | Examples |\n" +
      "|---|---|---|\n" +
      "| No feedback | Management intervention | People don't know they're doing it wrong. Add quality monitoring, dashboards, manager observation. |\n" +
      "| No consequences | Incentive/accountability | Nothing happens when they do it wrong — or right. Realign KPIs, recognition, performance reviews. |\n" +
      "| Punished for doing it right | Remove obstacles | Following the correct procedure takes longer and they get penalized for slow throughput. Fix the conflict. |\n" +
      "| Obstacles in the way | Process/tool redesign | The tool makes it hard, the process has unnecessary steps, required resources are unavailable. |\n" +
      "| Not motivated | Engagement/change management | They know how and have the tools, but don't care. This is a leadership and culture problem, not a training problem. |\n\n" +
      "If **no** — they genuinely don't know how. Training (or performance support) is part of the solution:\n\n" +
      "| Skill Gap Type | Training Approach |\n" +
      "|---|---|\n" +
      "| Never learned it | Full training: teach the skill from foundations |\n" +
      "| Learned it but forgot (infrequent task) | Refresher + job aid for ongoing support |\n" +
      "| Learned it but can't transfer (context changed) | Bridging training: connect old skill to new context |\n" +
      "| Partially skilled (can do basics, not advanced) | Targeted upskilling: skip what they know, build on it |\n\n" +
      "**How to use the stakeholder's answer:**\n\n" +
      'Read their root cause hypothesis through this lens. If they say "they know the process but skip steps when they\'re busy," that\'s a *motivation/consequence* problem — training alone won\'t fix it. If they say "they were never shown the updated procedure," that\'s a genuine skill gap. Most real-world problems are a mix — document the training and non-training components separately.',
    stakeholderGuidance:
      'In your opinion, what\'s causing the performance gap? Think broadly — it might not be a knowledge issue. Consider whether people have the right tools, clear expectations, enough time, proper feedback, or organizational support.\n\n*Examples: "They were never trained on the updated procedure," "The old software made it easy — the new interface is confusing," "They know the process but skip steps when they\'re under time pressure," "There\'s no consequence for doing it wrong, so people take shortcuts"*',
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 203,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_05",
    section: "Performance & Impact",
    questionText: "What has already been done to address this problem?",
    idNotes:
      "This prevents you from recommending something that already failed. It also reveals the organizational appetite for solutions — have they tried coaching? New tools? Policy changes? Nothing? If training was already tried and didn't work, that's critical context: either the training was bad, or training isn't the solution. Either way, you need to know before you design.",
    stakeholderGuidance:
      'List any steps already taken to fix this problem — training, coaching, new tools, process changes, communications, etc. Include what worked partially and what didn\'t work at all.\n\n*Examples: "We sent a reminder email but nothing changed," "The vendor did a 1-hour webinar but it was too high-level," "We updated the SOP but people aren\'t reading it," "This is the first time we\'re addressing it formally"*',
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 204,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_06",
    section: "Performance & Impact",
    questionText:
      "Are there factors outside of training that contribute to this problem?",
    idNotes:
      'This is your "training as % of solution" question. Almost no performance problem is 100% solvable by training alone. The stakeholder may not realize this, so this question plants the seed. Document environmental factors as recommendations for complementary interventions alongside training.',
    idNotesExtended:
      "**Training as % of Solution Framework**\n\n" +
      "This framework makes explicit what experienced IDs know intuitively: training is almost never the whole answer. It forces you to estimate what percentage of the performance gap can realistically be closed by training, and what other interventions are needed.\n\n" +
      "**How to estimate the split:**\n\n" +
      "After reviewing the stakeholder's answers to PERF_04 (root cause) and PERF_06 (environmental factors), categorize each contributing cause:\n\n" +
      "| Cause Category | Addressable by Training? | Alternative Intervention |\n" +
      "|---|---|---|\n" +
      "| Lack of knowledge or skill | Yes | Training, practice, assessment |\n" +
      "| Lack of awareness (don't know it matters) | Partially | Training for awareness + management reinforcement |\n" +
      "| Forgetting (infrequent task) | Partially | Refresher training + job aid for ongoing support |\n" +
      "| Poor tools or interface | No | UX redesign, tool replacement, workaround documentation |\n" +
      "| Unclear expectations | No | Management communication, updated job descriptions, KPI alignment |\n" +
      "| No feedback loop | No | Quality monitoring, dashboards, manager observation cadence |\n" +
      "| No consequences | No | Performance management, accountability structures |\n" +
      "| Conflicting priorities | No | Workload management, priority alignment from leadership |\n" +
      "| Understaffing / time pressure | No | Hiring, process simplification, scope reduction |\n\n" +
      "**Example breakdown:**\n\n" +
      '*Problem: "Customer service reps aren\'t using the new CRM workflow correctly."*\n\n' +
      "| Factor | Training? | % of Solution |\n" +
      "|---|---|---|\n" +
      "| Reps were never trained on the new workflow | Training | 40% |\n" +
      "| The CRM interface is confusing and requires too many clicks | Tool redesign | 25% |\n" +
      "| Managers aren't monitoring CRM usage or coaching reps | Management intervention | 20% |\n" +
      "| Reps are evaluated on call volume, not CRM accuracy | KPI realignment | 15% |\n\n" +
      '**Training = 40% of the solution.** Present this to the stakeholder during design review — it sets realistic expectations and positions you as a strategic partner, not just a course builder.',
    stakeholderGuidance:
      'Training is often just one part of the solution. Are there other factors that need to be addressed alongside the training for it to be effective? Be honest — identifying these now saves time and money later.\n\n*Examples: "The software interface is genuinely confusing — a redesign is also needed," "Managers don\'t follow up or hold people accountable," "We\'re understaffed, so people rush through procedures," "The current KPIs actually reward the wrong behavior"*',
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 205,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: SUCCESS CRITERIA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "PERF_07",
    section: "Success Criteria",
    questionText:
      "What are the most complex or high-stakes situations where this performance gap shows up?",
    idNotes:
      "High-stakes situations are where training must be strongest. These scenarios get the most practice time, the most realistic simulations, and the most rigorous assessments. For performance problems specifically, this question surfaces the moments where failure is most costly — which directly informs your scenario-based design and assessment priorities.\n\nIf the stakeholder can describe specific situations where errors are visible or damaging, those become your anchor scenarios for practice activities. Build training backward from these critical moments.",
    stakeholderGuidance:
      "Where does this problem cause the most damage? Describe the situations, tasks, or moments where getting it wrong is most costly or visible.\n\n*Examples: \"During live customer demos — a botched pricing quote costs us the deal,\" \"When handling escalated complaints — one wrong response turns a complaint into a legal issue,\" \"End-of-month reporting — errors cascade and take days to untangle\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 206,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
  {
    id: "PERF_08",
    section: "Success Criteria",
    questionText:
      "How will you measure success? What specific metrics or observable changes would tell you this problem is fixed?",
    idNotes:
      "This directly feeds your evaluation plan and KPI definitions. Push for specific, quantifiable metrics — not \"people will do it right\" but \"billing error rate drops from 8% to under 2%.\" Each metric should connect back to the business impact described in PERF_03. If they can articulate the problem in numbers (PERF_03) but can't articulate success in numbers, surface that gap during review.\n\nThis is the bookend to PERF_03: that question measured the size of the problem, this one defines what \"fixed\" looks like.",
    idNotesExtended:
      "**Measuring Training Impact — The Four Levels**\n\n" +
      "**Level 1 — Reaction:** Did learners like the training? Easy to measure but tells you almost nothing about effectiveness.\n\n" +
      "**Level 2 — Learning:** Did learners acquire the knowledge or skill? Better, but still measures classroom outcomes, not job performance.\n\n" +
      "**Level 3 — Behavior:** Are learners doing things differently on the job? This is the first level that measures real impact. For performance problems, this is your primary target.\n\n" +
      "**Level 4 — Results:** Did business metrics improve? Connect back to PERF_03 — the metrics they cited as the problem should be the metrics they cite as success.\n\n" +
      "| Stakeholder Answer | Level | What to Do |\n" +
      "|---|---|---|\n" +
      "| \"People will feel more confident\" | Reaction | Push for observable behaviors |\n" +
      "| \"They'll pass the assessment\" | Learning | Ask what changes on the job after |\n" +
      "| \"Billing error rate drops from 8% to under 2%\" | Behavior/Results | Strong — measurable and directly tied to the problem |\n" +
      "| \"Customer satisfaction scores return to pre-change levels\" | Results | Good — clarify timeline and attribution |\n" +
      "| \"I'll know it when I see it\" | None | Define success *before* design begins |",
    stakeholderGuidance:
      "Think about the numbers you cited when describing the problem. What would those numbers look like when the problem is fixed? Be as specific as possible.\n\n*Examples: \"Billing error rate drops from 8% to under 2%,\" \"Average handle time returns to the 8-minute benchmark,\" \"Zero safety incidents related to this procedure for 6 consecutive months,\" \"Customer satisfaction scores return to 85%+\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 207,
    appliesTo: [TrainingType.PERFORMANCE_PROBLEM],
  },
];
