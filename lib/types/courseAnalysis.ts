/**
 * Types for Course Analysis v2
 * Adds AudienceProfile and AnalysisTask multi-entry types
 */

export interface AudienceProfileData {
  id?: string;         // Undefined for new entries
  role: string;
  headcount: string;
  frequency: string;
  techComfort: string;
  trainingFormat: string;
  notes: string;
  order: number;
}

export interface AnalysisTaskData {
  id?: string;
  task: string;
  audience: string;
  source: string;
  complexity: string;
  intervention: string;  // "training" | "job-aid" | "awareness" | "not-training" | "existing"
  priority: string;      // "Critical" | "High" | "Medium" | "Low"
  notes: string;
  order: number;
}

export interface CourseAnalysisFormData {
  // Legacy fields (kept for backward compat, drop deferred)
  problemSummary: string;
  currentStateSummary: string;
  desiredStateSummary: string;

  // Course-specific stakeholders (legacy — learnerPersonas/stakeholders replaced by AudienceProfile)
  learnerPersonas: string[];
  stakeholders: string[];
  smes: string[];

  // Training decision
  isTrainingSolution: boolean | null;
  nonTrainingFactors: string;
  solutionRationale: string;

  // Delivery & materials (v2)
  deliveryNotes: string;
  existingMaterials: string;

  // Constraints & assumptions
  constraints: string[];
  assumptions: string[];

  // Success Metrics (Kirkpatrick)
  level1Reaction: string;
  level2Learning: string;
  level3Behavior: string;
  level4Results: string;

  // Related data (v2)
  audiences: AudienceProfileData[];
  tasks: AnalysisTaskData[];
}

export const defaultCourseAnalysisFormData: CourseAnalysisFormData = {
  problemSummary: '',
  currentStateSummary: '',
  desiredStateSummary: '',
  constraints: [],
  assumptions: [],
  learnerPersonas: [],
  stakeholders: [],
  smes: [],
  isTrainingSolution: null,
  nonTrainingFactors: '',
  solutionRationale: '',
  deliveryNotes: '',
  existingMaterials: '',
  level1Reaction: '',
  level2Learning: '',
  level3Behavior: '',
  level4Results: '',
  audiences: [],
  tasks: [],
};

/**
 * Stakeholder submission response for display in the Analysis tab
 */
export interface StakeholderResponseDisplay {
  question: string;
  value: string;
  questionId: string;
}

export interface StakeholderSectionDisplay {
  title: string;
  responses: StakeholderResponseDisplay[];
}

export interface StakeholderSubmissionDisplay {
  id: string;
  stakeholderName: string;
  trainingType: string;
  submittedAt: string;
  status: string;
  sections: StakeholderSectionDisplay[];
}

/**
 * Workspace contact for read-only display
 */
export interface WorkspaceContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

/**
 * Combined data returned by the analysis-context API
 */
export interface AnalysisContext {
  courseAnalysis: CourseAnalysisFormData;
  submissions: StakeholderSubmissionDisplay[];
  workspaceContacts: WorkspaceContact[];
}
