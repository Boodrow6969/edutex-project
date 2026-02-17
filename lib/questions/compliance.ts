import { FieldType, TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";

/**
 * Dynamic questions for COMPLIANCE training type only.
 *
 * Section: "Regulation or Policy" (displayOrder 200–206)
 *
 * 7 questions total.
 */

export const complianceQuestions: QuestionDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Regulation or Policy
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "COMP_01",
    section: "Regulation or Policy",
    questionText:
      "What regulation, law, or policy is driving this training requirement?",
    idNotes:
      "Get the specific citation, not just a general description. \"OSHA requirements\" is too vague — \"OSHA 29 CFR 1910.147 (Lockout/Tagout)\" lets you verify the actual requirements. For internal policies, get the document name, version, and effective date. This determines whether you can find the regulatory language to validate what actually needs to be trained vs. what the stakeholder *thinks* needs to be trained. Sometimes stakeholders over-scope compliance training out of anxiety.",
    stakeholderGuidance:
      "Provide the specific regulation, law, standard, or internal policy that requires this training. Include reference numbers or document names if available.\n\n*Examples: \"OSHA 29 CFR 1910.147 — Control of Hazardous Energy (Lockout/Tagout),\" \"HIPAA Privacy Rule — annual refresher,\" \"Company Policy HR-2025-003: Updated Harassment Prevention,\" \"SOX Section 404 — Internal Controls compliance for finance team\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 200,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_02",
    section: "Regulation or Policy",
    questionText:
      "What specifically changed, and why does it require training?",
    idNotes:
      "For regulatory updates, the change might be narrow (one clause updated) or broad (entirely new regulation). For internal policy changes, understand whether this is a refinement of existing practice or a fundamentally new requirement. The scope of change directly determines training scope. If \"nothing changed, this is annual refresher,\" that shifts the design toward reinforcement and assessment rather than new learning — a very different instructional approach.",
    stakeholderGuidance:
      "Describe what's new or different. If this is an annual refresher with no changes, say so — that helps us design differently than we would for a major policy update.\n\n*Examples: \"New CCPA amendment adds data deletion request handling requirements,\" \"No change — this is our annual refresher on the existing code of conduct,\" \"The harassment prevention policy now includes remote/hybrid workplace scenarios,\" \"Entirely new regulation effective July 1 — nothing like this existed before\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 201,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_03",
    section: "Regulation or Policy",
    questionText:
      "By what date must all affected employees complete this training?",
    idNotes:
      "Compliance deadlines are hard stops — they don't flex. This date drives everything: format selection, rollout strategy, and what can realistically be built in time. If the deadline is impossibly tight, you may need to recommend a phased approach (e.g., quick awareness session now + full training later) rather than one comprehensive course. Always confirm whether this date is a regulatory deadline, an internal target, or an audit date.",
    stakeholderGuidance:
      "Provide the hard deadline for training completion. Is this date set by the regulation itself, by an upcoming audit, or by internal policy?\n\n*Examples: \"Regulatory deadline: December 31, 2026,\" \"Internal target: All employees by Q3 to be audit-ready by Q4,\" \"Audit is March 15 — everyone must be complete by March 1\"*",
    fieldType: FieldType.DATE_WITH_TEXT,
    required: true,
    displayOrder: 202,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_04",
    section: "Regulation or Policy",
    questionText:
      "What happens if employees don't complete this training or don't comply with the policy?",
    idNotes:
      "This is your motivation lever and your urgency calibration. Consequences range from \"a reminder email from HR\" to \"the company gets fined $10M\" to \"someone could die.\" The severity determines how much rigor the training needs: casual awareness vs. assessed certification with documented proof of competency. It also tells you how seriously the organization takes this — if there are no consequences, completion rates will be low regardless of how good the training is.",
    stakeholderGuidance:
      "Describe what's at stake — for the individual, the team, and the organization. Think about regulatory fines, legal liability, audit findings, safety risks, or disciplinary actions.\n\n*Examples: \"Individual: Written warning, then termination. Organization: Up to $50K per violation from the regulator.\" / \"Audit finding that triggers mandatory corrective action plan\" / \"Safety risk: failure to follow this procedure could result in serious injury\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 203,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_05",
    section: "Regulation or Policy",
    questionText:
      "Is there a formal attestation, certification, or assessment requirement?",
    idNotes:
      "This determines whether you need a graded assessment vs. just a completion stamp. Some regulations require scored tests with minimum passing thresholds, signed attestation forms, or manager sign-offs. This directly shapes your assessment design. Clarify during review: is the attestation a regulatory requirement or organizational policy?",
    idNotesExtended:
      "**Assessment Types for Compliance Training**\n\n" +
      "The attestation requirement determines your assessment design strategy. Different requirements call for fundamentally different approaches:\n\n" +
      "| Requirement | Assessment Approach | Design Implications |\n" +
      "|---|---|---|\n" +
      "| **Completion tracking only** | No formal assessment needed. Consider adding knowledge checks for learning value, but they don't gate completion. | Lightest design. Focus on engagement and scenario-based awareness rather than testing. |\n" +
      "| **Signed attestation** | Learner signs a statement confirming they read/understood the policy. No scored test. | Include the attestation language in the training. Make sure the content clearly covers every clause the learner is attesting to. LMS needs e-signature or checkbox functionality. |\n" +
      "| **Scored assessment (pass/fail)** | Formal test with minimum passing score (typically 80%). Failed attempts require remediation and retake. | Design questions that test *application*, not recall. Scenario-based items are more defensible in audits than trivia questions. Build a question pool larger than the test to prevent answer sharing. |\n" +
      "| **Scored assessment + attestation** | Both a passing score AND a signed acknowledgment. Most rigorous. | Combine the above. The assessment proves comprehension; the attestation proves the learner takes personal responsibility. |\n" +
      "| **Manager sign-off / observation** | Manager confirms the employee demonstrated the behavior on the job. | Training must include practice activities that mirror the on-the-job behaviors. Provide managers with an observation checklist. |\n\n" +
      "**Passing score guidance:** If the regulation doesn't specify a score, the organization sets one. 80% is the most common default. For high-consequence topics (safety, patient care), consider 100% with unlimited retakes.\n\n" +
      "**Audit defensibility:** Auditors want to see that the assessment actually tests what the regulation requires — not just that people clicked through slides. Map every assessment item back to a specific regulatory requirement.",
    stakeholderGuidance:
      "Does the regulation or policy require proof that employees understood the content — like a test, a signed acknowledgment, or a certification?",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "Yes — scored assessment with minimum passing score",
      "Yes — signed attestation / acknowledgment form",
      "Yes — both assessment and attestation",
      "No — completion tracking is sufficient",
      "Unsure — I need to verify the requirement",
    ],
    displayOrder: 204,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_06",
    section: "Regulation or Policy",
    questionText:
      "What specific behaviors or actions does this policy require of employees?",
    idNotes:
      "Move beyond \"understand the policy\" — what do people need to *do* differently? This is where compliance training crosses from information dump to actual performance support. These behaviors become your learning objectives and drive activity design. If the stakeholder can only describe knowledge (\"they need to know about X\") and not behaviors (\"they need to do Y when Z happens\"), that's a signal to push for scenario-based design.",
    idNotesExtended:
      "**Scenario-Based Compliance Design**\n\n" +
      "Most compliance training fails because it teaches *information about* the policy instead of *decisions under* the policy. The fix is straightforward: identify the decisions people make on the job where the policy is relevant, then build practice around those decision points.\n\n" +
      "**The shift from information to decisions:**\n\n" +
      "| Information-Based (Weak) | Decision-Based (Strong) |\n" +
      "|---|---|\n" +
      "| \"HIPAA protects patient health information\" | \"A colleague asks you to look up a patient's records for a friend. What do you do?\" |\n" +
      "| \"Report suspicious transactions within 24 hours\" | \"A customer deposits $9,500 in cash. They mention they'll deposit the rest tomorrow. Is this reportable?\" |\n" +
      "| \"PPE is required in Zone 3\" | \"You need to grab a tool from Zone 3 for a 30-second task. Your safety goggles are in your locker two floors up. What do you do?\" |\n\n" +
      "**How to extract decisions from the stakeholder's behavioral requirements:**\n\n" +
      "For each behavior they list, ask: *\"When would someone face a choice about whether to follow this requirement?\"* The answer gives you your scenario setup. The common mistakes give you your wrong-answer options. The consequences give you your feedback.",
    stakeholderGuidance:
      "List the specific actions employees must take (or stop doing) to comply with this policy. Focus on what they need to *do* on the job, not just what they need to *know.*\n\n*Examples: \"Report suspicious transactions within 24 hours using the SAR form,\" \"Verify patient identity using two identifiers before releasing information,\" \"Dispose of hazardous materials only in designated containers — never in regular trash,\" \"Obtain written consent before sharing customer data with third parties\"*",
    fieldType: FieldType.LONG_TEXT,
    required: true,
    displayOrder: 205,
    appliesTo: [TrainingType.COMPLIANCE],
  },
  {
    id: "COMP_07",
    section: "Regulation or Policy",
    questionText:
      "Is this training a one-time requirement, or does it need to be repeated on a schedule?",
    idNotes:
      "Recurring training needs a different design strategy than one-time. Year-over-year refreshers should be lighter, scenario-based, and focused on assessment rather than re-teaching. Consider a modular approach where the core content persists but a \"what's new\" module gets swapped each cycle. Flag this for your content maintenance plan and LMS configuration.",
    stakeholderGuidance:
      "Will this training need to be taken again periodically?",
    fieldType: FieldType.SINGLE_SELECT,
    required: true,
    options: [
      "One-time only",
      "Annual refresher",
      "Every 2-3 years",
      "Triggered by policy updates (as-needed)",
      "Unsure — I need to check the regulation",
    ],
    displayOrder: 206,
    appliesTo: [TrainingType.COMPLIANCE],
  },
];
