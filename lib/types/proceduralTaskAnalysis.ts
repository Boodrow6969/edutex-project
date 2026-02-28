/**
 * Types for the procedural Task Analysis module (Prisma-backed TaskAnalysis + ProceduralStep).
 */

export type TaskAnalysisType = 'PROCEDURAL' | 'HIERARCHICAL' | 'COGNITIVE';

export type InstructionalEvent =
  | 'DEMONSTRATION'
  | 'PRACTICE'
  | 'DECISION_BRANCH'
  | 'INFORMATION'
  | 'EXAMPLE'
  | 'CAUTION';

export const INSTRUCTIONAL_EVENT_LABELS: Record<InstructionalEvent, string> = {
  DEMONSTRATION: 'Demonstration',
  PRACTICE: 'Practice',
  DECISION_BRANCH: 'Decision Branch',
  INFORMATION: 'Information',
  EXAMPLE: 'Example',
  CAUTION: 'Caution',
};

export const INSTRUCTIONAL_EVENT_COLORS: Record<InstructionalEvent, string> = {
  DEMONSTRATION: 'bg-blue-100 text-blue-700',
  PRACTICE: 'bg-green-100 text-green-700',
  DECISION_BRANCH: 'bg-yellow-100 text-yellow-700',
  INFORMATION: 'bg-gray-100 text-gray-600',
  EXAMPLE: 'bg-purple-100 text-purple-700',
  CAUTION: 'bg-red-100 text-red-700',
};

export interface ProceduralStepData {
  id?: string;
  stepNumber: number;
  description: string;
  isDecisionPoint: boolean;
  branchCondition: string | null;
  commonErrors: string | null;
  cues: string | null;
  toolsRequired: string | null;
  instructionalEvent: InstructionalEvent | null;
  notes: string | null;
}

export interface DataSourceEntry {
  source: 'needs_analysis' | 'objectives' | 'custom';
  fieldPath?: string;
}

export interface TaskAnalysisData {
  id: string;
  pageId: string;
  objectiveId: string | null;
  sourceTaskId: string | null;
  analysisType: TaskAnalysisType;
  taskName: string;
  taskGoal: string;
  audienceRole: string;
  audiencePriorKnowledge: string;
  audienceTechComfort: string;
  constraints: string;
  contextNotes: string;
  dataSource: Record<string, DataSourceEntry>;
  criticalityScore: number | null;
  frequencyScore: number | null;
  difficultyScore: number | null;
  universalityScore: number | null;
  feasibilityScore: number | null;
  steps: ProceduralStepData[];
  objective: { id: string; title: string; bloomLevel: string } | null;
  aiDrafted: boolean;
  createdAt: string;
  updatedAt: string;
}
