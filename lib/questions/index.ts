import { TrainingType } from "../types/stakeholderAnalysis";
import { QuestionDefinition } from "../types/questionDefinition";
import { sharedQuestions } from "./shared";
import { performanceProblemQuestions } from "./performanceProblem";
import { newSystemQuestions } from "./newSystem";
import { complianceQuestions } from "./compliance";
import { roleChangeQuestions } from "./roleChange";
import { learnerProfileQuestions } from "./learnerProfiles";

const TYPE_QUESTIONS: Record<TrainingType, QuestionDefinition[]> = {
  [TrainingType.PERFORMANCE_PROBLEM]: performanceProblemQuestions,
  [TrainingType.NEW_SYSTEM]: newSystemQuestions,
  [TrainingType.COMPLIANCE]: complianceQuestions,
  [TrainingType.ROLE_CHANGE]: roleChangeQuestions,
};

export const ALL_QUESTIONS: QuestionDefinition[] = [
  ...sharedQuestions,
  ...performanceProblemQuestions,
  ...newSystemQuestions,
  ...complianceQuestions,
  ...roleChangeQuestions,
  ...learnerProfileQuestions,
];

export const QUESTION_MAP: Record<string, QuestionDefinition> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

export function getQuestionsForType(trainingType: TrainingType): QuestionDefinition[] {
  const shared = sharedQuestions.filter(
    (q) => q.appliesTo === "ALL" || q.appliesTo.includes(trainingType)
  );
  const learnerProfile = learnerProfileQuestions.filter(
    (q) => q.appliesTo === "ALL" || q.appliesTo.includes(trainingType)
  );
  const typeSpecific = TYPE_QUESTIONS[trainingType] ?? [];

  return [...shared, ...learnerProfile, ...typeSpecific].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}
