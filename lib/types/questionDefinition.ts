/**
 * Types for Stakeholder Question Definitions
 */

import { FieldType, TrainingType } from "./stakeholderAnalysis";

export interface ConditionalRule {
  questionId: string;
  operator: "equals" | "not_equals" | "includes";
  value: string;
}

export interface QuestionDefinition {
  id: string;
  section: string;
  questionText: string;
  idNotes: string;
  idNotesExtended?: string;
  stakeholderGuidance: string;
  fieldType: FieldType;
  required: boolean;
  options?: string[];
  tableColumns?: { key: string; label: string }[];
  displayOrder: number;
  appliesTo: TrainingType[] | "ALL";
  conditional?: ConditionalRule;
}
