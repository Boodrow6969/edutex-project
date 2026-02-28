// Learning Objectives Wizard — TypeScript interfaces

export type BloomLevelString = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
export type BloomKnowledgeString = 'Factual' | 'Conceptual' | 'Procedural' | 'Metacognitive';
export type ObjectivePriorityString = 'Must Have' | 'Should Have' | 'Nice to Have';
export type TriageColumn = 'must' | 'should' | 'nice';
export type TriageSource = 'NA' | 'TaskAnalysis' | 'Custom';
export type SubTaskStatus = 'New' | 'Already can do' | 'Uncertain';
export type StepKey = 'context' | 'priority' | 'tasks' | 'builder' | 'validation' | 'export';
export type StepStatus = 'none' | 'progress' | 'done' | 'skip';
export type ViewMode = 'guided' | 'freeform';
export type TheoryMode = 'bloom' | 'anderson';
export type AudienceMode = 'picklist' | 'custom';

export interface WizardObjective {
  id: string;
  audience: string;
  behavior: string; // maps to Objective.title
  verb: string;
  bloomLevel: BloomLevelString | '';
  bloomKnowledge: BloomKnowledgeString | '';
  condition: string;
  criteria: string;
  freeformText: string;
  priority: ObjectivePriorityString;
  requiresAssessment: boolean;
  rationale: string;
  wiifm: string;
  linkedTaskId: string | null; // TriageItem ID
  sortOrder: number;
}

export interface TriageItemData {
  id: string;
  courseId: string;
  text: string;
  column: TriageColumn;
  source: TriageSource;
  sortOrder: number;
}

export interface SubTaskData {
  id: string;
  parentItemId: string;
  text: string;
  isNew: SubTaskStatus;
  sortOrder: number;
}

export interface NASummary {
  trainingType: string;
  businessGoal: string;
  audience: string;
  currentState: string;
  desiredState: string;
  painPoints: string[];
  labels: {
    businessGoal: string;
    currentState: string;
    desiredState: string;
  };
}

export interface NASection {
  key: string;
  title: string;
  color: string;
  items: { q: string; a: string }[];
}

export interface StepDef {
  key: StepKey;
  num: string;
  label: string;
}

export interface BloomDef {
  level: BloomLevelString;
  color: string;
  bg: string;
  border: string;
  fill: string;
  verbs: string[];
}

export interface PriorityDef {
  label: ObjectivePriorityString;
  color: string;
  bg: string;
  dot: string;
}

// API response types
export interface WizardDataResponse {
  objectives: WizardObjective[];
  triageItems: TriageItemData[];
  subTasks: SubTaskData[];
  gapKnowledge: boolean;
  gapSkill: boolean;
  naSummary: NASummary | null;
  naSections: NASection[];
  audiences: string[];
  courseName: string;
}
