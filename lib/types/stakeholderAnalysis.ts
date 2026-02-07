/**
 * Types for Stakeholder Needs Analysis
 */

export enum TrainingType {
  PERFORMANCE_PROBLEM = "PERFORMANCE_PROBLEM",
  NEW_SYSTEM = "NEW_SYSTEM",
  COMPLIANCE = "COMPLIANCE",
  ROLE_CHANGE = "ROLE_CHANGE",
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  [TrainingType.PERFORMANCE_PROBLEM]: "Performance Problem",
  [TrainingType.NEW_SYSTEM]: "New System",
  [TrainingType.COMPLIANCE]: "Compliance",
  [TrainingType.ROLE_CHANGE]: "Role Change",
};

export enum SubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REVISION_REQUESTED = "REVISION_REQUESTED",
}

export enum FieldType {
  SHORT_TEXT = "SHORT_TEXT",
  LONG_TEXT = "LONG_TEXT",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  DATE = "DATE",
  NUMBER = "NUMBER",
  SCALE = "SCALE",
}
