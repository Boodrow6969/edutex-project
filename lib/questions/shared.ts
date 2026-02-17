import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

/**
 * Shared (STATIC) questions — appear for ALL training types.
 *
 * Sections covered:
 *   1. Project Context (displayOrder 100–104)
 *   5. Who Will Use This System (displayOrder 500–510)
 *   6. Rollout Plan (displayOrder 600–602)
 *   7. Training Constraints and Resources (displayOrder 700–710)
 *   8. SMEs and Stakeholders (displayOrder 800–801)
 *   9. Concerns and Final Thoughts (displayOrder 900–902)
 *
 * Dynamic sections 2–4 are defined per-type (e.g., newSystem.ts).
 *
 * A legacy success-measures question (SHARED_LEGACY_SUCCESS) is retained
 * for non-NEW_SYSTEM types. NEW_SYSTEM uses SYS_08 (Section 3.4) instead.
 */

export const sharedQuestions: QuestionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1: PROJECT CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_01",
    section: "Project Context",
    questionText: "What is the name of this project or initiative?",
    idNotes:
      "Use this as the display name in the project list. If the stakeholder gives a vague name like \"training\" or \"new system,\" you'll want to refine this during review. This isn't a formal title — it's a working label.",
    stakeholderGuidance:
      "Give this project a short, descriptive name so everyone can reference it easily. It doesn't need to be the final course title.\n\n*Examples: \"2026 Salesforce Migration Training,\" \"Q3 Safety Policy Update,\" \"New Hire Onboarding Redesign\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 100,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_02",
    section: "Project Context",
    questionText:
      "Who is the executive sponsor or leader requesting this training?",
    idNotes:
      "This is the person with budget authority and decision-making power — not necessarily the SME or the person filling out this form. Knowing the sponsor helps you understand organizational priority and who signs off on the final product. If the stakeholder *is* the sponsor, that's worth noting during review.",
    stakeholderGuidance:
      "This is the leader who initiated or approved this training request. They're typically the person accountable for the business outcome the training supports.\n\n*Examples: \"Maria Chen, VP of Operations,\" \"Tom Parker, Director of Compliance\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 101,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_03",
    section: "Project Context",
    questionText:
      "What is your role in relation to this training project?",
    idNotes:
      "This tells you who you're actually talking to. A sponsor gives strategic answers. A manager gives operational answers. An SME gives technical answers. Calibrate how you interpret all other responses based on this answer. If they select \"Other,\" dig into that during review — they might be an admin assistant filling this out on behalf of someone else.",
    stakeholderGuidance:
      "Select the role that best describes your relationship to this project.",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Executive Sponsor (I approved or initiated this request)",
      "Department Manager (I manage the team that needs training)",
      "Subject Matter Expert (I have deep knowledge of the content area)",
      "Project Manager (I'm coordinating the initiative this training supports)",
      "Other (please describe in the next field)",
    ],
    displayOrder: 102,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_04",
    section: "Project Context",
    questionText: "Please describe your role in this project.",
    idNotes:
      "Only appears if they select \"Other\" in SHARED_03. This free-text field catches edge cases — HR business partners, external consultants, executive assistants acting as proxies, etc.",
    stakeholderGuidance:
      "Briefly describe how you're involved in this project and what perspective you bring.",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 103,
    appliesTo: "ALL",
    conditional: {
      questionId: "SHARED_03",
      operator: "includes",
      value: "Other",
    },
  },
  {
    id: "SHARED_05",
    section: "Project Context",
    questionText:
      "What is the target date or deadline for this training to be available?",
    idNotes:
      "A hard deadline (compliance date, system go-live) vs. a soft goal (\"sometime in Q2\") tells you entirely different things about project constraints. Flag hard deadlines prominently in your review — they dictate scope, format decisions, and whether phased delivery makes sense. If the timeline is unrealistic for the scope, that's a critical review finding.",
    stakeholderGuidance:
      "If there's a specific date this training needs to be ready (like a system go-live or regulatory deadline), enter it here. If it's more of a general timeframe, describe that instead.\n\n*Examples: \"March 15, 2026 — system go-live,\" \"By end of Q2, flexible on exact date\"*",
    fieldType: FieldType.DATE_WITH_TEXT,
    required: true,
    displayOrder: 104,
    appliesTo: "ALL",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5: WHO WILL USE THIS SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_06",
    section: "Who Will Use This System",
    questionText:
      "What job roles will use this system? For each role, provide the approximate number of users and how often they'll use it.",
    idNotes:
      "This is your audience segmentation seed. The tabular format forces stakeholders to think in terms of distinct groups rather than a single blob of \"everyone.\" Each row may become a separate audience profile in your analysis. Pay attention to frequency — daily users need different training than occasional users. If they list more than 3-4 roles, that's a signal you may need multiple training tracks.",
    stakeholderGuidance:
      "Include everyone who will interact with the system, even occasionally.",
    fieldType: FieldType.REPEATING_TABLE,
    tableColumns: [
      { key: "role", label: "Role / Title" },
      { key: "headcount", label: "Approx. # of Users" },
      { key: "frequency", label: "Frequency (Daily / Weekly / Occasionally)" },
    ],
    required: true,
    displayOrder: 500,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_07",
    section: "Who Will Use This System",
    questionText:
      "Do different roles use the system differently? If yes, describe how usage differs by role.",
    idNotes:
      "This determines single-track vs. multi-track training. If the answer is \"everyone does the same thing,\" you build one course. If roles diverge significantly, you need role-specific learning paths. The example from the reference analysis is instructive: all teams needed payment processing training, but only CS Support and Maturity teams needed detailed portal training. That kind of split creates two training tracks from one project.",
    stakeholderGuidance:
      "If some roles need deeper training on certain features, or use the system in a completely different way, tell us here. This determines whether we build one training track or several.\n\n*Example: \"All teams need payment processing training. But CS Support and Maturity teams also need detailed portal training so they can answer customer questions.\"*",
    fieldType: FieldType.SINGLE_SELECT,
    required: false,
    options: [
      "No, everyone uses it the same way",
      "Yes (please describe below)",
    ],
    displayOrder: 501,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_07B",
    section: "Who Will Use This System",
    questionText:
      "Describe how usage differs by role.",
    idNotes:
      "Capture role-specific workflow differences. This directly feeds audience profile creation and training track decisions.",
    stakeholderGuidance:
      "Describe which roles need different features, workflows, or depth of training.",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 502,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SHARED_07",
      operator: "includes",
      value: "Yes",
    },
  },
  {
    id: "SHARED_08",
    section: "Who Will Use This System",
    questionText:
      "How would you describe the typical user's comfort level with technology?",
    idNotes:
      "This calibrates your design complexity. \"Very comfortable\" audiences can handle self-directed eLearning with minimal hand-holding. \"Limited\" audiences need more structured guidance, simpler interfaces, and more practice time. Don't take the stakeholder's word as gospel — managers often overestimate their team's comfort level. Validate during pilot if possible.",
    stakeholderGuidance:
      "Think about the majority of users, not the outliers.",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Very comfortable — picks up new systems quickly",
      "Moderate — needs some guidance but adapts",
      "Limited — will need significant support and practice",
    ],
    displayOrder: 503,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_09",
    section: "Who Will Use This System",
    questionText:
      "Are users currently using a similar system that this replaces? If yes, how long have they used it?",
    idNotes:
      "Prior experience fundamentally changes your instructional approach. If people are switching from a familiar system, you can use a comparative approach (\"In the old system you did X; in the new system you do Y\"). If it's entirely new, you need ground-up instruction. Long-tenured users of the old system often have the hardest time switching — their muscle memory works against them.",
    stakeholderGuidance:
      "If people are switching from a familiar system, we can focus on what's different. If it's entirely new, we need more ground-up instruction.",
    fieldType: FieldType.SINGLE_SELECT,
    required: false,
    options: [
      "Yes",
      "No, this is their first system of this type",
    ],
    displayOrder: 504,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_09B",
    section: "Who Will Use This System",
    questionText:
      "How long have they used the current system?",
    idNotes:
      "Duration of use indicates depth of habit formation. Users with 5+ years on the old system will need more unlearning support than those with 6 months.",
    stakeholderGuidance:
      "Approximate duration is fine — e.g., \"about 3 years\" or \"since 2019.\"",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 505,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SHARED_09",
      operator: "equals",
      value: "Yes",
    },
  },
  {
    id: "SHARED_10",
    section: "Who Will Use This System",
    questionText:
      "Will there be super users, power users, or Change Champions who support others during and after the transition? If so, have they been identified?",
    idNotes:
      "Change Champions are force multipliers — but only if they're prepared. If the plan includes designated support people, that's a separate training workstream. Those individuals need deeper system knowledge *and* the skills to coach others, which is a different skillset than just being a proficient user. Flag this as a train-the-trainer need during your review if it hasn't already been scoped.",
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
      "**Impact on your training plan:**\n\n" +
      "If Change Champions are part of the support model, your project now has two training tracks:\n\n" +
      "| Track | Audience | Content | Timing |\n" +
      "|---|---|---|---|\n" +
      "| **Track 1: Change Champion** | Designated super users (small group) | Deep system training + coaching skills + troubleshooting + escalation procedures | 2-4 weeks before general rollout |\n" +
      "| **Track 2: End-User** | General population | Standard workflows + where to get help (including \"ask your Change Champion\") | Per rollout schedule |",
    stakeholderGuidance:
      "Change Champions get extra training ahead of the rollout so they can coach others. If you're planning them, let us know — they need their own training track.",
    fieldType: FieldType.SINGLE_SELECT,
    required: false,
    options: [
      "Yes",
      "No",
      "Not yet determined",
    ],
    displayOrder: 506,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_10B",
    section: "Who Will Use This System",
    questionText:
      "Who are the Change Champions or super users?",
    idNotes:
      "Get names, roles, and locations if possible. These people need to be scheduled for early training and may need to be involved in pilot testing.",
    stakeholderGuidance:
      "List names and roles if known, or describe the plan for identifying them.",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 507,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SHARED_10",
      operator: "equals",
      value: "Yes",
    },
  },
  {
    id: "SHARED_11",
    section: "Who Will Use This System",
    questionText:
      "What support will be available to users after training?",
    idNotes:
      "This defines what training *doesn't* need to cover and shapes your job aid / performance support recommendations. If there's robust help desk support, you can focus training on workflows and decision-making rather than step-by-step procedures. If support is thin, your training needs to be more comprehensive and your job aids more detailed.",
    stakeholderGuidance:
      "What resources will users have when they get stuck after training?\n\n*Examples: \"IT help desk dedicated queue for 30 days,\" \"Vendor 24/7 chat for 90 days,\" \"Manager coaching and check-ins,\" \"No dedicated support — rely on training and job aids\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 508,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6: ROLLOUT PLAN
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_12",
    section: "Rollout Plan",
    questionText: "How will the system be rolled out?",
    idNotes:
      "Phased rollouts let you iterate on training between waves — huge advantage. Big-bang means everyone needs to be trained simultaneously, which limits format options and requires more robust support materials. Pilot-first gives you a testing ground for your training before the broader audience sees it.",
    stakeholderGuidance:
      "Select the approach that best describes the rollout plan.",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Big bang — everyone goes live at once",
      "Phased — groups go live at different times",
      "Pilot first, then broader rollout",
      "Not yet determined",
    ],
    displayOrder: 600,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_13",
    section: "Rollout Plan",
    questionText:
      "If phased or pilot, which groups go first and when?",
    idNotes:
      "The phase order determines your training development priority. First-wave groups need training first, and their experience informs revisions for later waves. Get specific dates if possible — vague \"Q2\" answers need to be pinned down during review.",
    stakeholderGuidance:
      "List each group and their target go-live date.",
    fieldType: FieldType.REPEATING_TABLE,
    tableColumns: [
      { key: "group", label: "Group" },
      { key: "goLiveDate", label: "Target Go-Live Date" },
    ],
    required: true,
    displayOrder: 601,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SHARED_12",
      operator: "includes",
      value: "Phased",
    },
  },
  {
    id: "SHARED_13B",
    section: "Rollout Plan",
    questionText:
      "If phased or pilot, which groups go first and when?",
    idNotes:
      "The pilot group is your testing ground. Their experience informs revisions for the broader rollout.",
    stakeholderGuidance:
      "List each group and their target go-live date.",
    fieldType: FieldType.REPEATING_TABLE,
    tableColumns: [
      { key: "group", label: "Group" },
      { key: "goLiveDate", label: "Target Go-Live Date" },
    ],
    required: true,
    displayOrder: 601,
    appliesTo: [TrainingType.NEW_SYSTEM],
    conditional: {
      questionId: "SHARED_12",
      operator: "includes",
      value: "Pilot",
    },
  },
  {
    id: "SHARED_14",
    section: "Rollout Plan",
    questionText:
      "When do users need to complete training relative to their go-live date?",
    idNotes:
      "Training-to-go-live timing directly affects retention. Too early (4+ weeks) and people forget procedural details. Too late (day-of) and they're overwhelmed. The sweet spot is typically 1-2 weeks before go-live with a refresher or job aid available on Day 1. If the stakeholder hasn't thought about this, it's a flag — surface it during review.",
    stakeholderGuidance:
      "How far in advance should training be completed? Too early and people forget; too late and they're not ready.\n\n*Examples: \"1 week before go-live,\" \"Same week,\" \"2 weeks before, with refresher the day before\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 602,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 7: TRAINING CONSTRAINTS AND RESOURCES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_15",
    section: "Training Constraints and Resources",
    questionText:
      "Do you have a preference for how this training is delivered? Select any formats that would work. If different roles need different formats, note that.",
    idNotes:
      "Stakeholder preferences aren't design decisions — you'll make the final recommendation based on audience, content type, and constraints. But knowing their expectations helps you manage the conversation. If they expect a 2-hour eLearning course and the analysis suggests a job aid + 15-minute micro-lesson, you'll need to navigate that gap during design review.",
    idNotesExtended:
      "**Delivery Format Selection Guide**\n\n" +
      "Use this reference when comparing the stakeholder's preference against what the analysis actually calls for.\n\n" +
      "| Format | Best For | Watch Out For |\n" +
      "|---|---|---|\n" +
      "| **Self-paced eLearning** | Consistent procedural content, large/dispersed audiences, compliance training | Overused for content that needs discussion or practice with feedback |\n" +
      "| **Virtual instructor-led (VILT)** | Complex topics needing discussion, scenario practice with live feedback | Scheduling logistics with shift workers or global teams |\n" +
      "| **In-person classroom** | Hands-on skills, equipment operation, high-stakes simulations | Expensive at scale. Often requested out of habit when VILT would work |\n" +
      "| **Blended** | Most robust for complex skills — combines knowledge transfer (async) with practice (live) | Requires more design effort and coordination |\n" +
      "| **Job aid / Quick reference** | Infrequent tasks, complex procedures with many steps | Not training — it's performance support |\n" +
      "| **Video / Recorded walkthrough** | Software demonstrations, process overviews | Expensive to update when content changes. Passive — no practice built in |\n" +
      "| **On-the-job coaching** | Role transitions, leadership development, nuanced judgment skills | Depends entirely on coach quality |",
    stakeholderGuidance:
      "Select any delivery formats you think would work well for this audience. The instructional design team will make a final recommendation based on the full analysis, but your input helps us understand expectations.",
    fieldType: FieldType.MULTI_SELECT,
    required: false,
    options: [
      "Self-paced eLearning",
      "Virtual instructor-led (live online session)",
      "In-person classroom",
      "Blended (combination of formats)",
      "Job aid / quick reference guide",
      "Video / recorded walkthrough",
      "On-the-job coaching or mentoring",
      "No preference — recommend what works best",
    ],
    displayOrder: 700,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_16",
    section: "Training Constraints and Resources",
    questionText:
      "Can the training team get access to a demo environment or sandbox?",
    idNotes:
      "If yes, this is your most valuable resource — you can do your own task analysis, capture screenshots/recordings, and build realistic practice activities. If no, you're designing blind based on vendor docs and SME descriptions, which is risky. Flag \"no access\" as a project risk during review.",
    stakeholderGuidance:
      "Will the instructional design team be able to log into a test or demo version of the system to explore it and capture training content?",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Yes — available now",
      "Yes — but not until a future date (please specify below)",
      "No — we'll work from documentation and demos",
      "Unsure — I need to check with IT/the vendor",
    ],
    displayOrder: 701,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_16B",
    section: "Training Constraints and Resources",
    questionText:
      "When will sandbox or demo access be available?",
    idNotes:
      "Critical for your project plan. Training development can't meaningfully start without system access. If this date is close to go-live, flag the compressed timeline as a risk.",
    stakeholderGuidance:
      "Provide the expected date or timeframe when the training team can access the demo environment.",
    fieldType: FieldType.DATE_WITH_TEXT,
    required: true,
    displayOrder: 702,
    appliesTo: "ALL",
    conditional: {
      questionId: "SHARED_16",
      operator: "includes",
      value: "not until a future date",
    },
  },
  {
    id: "SHARED_17",
    section: "Training Constraints and Resources",
    questionText:
      "Can we use realistic (or realistic-looking) data in training?",
    idNotes:
      "Realistic data makes training activities more credible and helps learners transfer skills to the real system. If they need dummy data, factor in time for creating a realistic test dataset. Some regulated industries have strict rules about using real data in training environments.",
    stakeholderGuidance:
      "Let us know if we can use real or realistic-looking data for training scenarios and practice activities.",
    fieldType: FieldType.SINGLE_SELECT,
    required: false,
    options: [
      "Yes",
      "No — we will need to use dummy data",
      "Don't know",
    ],
    displayOrder: 703,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_18",
    section: "Training Constraints and Resources",
    questionText:
      "Does any training, documentation, or reference material already exist for this topic?",
    idNotes:
      "Existing materials are goldmines for content analysis — even bad ones tell you what's been tried. Ask for access to anything they mention during review. Also surfaces potential political issues: if someone else built the \"old\" training, tread carefully on criticism.",
    stakeholderGuidance:
      "List anything related — even if outdated.\n\n*Examples: \"2023 onboarding deck in SharePoint,\" \"Vendor user guide PDF,\" \"Nothing formal — tribal knowledge\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 704,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_19",
    section: "Training Constraints and Resources",
    questionText:
      "Does the vendor provide any training, documentation, or learning resources?",
    idNotes:
      "Vendor training is almost never sufficient by itself — it's generic, not tailored to your workflows, and usually too feature-focused. But it's a useful starting point for content analysis and can supplement your custom training for advanced topics. Also check: is vendor training *required* before your training (e.g., certification prerequisites), or is it optional?",
    stakeholderGuidance:
      "List vendor-provided resources — webinars, help articles, certification courses, videos, user guides.\n\n*Examples: \"Vendor offers a 3-day admin certification,\" \"Online help center,\" \"1-hour recorded demo,\" \"Nothing useful — developer-facing docs\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 705,
    appliesTo: [TrainingType.NEW_SYSTEM],
  },
  {
    id: "SHARED_20",
    section: "Training Constraints and Resources",
    questionText:
      "Are there scheduling constraints or blackout dates we should know about?",
    idNotes:
      "Scheduling constraints can eliminate entire delivery format options. If learners only have 30-minute windows, a 4-hour VILT is off the table. Payment-date blackouts, holiday freezes, and audit periods are common constraints that stakeholders forget to mention until they become blockers.",
    stakeholderGuidance:
      "Dates or periods when training cannot be scheduled.\n\n*Examples: \"Cannot release at month-end/month-start,\" \"Avoid the 15th — heavy payment day,\" \"Holiday freeze Dec 15 – Jan 5\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 706,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_21",
    section: "Training Constraints and Resources",
    questionText: "Is there a training budget allocated?",
    idNotes:
      "Budget shapes every design decision. No budget means you're building internally with existing tools. A large budget opens up options like vendor-produced video, custom simulations, or external facilitators. \"Don't know\" is common — it means someone else controls the budget and you need to find out who.",
    stakeholderGuidance:
      "Let us know if there's a dedicated budget for this training project.",
    fieldType: FieldType.SINGLE_SELECT,
    required: false,
    options: [
      "Yes",
      "No dedicated budget",
      "Don't know",
    ],
    displayOrder: 707,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_21B",
    section: "Training Constraints and Resources",
    questionText:
      "What is the budget amount or range?",
    idNotes:
      "Even a rough range helps scope the project. $5K vs. $50K vs. $500K are entirely different projects.",
    stakeholderGuidance:
      "An approximate amount or range is fine.",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 708,
    appliesTo: "ALL",
    conditional: {
      questionId: "SHARED_21",
      operator: "equals",
      value: "Yes",
    },
  },
  {
    id: "SHARED_22",
    section: "Training Constraints and Resources",
    questionText:
      "Are there any other constraints, limitations, or special considerations?",
    idNotes:
      "This is your catch-all for things that don't fit elsewhere: technology restrictions (no video, must work offline), union rules, language needs, accessibility requirements, political sensitivities, shift schedules that limit seat time, etc.",
    stakeholderGuidance:
      "Technology, language, accessibility, organizational factors, anything else.\n\n*Examples: \"30-minute windows between shifts,\" \"Must be in English and Spanish,\" \"Some learners don't have laptops\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 709,
    appliesTo: "ALL",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 8: SUBJECT MATTER EXPERTS AND STAKEHOLDERS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_23",
    section: "SMEs and Stakeholders",
    questionText: "Who are the subject matter experts we can work with?",
    idNotes:
      "SMEs are your primary content source. Get names, roles, and the best way to reach them. Note whether they're internal or external (vendor SMEs have different availability and knowledge). If no SMEs are listed, that's a project risk — flag it during review.",
    stakeholderGuidance:
      "List the people with deep knowledge of this topic who can help us get the content right.",
    fieldType: FieldType.REPEATING_TABLE,
    tableColumns: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "contact", label: "Best Contact Method" },
    ],
    required: false,
    displayOrder: 800,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_24",
    section: "SMEs and Stakeholders",
    questionText:
      "Who else should we involve? Please distinguish between people who provide input/expertise and people with approval authority.",
    idNotes:
      "This builds your stakeholder map. People named here become candidates for review cycles and pilot testing. Watch for the \"too many approvers\" trap. When every stakeholder listed here expects sign-off authority, review cycles multiply and contradictory feedback creates gridlock. During your review, clarify roles explicitly: who *contributes input* vs. who *approves the final product.* If you see three or more names here, proactively set up a RACI agreement before the first review cycle.",
    idNotesExtended:
      "**RACI Framework for Training Projects**\n\n" +
      "RACI clarifies who does what so feedback cycles don't become a free-for-all:\n\n" +
      "**R — Responsible:** Does the work (you — the instructional designer).\n" +
      "**A — Accountable:** Makes the final decision. Usually the executive sponsor. *There can only be one \"A\" per deliverable.*\n" +
      "**C — Consulted:** Provides expert input. SMEs, team leads, technical specialists.\n" +
      "**I — Informed:** Gets updates but isn't part of the decision.\n\n" +
      "**When to set up RACI:** If the stakeholder lists three or more names, draft a simple RACI table during your review and share it at the kickoff meeting.",
    stakeholderGuidance:
      "Training projects move fastest when there's a clear distinction between input and approval. When too many people have approval authority, feedback conflicts and timelines stall.\n\n*Examples: \"Jake Torres, Senior Analyst — input/expertise,\" \"Maria Lopez, VP Operations — final approver,\" \"Legal — approval on compliance language only\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 801,
    appliesTo: "ALL",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9: CONCERNS AND FINAL THOUGHTS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_25",
    section: "Concerns and Final Thoughts",
    questionText:
      "What concerns do you have about this rollout or the training?",
    idNotes:
      "This surfaces risk early. Stakeholders often know where the problems are but haven't been asked directly. Common concerns: scope across many teams, getting third-party materials on time, not enough time, resistance to change, competing priorities. Every concern listed here should appear in your risk register.",
    stakeholderGuidance:
      "What's the biggest risk? Telling us now helps us plan for it.\n\n*Examples: \"Scope across so many teams,\" \"Getting third-party materials on time,\" \"Not enough time\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 900,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_26",
    section: "Concerns and Final Thoughts",
    questionText:
      "What would make this training a success in your eyes?",
    idNotes:
      "This captures the qualitative stakeholder-confidence metric that's distinct from quantitative success metrics. The answer here often reveals what the sponsor *really* cares about — which may be different from the formal metrics. \"No surprises on go-live day\" tells you they value preparation and readiness. \"Business stakeholders feel their teams are prepared\" tells you perception matters as much as actual competency.",
    stakeholderGuidance:
      "Beyond metrics — what would you personally need to see or hear to feel confident?\n\n*Examples: \"Business stakeholders feel their teams are prepared,\" \"No surprises on go-live day,\" \"Call center doesn't get overwhelmed week one\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 901,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_27",
    section: "Concerns and Final Thoughts",
    questionText: "Is there anything else we should know?",
    idNotes:
      "The catch-all. Occasionally surfaces critical information that didn't fit elsewhere. Review any response here carefully — stakeholders sometimes save the most important thing for last.",
    stakeholderGuidance:
      "Anything that didn't fit into the previous questions.",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 902,
    appliesTo: "ALL",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY: Success Measures (for non-NEW_SYSTEM types)
  //
  // NEW_SYSTEM uses the more specific SYS_08 (Section 3.4) instead.
  // Other training types retain this general success question until their
  // own dynamic sections are revised.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SHARED_LEGACY_SUCCESS",
    section: "Project Context",
    questionText:
      "How will you know this training was successful? What would be different afterward?",
    idNotes:
      "This is the single most important question on the form. The answer (or lack of one) tells you whether the stakeholder is thinking in terms of measurable outcomes or just wants a checkbox. Vague answers like \"people will understand the new system\" need to be translated into observable behaviors during review. This directly feeds your KPI definitions, evaluation plan, and objective writing.",
    idNotesExtended:
      "**Measuring Training Impact — The Four Levels**\n\n" +
      "This question targets the two levels of evaluation that matter most to the business: whether people change their behavior on the job, and whether business results improve.\n\n" +
      "**Level 1 — Reaction:** Did learners like the training? Easy to measure but tells you almost nothing about whether the training worked.\n\n" +
      "**Level 2 — Learning:** Did learners acquire the knowledge or skill? Better than Level 1, but still measures what happens *in the classroom*, not on the job.\n\n" +
      "**Level 3 — Behavior:** Are learners doing things differently on the job? This is the first level that measures real impact.\n\n" +
      "**Level 4 — Results:** Did business metrics improve? This is what the sponsor cares about.\n\n" +
      "| Stakeholder Answer | Evaluation Level | What to Do |\n" +
      "|---|---|---|\n" +
      "| \"People will feel more confident\" | Reaction | Push for observable behaviors |\n" +
      "| \"They'll pass the certification exam\" | Learning | Ask what changes on the job after they pass |\n" +
      "| \"Reps use the pricing tool correctly on every quote\" | Behavior | Strong — this is measurable |\n" +
      "| \"Customer complaints drop 20% by Q4\" | Results | Excellent — clarify attribution |\n" +
      "| \"I don't know — I just need them trained\" | None | Work with the sponsor to define success *before* design begins |",
    stakeholderGuidance:
      "Think beyond \"people completed the training.\" What would you see people doing differently on the job? What business metric would improve?\n\n*Examples: \"Call resolution time drops from 12 minutes to 8 minutes,\" \"Zero compliance findings in the next audit,\" \"New hires are independently productive within 2 weeks instead of 6\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 105,
    appliesTo: [
      TrainingType.PERFORMANCE_PROBLEM,
      TrainingType.COMPLIANCE,
      TrainingType.ROLE_CHANGE,
    ],
  },
];
