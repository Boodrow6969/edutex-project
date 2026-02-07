import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

export const roleChangeQuestions: QuestionDefinition[] = [
  {
    id: "ROLE_01",
    section: "Role Change / Expansion",
    questionText:
      "Describe the role change. Is this a promotion, lateral move, new responsibilities being added, or a restructuring?",
    idNotes:
      "The type of change determines the instructional approach. Promotions typically need leadership/soft skill development. Lateral moves need technical reskilling. Added responsibilities need targeted upskilling. Restructuring may need a blend plus change management. This also helps you understand the emotional context — people approach a welcome promotion differently than a forced restructure.",
    stakeholderGuidance:
      "Tell us what's changing about the role and why.\n*Examples: \"Individual contributors are being promoted to team lead positions,\" \"Marketing coordinators are absorbing social media management duties from a disbanded team,\" \"Customer service reps are being cross-trained to handle technical support calls,\" \"Department merger — two teams with different processes need to align on one approach\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 50,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
  {
    id: "ROLE_02",
    section: "Role Change / Expansion",
    questionText:
      "What specific new tasks, responsibilities, or decisions will these employees need to handle?",
    idNotes:
      "This is your task analysis seed, similar to SYS_03 but focused on role competencies rather than system features. Push for concrete tasks during review — \"they'll need to manage people\" is too vague. What does \"manage people\" mean in this organization? Conducting 1:1s? Writing performance reviews? Approving time off? Handling complaints? Each specific task becomes a training objective candidate.",
    stakeholderGuidance:
      "List the new or expanded responsibilities as specifically as possible. Think about a typical week in the new role — what tasks would be new or different?\n*Examples: \"Conduct weekly 1:1 meetings, write quarterly performance reviews, approve PTO requests, handle first-level employee complaints\" / \"Create and manage social media content calendars, respond to customer inquiries on social channels, generate monthly engagement reports\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 51,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
  {
    id: "ROLE_03",
    section: "Role Change / Expansion",
    questionText:
      "What relevant skills, knowledge, or experience do these employees already have?",
    idNotes:
      "This defines the starting point so you can design for the actual gap rather than starting from zero. Experienced professionals being promoted already have organizational knowledge and technical skills — they don't need to relearn the business. They need the *new* skills their new role demands. This also helps you identify which new skills have adjacent existing skills (e.g., someone who's been an informal mentor may have a head start on coaching skills).",
    stakeholderGuidance:
      "Describe what these employees already know or can do that's relevant to their new role. This helps us build on existing strengths rather than repeating what they already know.\n*Examples: \"They're technically strong — all have 3+ years as individual contributors. They know our products and processes inside-out. What they lack is formal people management skills.\" / \"They understand basic social media as personal users, but have no experience with brand voice, scheduling tools, or analytics.\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 52,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
  {
    id: "ROLE_04",
    section: "Role Change / Expansion",
    questionText:
      "How will you evaluate whether someone is ready to perform in the expanded role?",
    idNotes:
      "This shapes your assessment strategy and defines what \"done\" looks like for training. If they say \"there's no formal evaluation,\" that's a recommendation opportunity. The key question is whether the evaluation measures what people actually *do on the job* after training, not just what they learned in the classroom. If certification or formal assessment exists, build the training backward from those requirements.",
    idNotesExtended:
      "**Readiness Evaluation Methods**\n\n" +
      "Role transitions are harder to assess than procedural skills because the competencies are often complex and context-dependent. Here are proven methods, ranked from lightest to most rigorous:\n\n" +
      "| Method | Effort | Validity | Best For |\n" +
      "|---|---|---|---|\n" +
      "| **Self-assessment checklist** | Low | Low (people overestimate readiness) | Low-stakes role additions, initial baseline only |\n" +
      "| **Manager observation checklist** | Medium | Medium-High | Behavioral skills like coaching, customer interaction, decision-making |\n" +
      "| **Structured shadow period** | Medium | Medium | New managers, complex roles where judgment matters |\n" +
      "| **Scenario-based simulation** | High | High | High-stakes roles, leadership, safety-critical positions |\n" +
      "| **30/60/90 day milestone framework** | Medium | High (measured over time) | Any role transition — builds in progressive expectations |\n" +
      "| **Certification exam** | High | High (for knowledge) | Technical roles, regulated positions |\n\n" +
      "**The 30/60/90 Day Framework (recommended default):**\n\n" +
      "If the stakeholder says \"no formal evaluation,\" recommend this structure. It provides built-in checkpoints without requiring heavy assessment infrastructure:\n\n" +
      "| Checkpoint | Focus | Example Criteria |\n" +
      "|---|---|---|\n" +
      "| **30 days** | Can perform core tasks with support | \"Conducts 1:1 meetings using the provided template. Asks for help when escalation is needed.\" |\n" +
      "| **60 days** | Can perform core tasks independently | \"Independently handles routine team issues. Identifies situations that need escalation before they become problems.\" |\n" +
      "| **90 days** | Performs at full capacity, handles edge cases | \"Manages a team conflict without manager intervention. Delivers first quarterly performance review with feedback from HR rating it 'meets expectations.'\" |\n\n" +
      "This framework also creates natural touchpoints for reinforcement training — if someone is struggling at the 30-day checkpoint, you can intervene with targeted support rather than waiting for a formal failure.\n\n" +
      "**Building training backward from assessment:** If a formal assessment exists (certification, skills test, panel review), get the criteria *first.* Design the training so that every practice activity directly prepares the learner for what they'll be evaluated on. Objectives, activities, and assessments should all point at the same target — when they're aligned, nothing in the training is wasted and nothing on the assessment is a surprise.",
    stakeholderGuidance:
      "How will managers know that someone is ready to take on the new responsibilities? Is there a formal evaluation, or will it be more informal?\n*Examples: \"Manager observation during a 2-week shadow period,\" \"Must pass the team lead assessment with 80% or higher,\" \"No formal evaluation — they'll just start doing the work and we'll course-correct,\" \"90-day probationary period with weekly check-ins and a formal review at the end\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 53,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
  {
    id: "ROLE_05",
    section: "Role Change / Expansion",
    questionText:
      "When does this role change take effect, and what does the transition period look like?",
    idNotes:
      "Is there a gradual handoff or an abrupt switch? A 3-month transition gives you time for blended learning with on-the-job practice. A \"they start Monday\" situation requires survival-level training now with a longer development program to follow. Also ask during review: will they be doing *both* the old and new roles during transition, or fully released from old duties?",
    stakeholderGuidance:
      "Describe the timeline for the transition. Will people move into the new role all at once, or gradually take on new responsibilities?\n*Examples: \"Effective immediately — they were promoted last week,\" \"Gradual transition over 3 months starting in April,\" \"New responsibilities added quarterly as each phase rolls out,\" \"They'll shadow the current person for 2 weeks, then take over fully\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 54,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
  {
    id: "ROLE_06",
    section: "Role Change / Expansion",
    questionText:
      "What support will be available to help people succeed in the new role beyond training?",
    idNotes:
      "Training is one intervention — mentoring, coaching, communities of practice, manager support, and clear documentation are equally important for role transitions. This question surfaces what already exists and identifies gaps in the support ecosystem. If nothing exists, that's a finding for your recommendations. Connect to the \"training as % of solution\" framework: what percentage of the transition success depends on training vs. these other support structures?",
    stakeholderGuidance:
      "Beyond training, what will help these employees succeed? Think about mentoring, coaching, peer groups, manager check-ins, tools, or other resources.\n*Examples: \"Each new team lead will be paired with an experienced manager as a mentor,\" \"We have a monthly new-manager cohort where they discuss challenges,\" \"Nothing structured — they'll need to figure it out,\" \"Their previous manager will be available for questions during the transition period\"*",
    fieldType: FieldType.LONG_TEXT,
    required: false,
    displayOrder: 55,
    appliesTo: [TrainingType.ROLE_CHANGE],
  },
];
