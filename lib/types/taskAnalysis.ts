/**
 * Task Analysis Types
 * Used for breaking down complex tasks into hierarchical components
 */

export interface TaskStep {
  id: string;
  order: number;
  description: string;
  requiredKnowledge: string;
  requiredSkill: string;
}

export interface TaskItem {
  id: string;
  name: string;
  criticality: 'critical' | 'important' | 'nice-to-have';
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  steps: TaskStep[];
  prerequisites: string[];
  toolsRequired: string[];
  commonErrors: string[];
}

export interface TaskAnalysisFormData {
  jobTitle: string;
  roleDescription: string;
  tasks: TaskItem[];
}

export interface TaskAnalysisProps {
  courseId: string;
  pageId?: string;
  initialData?: Partial<TaskAnalysisFormData>;
  onSave?: (data: TaskAnalysisFormData) => Promise<void>;
}

export const defaultTaskAnalysisFormData: TaskAnalysisFormData = {
  jobTitle: '',
  roleDescription: '',
  tasks: [],
};

export const createEmptyTask = (): TaskItem => ({
  id: crypto.randomUUID(),
  name: '',
  criticality: 'important',
  frequency: 'weekly',
  steps: [],
  prerequisites: [],
  toolsRequired: [],
  commonErrors: [],
});

export const createEmptyStep = (order: number): TaskStep => ({
  id: crypto.randomUUID(),
  order,
  description: '',
  requiredKnowledge: '',
  requiredSkill: '',
});

// ─── LearningTask types (Prisma-backed, replaces JSON blob) ───

export type GapType = 'KNOWLEDGE' | 'SKILL' | 'MOTIVATION' | 'ENVIRONMENT' | 'MIXED';
export type InterventionType = 'TRAINING' | 'JOB_AID' | 'PRACTICE' | 'PROCESS_CHANGE' | 'TOOL_IMPROVEMENT' | 'COACHING' | 'NONE';
export type TaskFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'RARELY';
export type TaskCriticality = 'CRITICAL' | 'IMPORTANT' | 'SUPPORTIVE';
export type TaskComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX';
export type KnowledgeType = 'DECLARATIVE' | 'PROCEDURAL' | 'CONDITIONAL' | 'METACOGNITIVE';

export interface LearningTaskData {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  frequency: TaskFrequency;
  criticality: TaskCriticality;
  complexity: TaskComplexity;
  knowledgeType: KnowledgeType;
  isStandardized: boolean;
  variationNotes: string | null;
  isFeasibleToTrain: boolean;
  feasibilityNotes: string | null;
  gapType: GapType | null;
  intervention: InterventionType | null;
  interventionNotes: string | null;
  impactNote: string | null;
  parentTaskId: string | null;
  order: number;
  rationale: string | null;
  aiGenerated: boolean;
  taskAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { objectives: number };
}

// Display labels for enums
export const GAP_TYPE_LABELS: Record<GapType, string> = {
  KNOWLEDGE: 'Knowledge',
  SKILL: 'Skill',
  MOTIVATION: 'Motivation',
  ENVIRONMENT: 'Environment',
  MIXED: 'Mixed',
};

export const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  TRAINING: 'Training',
  JOB_AID: 'Job Aid',
  PRACTICE: 'Practice',
  PROCESS_CHANGE: 'Process Change',
  TOOL_IMPROVEMENT: 'Tool Improvement',
  COACHING: 'Coaching',
  NONE: 'None',
};

export const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  ANNUALLY: 'Annually',
  RARELY: 'Rarely',
};

export const CRITICALITY_LABELS: Record<TaskCriticality, string> = {
  CRITICAL: 'Critical',
  IMPORTANT: 'Important',
  SUPPORTIVE: 'Supportive',
};

export const COMPLEXITY_LABELS: Record<TaskComplexity, string> = {
  SIMPLE: 'Simple',
  MODERATE: 'Moderate',
  COMPLEX: 'Complex',
};

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeType, string> = {
  DECLARATIVE: 'Declarative',
  PROCEDURAL: 'Procedural',
  CONDITIONAL: 'Conditional',
  METACOGNITIVE: 'Metacognitive',
};

// Badge color classes
export const CRITICALITY_COLORS: Record<TaskCriticality, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  IMPORTANT: 'bg-yellow-100 text-yellow-700',
  SUPPORTIVE: 'bg-green-100 text-green-700',
};

export const INTERVENTION_COLORS: Record<InterventionType, string> = {
  TRAINING: 'bg-blue-100 text-blue-700',
  JOB_AID: 'bg-purple-100 text-purple-700',
  PRACTICE: 'bg-cyan-100 text-cyan-700',
  PROCESS_CHANGE: 'bg-orange-100 text-orange-700',
  TOOL_IMPROVEMENT: 'bg-amber-100 text-amber-700',
  COACHING: 'bg-teal-100 text-teal-700',
  NONE: 'bg-gray-100 text-gray-500',
};

export const GAP_TYPE_COLORS: Record<GapType, string> = {
  KNOWLEDGE: 'bg-blue-50 text-blue-600',
  SKILL: 'bg-indigo-50 text-indigo-600',
  MOTIVATION: 'bg-orange-50 text-orange-600',
  ENVIRONMENT: 'bg-red-50 text-red-600',
  MIXED: 'bg-gray-50 text-gray-600',
};

// Training vs non-training filters
export const TRAINING_INTERVENTIONS: InterventionType[] = ['TRAINING', 'PRACTICE'];
export const NON_TRAINING_INTERVENTIONS: InterventionType[] = ['PROCESS_CHANGE', 'TOOL_IMPROVEMENT', 'COACHING', 'NONE'];

export type TaskFilterType = 'all' | 'training' | 'job-aid' | 'non-training';
export type TaskSortField = 'criticality' | 'frequency' | 'complexity' | 'intervention';

// ─── Legacy JSON blob types (preserved for backward compatibility) ───

// Aggregate knowledge and skills from all tasks
export function aggregateKnowledgeAndSkills(tasks: TaskItem[]): {
  knowledge: string[];
  skills: string[];
} {
  const knowledgeSet = new Set<string>();
  const skillsSet = new Set<string>();

  for (const task of tasks) {
    for (const step of task.steps) {
      if (step.requiredKnowledge.trim()) {
        knowledgeSet.add(step.requiredKnowledge.trim());
      }
      if (step.requiredSkill.trim()) {
        skillsSet.add(step.requiredSkill.trim());
      }
    }
  }

  return {
    knowledge: Array.from(knowledgeSet).sort(),
    skills: Array.from(skillsSet).sort(),
  };
}
