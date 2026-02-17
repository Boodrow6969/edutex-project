import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

/**
 * Dynamic questions for NEW_SYSTEM training type only.
 *
 * Sections covered:
 *   2. About the System (displayOrder 200–203)
 *   3. Business Justification (displayOrder 300–303)
 *   4. What Users Need to Do (displayOrder 400–403)
 *
 * 12 questions total.
 */

export const newSystemQuestions: QuestionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2: ABOUT THE SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SYS_01",
    section: "About the System",
    questionText:
      "What system, software, or tool is being introduced? In one or two sentences, what is its main purpose?",
    idNotes:
      "Get the exact product name and version. This determines whether vendor training exists, what documentation is available, and whether you can get sandbox/demo access for your own analysis. Also ask about the deployment model (cloud vs. on-prem, SaaS vs. custom) during review — it affects how quickly the interface might change after training goes live.",
    stakeholderGuidance:
      "Provide the name of the system being deployed, including version if known. If it's custom-built, describe what it does.\n\n*Examples: \"Salesforce Lightning — migrating from Classic,\" \"Workday HCM — new implementation,\" \"Custom warehouse management app built by our internal dev team\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 200,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_02",
    section: "About the System",
    questionText:
      "What are the system's main functions or capabilities? List the key things people can do in it.",
    idNotes:
      "This establishes the system's overall capability set *before* narrowing to specific tasks. The distinction matters: capabilities are what the system can do; tasks (Section 4) are what specific people *must* do. A system might have 50 capabilities but only 15 are relevant to training. This list becomes your universe — Section 4 narrows it to what matters for each role.\n\nThe reference analysis captured a rich capability list (self-service payments, autopay enrollment, document retrieval, etc.) that informed every downstream design decision. Push for specifics — not feature names but actions.",
    stakeholderGuidance:
      "Think about what the system lets users accomplish — not feature names, but actions. List as many as you can.\n\n*Examples: \"Create and assign support tickets, run weekly performance reports, update customer records after calls\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 201,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_03",
    section: "About the System",
    questionText:
      "What existing tools, systems, or processes does this replace? If it's entirely new functionality, describe what people do today without it.",
    idNotes:
      "The replacement context is your bridge to learner analysis. If they're moving from System A to System B, you can do a comparative task analysis. If it's net-new, you need to understand the manual/workaround processes that exist today. Either way, this gives you the \"from → to\" narrative that anchors the training. Also flags potential resistance: replacing a beloved tool is different from replacing a hated one.",
    stakeholderGuidance:
      "Help us understand what changes for the learners. Are they switching from one system to another, or learning something entirely new?\n\n*Examples: \"Replacing our legacy Excel-based tracking with a proper CRM,\" \"This is an addition — they'll keep using current tools but add this for reporting,\" \"Currently done manually with paper forms\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 202,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_04",
    section: "About the System",
    questionText:
      "What other systems does this connect to or interact with?",
    idNotes:
      "Integration points create training scope boundaries and potential error zones. The reference analysis captured critical integration points (defi Servicing, Repay, EDW, EDMS) that directly shaped training scope — the Repay integration alone became a separate training track. Each connected system is a potential handoff point where errors can occur, and those handoffs often need to be taught explicitly.",
    stakeholderGuidance:
      "List any systems that send data to or receive data from the new system. This helps us understand the broader workflow and identify where handoffs or errors might occur.\n\n*Examples: \"Salesforce connects to our ERP for order data and to Marketo for marketing automation,\" \"The portal pulls from the servicing system and sends payments through a third-party processor\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 203,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3: BUSINESS JUSTIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SYS_05",
    section: "Business Justification",
    questionText:
      "What business problem does this system solve? What inefficiency, cost, or limitation does it address?",
    idNotes:
      "This was the biggest gap in the previous form. Without business justification, you're designing training in a vacuum. The answer here tells you *why* the organization is spending money on this system, which determines what the training needs to emphasize. If the system solves a customer satisfaction problem, training should prioritize customer-facing workflows. If it solves an efficiency problem, training should emphasize speed and accuracy.\n\nThe reference analysis captured critical context (low customer satisfaction, lack of payment options, no lease-end visibility) that shaped the entire training strategy. Push for specifics during review.",
    stakeholderGuidance:
      "Help us understand why this system matters. What's broken, slow, expensive, or missing today that this system fixes?\n\n*Examples: \"Customer satisfaction is low because they can only pay by one method,\" \"We're spending 40 hours/week on manual data entry that this automates,\" \"We have no visibility into field operations without this dashboard\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 300,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_06",
    section: "Business Justification",
    questionText:
      "What are the consequences if employees struggle to use this system effectively?",
    idNotes:
      "Failure consequences directly inform training priority and risk assessment. High-consequence scenarios (payment processing errors, compliance violations, customer-facing failures) need more training depth, more practice, and more rigorous assessment than low-consequence scenarios. This answer feeds your training decision (Section 4) and helps justify investment in simulation or hands-on practice.\n\nThe reference analysis surfaced increased support calls and downstream payment processing impacts — both informed the decision to include extensive practice scenarios.",
    stakeholderGuidance:
      "Think about what happens to the business if your internal team can't use the system well after launch. Consider impact on customers, call volume, processing times, errors, and compliance.\n\n*Examples: \"Delayed customer service, increased call times,\" \"Payment processing errors that affect revenue,\" \"Compliance findings in the next audit\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 301,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_07",
    section: "Business Justification",
    questionText:
      "If this system has external users (customers, partners, vendors), what are the consequences if they struggle to use it?",
    idNotes:
      "Not all systems have external users — this question is optional for that reason. When external users exist, their adoption failures create different problems than internal failures: increased support calls to *your* team, abandoned transactions, customer churn, partner dissatisfaction. This often reveals a need for customer-facing training materials (help articles, walkthrough videos) in addition to employee training.\n\nThe reference analysis asked this separately from employee consequences and got different, actionable info. Internal failure = operational delays. External failure = customer frustration and support volume spikes.",
    stakeholderGuidance:
      "Not all systems have external users — skip this if yours is internal only. If there are external users, think about what happens when they get stuck.\n\n*Examples: \"Increased support calls, customer frustration, abandoned transactions,\" \"Partners stop using the portal and revert to email/phone\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 302,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_08",
    section: "Business Justification",
    questionText:
      "How will you measure success after launch? What specific metrics or observable changes would tell you this worked?",
    idNotes:
      "This is the single most important question for new system deployments. The answer (or lack of one) tells you whether the stakeholder is thinking in terms of measurable outcomes or just wants a checkbox. Push for specific, quantifiable metrics — not \"people will use the system\" but \"self-service portal usage reaches 60% within 90 days.\"\n\nThis directly feeds your evaluation plan, KPI definitions, and objective writing. Each metric should map to a training outcome you can influence.",
    idNotesExtended:
      "**Measuring Training Impact — The Four Levels**\n\n" +
      "**Level 1 — Reaction:** Did learners like the training? Easy to measure but tells you almost nothing about effectiveness.\n\n" +
      "**Level 2 — Learning:** Did learners acquire the knowledge or skill? Better, but still measures classroom outcomes, not job performance.\n\n" +
      "**Level 3 — Behavior:** Are learners doing things differently on the job? This is the first level that measures real impact.\n\n" +
      "**Level 4 — Results:** Did business metrics improve? This is what the sponsor cares about.\n\n" +
      "| Stakeholder Answer | Level | What to Do |\n" +
      "|---|---|---|\n" +
      "| \"People will feel more confident\" | Reaction | Push for observable behaviors |\n" +
      "| \"They'll pass the assessment\" | Learning | Ask what changes on the job after |\n" +
      "| \"Call resolution time drops from 12 to 8 min\" | Behavior | Strong — observable and measurable |\n" +
      "| \"Self-service usage reaches 60% in 90 days\" | Results | Excellent — clarify attribution |\n" +
      "| \"I don't know — just train them\" | None | Define success *before* design begins |",
    stakeholderGuidance:
      "Think beyond \"people completed the training.\" What business metric would improve? What would you see people doing differently? Be as specific as you can.\n\n*Examples: \"Call resolution time drops from 12 minutes to 8 minutes,\" \"Self-service portal usage reaches 60% within 90 days,\" \"Autopay enrollment increases by 25%,\" \"Zero payment processing errors in the first 30 days\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 303,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4: WHAT USERS NEED TO DO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SYS_09",
    section: "What Users Need to Do",
    questionText:
      "What are the main tasks or workflows people will need to perform in the new system?",
    idNotes:
      "This is your task analysis seed. Stakeholders for new systems often dump feature lists here instead of tasks — \"they'll use the dashboard, the reporting module, the admin panel.\" Translate feature lists into action-oriented tasks during review. What does someone actually *do* with the dashboard? What reports do they run, and when, and why?\n\nIf different roles do different things, the stakeholder should list them separately. Cross-reference with the audience table (Section 5) to build role-task matrices.",
    stakeholderGuidance:
      "Think about a typical day or week. What does someone actually do in this system? If different roles do different things, list them separately.\n\n*Examples: \"Create and assign support tickets, run weekly performance reports, update customer records after calls, escalate cases that meet certain criteria\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 400,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_10",
    section: "What Users Need to Do",
    questionText:
      "What are the most complex or high-stakes situations? Where would mistakes be costly or visible?",
    idNotes:
      "High-stakes situations are where your training needs to be strongest. These scenarios get the most practice time, the most realistic simulations, and the most rigorous assessments. They're also prime candidates for job aids — decision support tools that help people navigate complex situations in real time.\n\nThe reference analysis surfaced payment processing risk as a high-stakes area. That single finding drove the decision to include extensive practice scenarios and a dedicated job aid for the payment workflow.",
    stakeholderGuidance:
      "Help us identify where we need to focus extra training attention. What tasks, if done wrong, would cause the most damage?\n\n*Examples: \"Processing a payment incorrectly could result in double-charges,\" \"Approving the wrong access level could create a security breach,\" \"Submitting incorrect regulatory data triggers an audit\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 401,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_11",
    section: "What Users Need to Do",
    questionText:
      "What does \"proficient use\" look like by the go-live date? What should people be able to do independently?",
    idNotes:
      "This defines the minimum viable competency — not \"knows the system\" but \"can independently perform X, Y, Z without calling the help desk.\" This defines your training scope: everything above this line is in scope, everything below is a nice-to-have or Phase 2. Connect this to your objective writing and assessment design.",
    stakeholderGuidance:
      "Be realistic — we can always build advanced training later. Focus on the must-haves for Day 1.\n\n*Examples: \"Create, edit, and close a support ticket. Search for existing tickets. Run the daily queue report. That's it for go-live — advanced reporting can wait.\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 402,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_12",
    section: "What Users Need to Do",
    questionText:
      "What does proficient performance look like 30 days after launch? What additional capabilities should people have by then?",
    idNotes:
      "The reference analysis split launch performance from 30-day performance and got meaningfully different answers. This is critical for phasing training delivery: Day 1 training covers the basics, then follow-up training (advanced modules, performance support updates, coaching) builds toward 30-day proficiency.\n\nIf the stakeholder's 30-day expectations are significantly beyond Day 1, that's your cue to plan a phased training delivery rather than trying to cram everything into a single pre-launch session.",
    stakeholderGuidance:
      "After a month of use, what should people be able to do beyond the Day 1 basics? This helps us plan follow-up training, advanced modules, or performance support.\n\n*Examples: \"Handle edge cases without escalating,\" \"Run and interpret advanced reports,\" \"Troubleshoot common errors independently\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 403,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
];
