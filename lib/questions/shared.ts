import { FieldType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

export const sharedQuestions: QuestionDefinition[] = [
  {
    id: "SHARED_01",
    section: "Project Context",
    questionText: "What is the name of this project or initiative?",
    idNotes:
      "Use this as the display name in the project list. If the stakeholder gives a vague name like \"training\" or \"new system,\" you'll want to refine this during review. This isn't a formal title — it's a working label.",
    stakeholderGuidance:
      "Give this project a short, descriptive name so everyone can reference it easily. It doesn't need to be the final course title.\n*Examples: \"2026 Salesforce Migration Training,\" \"Q3 Safety Policy Update,\" \"New Hire Onboarding Redesign\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 1,
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
      "This is the leader who initiated or approved this training request. They're typically the person accountable for the business outcome the training supports.\n*Examples: \"Maria Chen, VP of Operations,\" \"Tom Parker, Director of Compliance\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 2,
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
      "Select the role that best describes your relationship to this project. This helps us tailor follow-up questions and know who to contact for specific types of information.",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Executive Sponsor (I approved or initiated this request)",
      "Department Manager (I manage the team that needs training)",
      "Subject Matter Expert (I have deep knowledge of the content area)",
      "Project Manager (I'm coordinating the initiative this training supports)",
      "Other (please describe in the next field)",
    ],
    displayOrder: 3,
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
    displayOrder: 4,
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
      "Who needs this training? Describe the audience as specifically as you can.",
    idNotes:
      "You need enough detail to build a learner persona. Push for specifics during review if the answer is too vague (\"everyone\" or \"the team\"). Key things to extract: job titles, experience level, team size, geographic spread, and whether the audience is homogeneous or mixed. Multiple distinct audiences often signal the need for differentiated training paths — the same competency taught differently based on organizational level or experience.",
    stakeholderGuidance:
      "Tell us about the people who will take this training. Include details like job titles, departments, experience levels, and approximate number of learners. The more specific you are, the better we can design training that fits their actual work.\n*Example: \"45 field service technicians across 3 regions. Most have 2-5 years experience with our legacy system. About 10 are new hires with no prior exposure.\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 5,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_06",
    section: "Project Context",
    questionText:
      "What is the target date or deadline for this training to be available?",
    idNotes:
      "A hard deadline (compliance date, system go-live) vs. a soft goal (\"sometime in Q2\") tells you entirely different things about project constraints. Flag hard deadlines prominently in your review — they dictate scope, format decisions, and whether phased delivery makes sense. If the timeline is unrealistic for the scope, that's a critical review finding.",
    stakeholderGuidance:
      "If there's a specific date this training needs to be ready (like a system go-live or regulatory deadline), enter it here. If it's more of a general timeframe, describe that instead.\n*Examples: \"March 15, 2026 — system go-live,\" \"By end of Q2, flexible on exact date,\" \"ASAP — incidents are happening now\"*",
    fieldType: FieldType.SHORT_TEXT,
    required: true,
    displayOrder: 6,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_07",
    section: "Project Context",
    questionText:
      "How will you know this training was successful? What would be different afterward?",
    idNotes:
      "This is the single most important question on the form. The answer (or lack of one) tells you whether the stakeholder is thinking in terms of measurable outcomes or just wants a checkbox. Vague answers like \"people will understand the new system\" need to be translated into observable behaviors during review. This directly feeds your KPI definitions, evaluation plan, and objective writing.",
    idNotesExtended:
      "**Measuring Training Impact — The Four Levels**\n\n" +
      "This question targets the two levels of evaluation that matter most to the business: whether people change their behavior on the job, and whether business results improve.\n\n" +
      "**Level 1 — Reaction:** Did learners like the training? (Smile sheets, satisfaction surveys.) Easy to measure but tells you almost nothing about whether the training worked. If the stakeholder's success criteria is \"good feedback scores,\" that's a red flag — push deeper.\n\n" +
      "**Level 2 — Learning:** Did learners acquire the knowledge or skill? (Quiz scores, skill demonstrations during training.) Better than Level 1, but still measures what happens *in the classroom*, not on the job.\n\n" +
      "**Level 3 — Behavior:** Are learners doing things differently on the job? (Observation, manager reports, quality audits, call monitoring.) This is the first level that measures real impact. When the stakeholder says \"call resolution time drops\" or \"technicians follow the procedure correctly,\" they're describing Level 3.\n\n" +
      "**Level 4 — Results:** Did business metrics improve? (Revenue, safety incidents, customer satisfaction, compliance audit findings.) This is what the sponsor cares about. The connection between training and Level 4 results is often indirect — many factors contribute — but establishing the expected business metrics now creates the evaluation framework.\n\n" +
      "**How to use this during review:**\n\n" +
      "| Stakeholder Answer | Evaluation Level | What to Do |\n" +
      "|---|---|---|\n" +
      "| \"People will feel more confident\" | Reaction | Push for observable behaviors — confidence isn't measurable |\n" +
      "| \"They'll pass the certification exam\" | Learning | Good, but ask what changes on the job after they pass |\n" +
      "| \"Reps use the pricing tool correctly on every quote\" | Behavior | Strong — this is an observable behavior you can measure |\n" +
      "| \"Customer complaints drop 20% by Q4\" | Results | Excellent — but clarify how you'll attribute this to training vs. other factors |\n" +
      "| \"I don't know — I just need them trained\" | None | Critical finding. Work with the sponsor to define success *before* design begins. |",
    stakeholderGuidance:
      "Think beyond \"people completed the training.\" What would you see people doing differently on the job? What business metric would improve? Describe the change you'd observe if the training worked perfectly.\n*Examples: \"Call resolution time drops from 12 minutes to 8 minutes,\" \"Zero compliance findings in the next audit,\" \"New hires are independently productive within 2 weeks instead of 6\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 7,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_08",
    section: "Project Context",
    questionText:
      "Does any training, documentation, or reference material already exist for this topic?",
    idNotes:
      "This tells you whether you're building from scratch or redesigning. Existing materials are goldmines for content analysis — even bad ones tell you what's been tried. Ask for access to anything they mention during review. Also surfaces potential political issues: if someone else built the \"old\" training, tread carefully on criticism.",
    stakeholderGuidance:
      "List any existing training courses, job aids, procedure documents, SOPs, or reference materials related to this topic — even if they're outdated. This helps us build on what exists rather than starting from zero.\n*Examples: \"There's a 2023 onboarding deck in SharePoint,\" \"The vendor provides a user guide PDF,\" \"Nothing formal — just tribal knowledge\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 8,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_09",
    section: "Project Context",
    questionText:
      "Are there any constraints, limitations, or special considerations we should know about?",
    idNotes:
      "This is your catch-all for things that affect design decisions: budget limits, technology restrictions (no video, must work offline), union rules, language needs, accessibility requirements, political sensitivities, shift schedules that limit seat time, etc. Stakeholders often forget to mention constraints until they become blockers — this question surfaces them early.",
    stakeholderGuidance:
      "Tell us about anything that might affect how we design or deliver this training. Think about budget, technology, scheduling, language, accessibility, or organizational factors.\n*Examples: \"Learners only have 30-minute windows between shifts,\" \"Must be available in English and Spanish,\" \"No budget for video production,\" \"Some learners don't have company laptops\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 9,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_10",
    section: "Project Context",
    questionText:
      "Do you have a preference for how this training is delivered?",
    idNotes:
      "Stakeholder preferences aren't design decisions — you'll make the final recommendation based on audience, content type, and constraints. But knowing their expectations helps you manage the conversation. If they expect a 2-hour eLearning course and the analysis suggests a job aid + 15-minute micro-lesson, you'll need to navigate that gap during design review. Flag significant mismatches between preference and your analysis recommendation.",
    idNotesExtended:
      "**Delivery Format Selection Guide**\n\n" +
      "Use this reference when comparing the stakeholder's preference against what the analysis actually calls for. The right format depends on content type, audience constraints, and performance requirements — not stakeholder preference alone.\n\n" +
      "| Format | Best For | Watch Out For |\n" +
      "|---|---|---|\n" +
      "| **Self-paced eLearning** | Consistent procedural content, large/dispersed audiences, compliance training that needs completion tracking | Overused for content that needs discussion or practice with feedback. Not ideal for complex decision-making skills. |\n" +
      "| **Virtual instructor-led (VILT)** | Complex topics needing discussion, scenario practice with live feedback, small-to-medium groups, soft skills | Scheduling logistics with shift workers or global teams. Requires a skilled facilitator, not just a presenter. |\n" +
      "| **In-person classroom** | Hands-on skills, equipment operation, team-building, high-stakes simulations | Expensive at scale. Often requested out of habit when VILT would work equally well. |\n" +
      "| **Blended** | Most robust option for complex skills — combines knowledge transfer (async) with practice/application (live). | Requires more design effort and coordination. Stakeholders sometimes say \"blended\" when they mean \"do both just in case.\" |\n" +
      "| **Job aid / Quick reference** | Infrequent tasks, complex procedures with many steps, reference information | Not training — it's performance support. If the task is frequent and critical, people need to *learn* it, not look it up every time. |\n" +
      "| **Video / Recorded walkthrough** | Software demonstrations, process overviews, expert explanations | Expensive to update when content changes. Passive — no practice or assessment built in. |\n" +
      "| **On-the-job coaching / Mentoring** | Role transitions, leadership development, nuanced judgment skills | Depends entirely on coach quality. Needs structure or it becomes \"sit next to someone and hope you learn.\" |\n\n" +
      "**Common mismatches to flag during review:**\n\n" +
      "- Stakeholder wants a 2-hour eLearning → Analysis shows the content is 15 minutes of procedure + a job aid\n" +
      "- Stakeholder wants classroom → Audience is 500 people across 12 locations\n" +
      "- Stakeholder wants video → Content changes quarterly (maintenance burden)\n" +
      "- Stakeholder says \"no preference\" → Good — they're giving you design authority. Use it wisely.",
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
    displayOrder: 10,
    appliesTo: "ALL",
  },
  {
    id: "SHARED_11",
    section: "Project Context",
    questionText:
      "Who else should we involve in the analysis or design of this training? Please distinguish between people who have expertise to contribute and people who need approval authority.",
    idNotes:
      "This builds your stakeholder map. People named here become candidates for SME interviews, review cycles, and pilot testing. Pay attention to who they *don't* mention — sometimes the most important voice is the one the sponsor forgets about (e.g., the frontline supervisor, the IT admin who configures the system, the union rep).\n\nWatch for the \"too many approvers\" trap. When every stakeholder listed here expects sign-off authority, review cycles multiply and contradictory feedback creates gridlock. During your review, clarify roles explicitly: who *contributes input* vs. who *approves the final product.* If you see three or more names here, proactively set up a RACI agreement before the first review cycle.",
    idNotesExtended:
      "**RACI Framework for Training Projects**\n\n" +
      "RACI clarifies who does what so feedback cycles don't become a free-for-all. Each person on the project gets exactly one letter per decision or deliverable:\n\n" +
      "**R — Responsible:** Does the work. That's you — the instructional designer building the training.\n\n" +
      "**A — Accountable:** Makes the final decision and owns the outcome. Usually the executive sponsor. *There can only be one \"A\" per deliverable.* This is the rule that prevents gridlock.\n\n" +
      "**C — Consulted:** Provides expert input before decisions are made. SMEs, team leads, technical specialists. You actively seek their feedback, but they don't have veto power.\n\n" +
      "**I — Informed:** Gets updates but isn't part of the decision. Managers scheduling teams for training, IT prepping the LMS, communications teams planning rollout emails.\n\n" +
      "**Example: Storyboard Review Cycle**\n\n" +
      "| Person | RACI Role | What They Do |\n" +
      "|---|---|---|\n" +
      "| Maria Lopez, VP Operations | **A** — Accountable | Final sign-off. Reviews once, after you've incorporated all C feedback. |\n" +
      "| Jake Torres, Senior Analyst | **C** — Consulted | Reviews for technical accuracy. Flags errors in workflow descriptions. |\n" +
      "| Priya Shah, Team Lead | **C** — Consulted | Reviews for learner realism. \"That's not how we actually do it on the floor.\" |\n" +
      "| Legal Department | **C** — Consulted | Reviews only the compliance language sections, not the full storyboard. |\n" +
      "| Regional Managers (5) | **I** — Informed | Get a summary of the training plan and rollout timeline. No review cycle. |\n\n" +
      "**When to set up RACI:** If the stakeholder lists three or more names in this question, draft a simple RACI table during your review and share it at the kickoff meeting. It's much easier to establish roles upfront than to untangle conflicting feedback after the first review cycle.",
    stakeholderGuidance:
      "List anyone who has relevant expertise, will need to review or approve the training, or represents the learner perspective. Include their name, role, and the best way to contact them.\n\nA note on review efficiency: Training projects move fastest when there's a clear distinction between people who *provide input* and the one or two people who *make final decisions.* When too many people have approval authority, feedback often conflicts and timelines stall. As you list names below, consider noting whether each person should contribute expertise or hold approval authority — we'll use this to set up a smooth review process.\n\n*Examples: \"Jake Torres, Senior Analyst — power user, input/expertise,\" \"Maria Lopez, VP Operations — final approver,\" \"Priya Shah, Team Lead — learner perspective, input only,\" \"Legal department — review for regulatory accuracy, approval on compliance language only\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 11,
    appliesTo: "ALL",
  },
];
