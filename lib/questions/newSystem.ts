import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

export const newSystemQuestions: QuestionDefinition[] = [
  {
    id: "SYS_01",
    section: "New System / Software Deployment",
    questionText:
      "What system, software, or tool is being introduced?",
    idNotes:
      "Get the exact product name and version. This determines whether vendor training exists, what documentation is available, and whether you can get sandbox/demo access for your own analysis. Also ask about the deployment model (cloud vs. on-prem, SaaS vs. custom) during review — it affects how quickly the interface might change after training goes live.",
    stakeholderGuidance:
      "Provide the name of the system or software being deployed, including version if known. If it's a custom-built tool, describe what it does.\n*Examples: \"Salesforce Lightning — migrating from Classic,\" \"Workday HCM — new implementation,\" \"Custom warehouse management app built by our internal dev team\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 30,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_02",
    section: "New System / Software Deployment",
    questionText:
      "What existing tools, systems, or processes does this replace? If it's entirely new functionality, describe what people do today without it.",
    idNotes:
      "The replacement context is your bridge to learner analysis. If they're moving from System A to System B, you can do a comparative task analysis. If it's net-new, you need to understand the manual/workaround processes that exist today. Either way, this gives you the \"from → to\" narrative that anchors the training. Also flags potential resistance: replacing a beloved tool is different from replacing a hated one.",
    stakeholderGuidance:
      "Help us understand what changes for the learners. Are they switching from one system to another, or learning something entirely new?\n*Examples: \"Replacing our legacy Excel-based tracking with a proper CRM,\" \"This is an addition — they'll keep using the current tools but add this for reporting,\" \"Currently this process is done manually with paper forms\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 31,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_03",
    section: "New System / Software Deployment",
    questionText:
      "What are the main tasks or workflows people will need to perform in the new system?",
    idNotes:
      "This is your task analysis seed. Stakeholders for new systems often dump feature lists here instead of tasks — \"they'll use the dashboard, the reporting module, the admin panel.\" Translate feature lists into action-oriented tasks during review. What does someone actually *do* with the dashboard? What reports do they run, and when, and why? This feeds directly into your objective writing and activity design.",
    stakeholderGuidance:
      "List the key things people will need to *do* in the new system — not features, but actual tasks. Think about a typical day or week.\n*Examples: \"Create and assign support tickets, run weekly performance reports, update customer records after calls, escalate cases that meet certain criteria\" / \"Enter time daily, submit expense reports, approve direct reports' requests, run headcount reports monthly\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 32,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_04",
    section: "New System / Software Deployment",
    questionText:
      "What does \"proficient use\" look like by the go-live date? What should people be able to do independently?",
    idNotes:
      "This is the \"success criteria\" question reframed for system deployments. It forces the stakeholder to define the minimum viable competency — not \"knows the system\" but \"can independently perform X, Y, Z without calling the help desk.\" This defines your training scope: everything above this line is in scope, everything below is a nice-to-have or Phase 2. Connect this to your objective writing and assessment design.",
    stakeholderGuidance:
      "By go-live day, what should people be able to do on their own? Be realistic — we can always build advanced training later. Focus on the must-haves for Day 1.\n*Examples: \"Create, edit, and close a support ticket. Search for existing tickets. Run the daily queue report. That's it for go-live — advanced reporting can wait.\" / \"Complete the full onboarding workflow for a new hire, including document generation and benefits enrollment\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 33,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_05",
    section: "New System / Software Deployment",
    questionText:
      "What is the deployment timeline? Is it a phased rollout or big-bang?",
    idNotes:
      "Phased rollouts let you iterate on training between waves — huge advantage. Big-bang means everyone needs to be trained simultaneously, which limits format options and requires more robust support materials (job aids, help desk prep). The timeline also tells you when you need sandbox access, how much content might change before go-live, and whether a pilot group is available for testing.",
    stakeholderGuidance:
      "Describe the rollout plan. Will everyone switch at once, or will it roll out in phases across teams, locations, or dates?\n*Examples: \"Big-bang: All 500 users switch on April 1,\" \"Phase 1: Pilot with 30 users in March. Phase 2: Full rollout in May.\" / \"Region by region over 6 months, starting with NA in Q2\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 34,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_06",
    section: "New System / Software Deployment",
    questionText:
      "Can the training team get access to a demo environment or sandbox of the system?",
    idNotes:
      "If yes, this is your most valuable resource — you can do your own task analysis, capture screenshots/recordings, and build realistic practice activities. If no, you're designing blind based on vendor docs and SME descriptions, which is risky. Flag \"no access\" as a project risk during review. Ask about the timeline for when access becomes available.",
    stakeholderGuidance:
      "Will the instructional design team be able to log into a test or demo version of the system to explore it and capture training content?",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Yes — sandbox/demo access is available now",
      "Yes — but not until a future date (please specify below)",
      "No — we'll need to work from documentation and demos",
      "Unsure — I need to check with IT/the vendor",
    ],
    displayOrder: 35,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_07",
    section: "New System / Software Deployment",
    questionText:
      "When will sandbox or demo access be available?",
    idNotes:
      "Critical for your project plan. Training development can't meaningfully start without system access (for screenshots, task walkthroughs, assessment scenarios). If this date is close to go-live, flag the compressed timeline as a risk.",
    stakeholderGuidance:
      "Provide the expected date or timeframe when the training team can access the demo environment.",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 36,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SYS_06",
      operator: "includes",
      value: "Yes — but not until a future date",
    },
  },
  {
    id: "SYS_08",
    section: "New System / Software Deployment",
    questionText:
      "Does the vendor provide any training, documentation, or learning resources?",
    idNotes:
      "Vendor training is almost never sufficient by itself — it's generic, not tailored to your workflows, and usually too feature-focused. But it's a useful starting point for content analysis and can supplement your custom training for advanced topics. Also check: is vendor training *required* before your training (e.g., certification prerequisites), or is it optional?",
    stakeholderGuidance:
      "List any training resources the software vendor provides — webinars, help articles, certification courses, videos, user guides, etc. We can build on these rather than duplicating them.\n*Examples: \"The vendor offers a 3-day admin certification course,\" \"There's an online help center with how-to articles,\" \"They offered a 1-hour recorded demo — I can share the link,\" \"Nothing useful — their documentation is written for developers, not end users\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 37,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SYS_09",
    section: "New System / Software Deployment",
    questionText:
      "What support will be available to users after go-live? Will there be designated Change Champions, super users, or floor support — and if so, have they been identified yet?",
    idNotes:
      "This defines what training *doesn't* need to cover and shapes your job aid / performance support recommendations. If there's robust help desk support, you can focus training on workflows and decision-making rather than step-by-step procedures. If support is thin, your training needs to be more comprehensive and your job aids more detailed.\n\nPay close attention to whether they mention Change Champions, super users, or floor walkers. These people are your force multipliers — but only if they're prepared. If the plan includes designated support people, that's a separate training workstream: those individuals need deeper system knowledge *and* the skills to coach others through problems, which is a different skillset than just being a proficient user. Flag this as a train-the-trainer need during your review if it hasn't already been scoped.",
    idNotesExtended:
      "**Change Champions & Train-the-Trainer**\n\n" +
      "A Change Champion (also called super user, floor walker, or go-live buddy) is someone embedded in the team who provides real-time support during and after the transition. This model is one of the most effective go-live strategies — but it introduces a second audience with different training needs.\n\n" +
      "**Why Change Champions need their own training:**\n\n" +
      "A good end-user can follow the process. A good Change Champion can diagnose *why someone else is stuck* and walk them through it without doing it for them. Those are fundamentally different skills:\n\n" +
      "| End-User Training | Change Champion Training |\n" +
      "|---|---|\n" +
      "| Perform standard workflows correctly | Perform standard *and* advanced workflows, including workarounds |\n" +
      "| Know where to find help | *Be* the help — troubleshoot common errors live |\n" +
      "| Follow the process | Explain *why* the process works this way |\n" +
      "| Complete their own tasks | Coach someone through a task while that person does it |\n" +
      "| Recognize when to escalate | Know the difference between a user error, a configuration issue, and a system bug |\n\n" +
      "**Train-the-trainer scoping checklist — raise these during review:**\n\n" +
      "- **Who are they?** Have specific people been identified, or is the plan still \"we'll figure it out\"? Vague plans often mean no one is actually prepared when go-live hits.\n" +
      "- **When do they train?** Change Champions need training *before* the general population — ideally 2-4 weeks ahead so they can practice and build confidence.\n" +
      "- **What's their time commitment?** During go-live week, are they fully released from normal duties to support others, or expected to do both? If both, the support will be thin regardless of how well they're trained.\n" +
      "- **How many per location/team?** A common ratio is 1 Change Champion per 15-25 end users, but it depends on complexity. For complex systems, closer to 1:10.\n" +
      "- **What resources do they get?** Change Champions need different materials than end users — troubleshooting guides, escalation paths, FAQ documents based on common issues from pilot, and a direct channel to IT support.\n" +
      "- **What happens after go-live stabilizes?** Do they return to normal duties? Stay as ongoing system experts? This affects whether you're building a temporary support model or a permanent one.\n\n" +
      "**Impact on your training plan:**\n\n" +
      "If Change Champions are part of the support model, your project now has two training tracks:\n\n" +
      "| Track | Audience | Content | Timing |\n" +
      "|---|---|---|---|\n" +
      "| **Track 1: Change Champion** | Designated super users (small group) | Deep system training + coaching skills + troubleshooting + escalation procedures | 2-4 weeks before general rollout |\n" +
      "| **Track 2: End-User** | General population | Standard workflows + where to get help (including \"ask your Change Champion\") | Per rollout schedule |\n\n" +
      "The Change Champion training is often best delivered as a hands-on workshop (live, not eLearning) because it needs to include practice coaching scenarios — not just system skills. Budget and scope this as a separate deliverable.",
    stakeholderGuidance:
      "What resources will users have after training when they get stuck? Think about help desks, Change Champions or super users, floor walkers, chat support, internal documentation, etc.\n\nIf you're planning to designate Change Champions or super users — people in each team who provide hands-on support during the transition — let us know who they are and when they'll be available. These individuals typically need their own training ahead of the general rollout so they're prepared to coach others, not just use the system themselves.\n\n*Examples: \"We're designating 5 Change Champions per department — they'll be fully released from normal duties during go-live week,\" \"IT help desk will have a dedicated queue for the first 30 days,\" \"No dedicated support planned — they'll need to figure it out from training and job aids,\" \"The vendor offers 24/7 chat support for the first 90 days,\" \"We have super users in mind but haven't formalized anything yet\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 38,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
];
