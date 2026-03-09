/**
 * Types for Stakeholder Needs Analysis
 */

export enum TrainingType {
  PERFORMANCE_PROBLEM = "PERFORMANCE_PROBLEM",
  TOOL_AND_PROCESS = "TOOL_AND_PROCESS",
  COMPLIANCE = "COMPLIANCE",
  ROLE_CHANGE = "ROLE_CHANGE",
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  [TrainingType.PERFORMANCE_PROBLEM]: "Performance Problem",
  [TrainingType.TOOL_AND_PROCESS]: "Tool & Process Training",
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
  DATE_WITH_TEXT = "DATE_WITH_TEXT",
  NUMBER = "NUMBER",
  SCALE = "SCALE",
  REPEATING_TABLE = "REPEATING_TABLE",
}
