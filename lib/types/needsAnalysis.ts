/**
 * Types for Needs Analysis AI results
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
