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
  projectId: string;
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
