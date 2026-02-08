/**
 * Types for Needs Analysis AI results and form data
 */

/**
 * A recommended task extracted from needs analysis
 */
export interface RecommendedTask {
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description?: string;
}

/**
 * The structured result from analyzing needs analysis content
 */
export interface NeedsAnalysisResult {
  /** Brief summary of the needs analysis (2-3 sentences) */
  summary: string;

  /** Key insights about performance gaps and training needs */
  keyInsights: string[];

  /** Notes about the target audience characteristics */
  audienceNotes: string;

  /** Constraints and limitations identified (time, budget, tech, etc.) */
  constraints: string[];

  /** Recommended tasks for the instructional design project */
  recommendedTasks: RecommendedTask[];
}

/**
 * Form data structure for the Needs Analysis form
 */
export interface NeedsAnalysisFormData {
  // Problem tab
  problemStatement: string;
  businessNeed: string;
  department: string;
  constraints: string[];
  assumptions: string[];

  // Stakeholders tab
  learnerPersonas: string[];
  stakeholders: string[];
  smes: string[];

  // Performance tab
  currentState: string;
  desiredState: string;

  // Success Metrics tab (Kirkpatrick)
  level1Reaction: string;
  level2Learning: string;
  level3Behavior: string;
  level4Results: string;
}

/**
 * Props for the NeedsAnalysisView component
 */
export interface NeedsAnalysisProps {
  courseId: string;
  pageId?: string;
  initialData?: Partial<NeedsAnalysisFormData>;
  onSave?: (data: NeedsAnalysisFormData) => Promise<void>;
}

/**
 * Default empty form data
 */
export const defaultNeedsAnalysisFormData: NeedsAnalysisFormData = {
  problemStatement: '',
  businessNeed: '',
  department: '',
  constraints: [],
  assumptions: [],
  learnerPersonas: [],
  stakeholders: [],
  smes: [],
  currentState: '',
  desiredState: '',
  level1Reaction: '',
  level2Learning: '',
  level3Behavior: '',
  level4Results: '',
};
