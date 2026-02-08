/**
 * Types for Learning Objectives AI generation and management
 */

/**
 * Valid Bloom's Taxonomy levels as string literals
 * Matches the BloomLevel enum in the Prisma schema
 */
export type BloomLevelString = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';

/**
 * Valid Bloom levels array for validation
 */
const VALID_BLOOM_LEVELS: BloomLevelString[] = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];

/**
 * A generated objective from AI (not yet saved)
 */
export interface GeneratedObjective {
  /** The objective statement (maps to Objective.title) */
  title: string;

  /** Extended description or context (maps to Objective.description) */
  description: string;

  /** Bloom's Taxonomy level */
  bloomLevel: BloomLevelString;

  /** AI's rationale for choosing this level */
  rationale?: string;

  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Input for generating objectives via AI
 */
export interface GenerateObjectivesInput {
  /** The course to generate objectives for */
  courseId: string;

  /** Optional additional context from the user */
  context?: string;

  /** Optional needs analysis summary to incorporate */
  needsSummary?: string;
}

/**
 * Input for creating objectives in the database
 */
export interface CreateObjectiveInput {
  /** The objective statement */
  title: string;

  /** Extended description */
  description: string;

  /** Bloom's Taxonomy level */
  bloomLevel: BloomLevelString;

  /** Optional tags */
  tags?: string[];
}

/**
 * Map string bloom level to valid BloomLevelString
 * Returns a string that matches the Prisma BloomLevel enum
 */
export function toBloomLevel(level: string): BloomLevelString {
  const normalized = level.toUpperCase() as BloomLevelString;

  if (VALID_BLOOM_LEVELS.includes(normalized)) {
    return normalized;
  }

  // Default to APPLY if invalid
  return 'APPLY';
}

/**
 * Validate that a string is a valid Bloom level
 */
export function isValidBloomLevel(level: string): level is BloomLevelString {
  return VALID_BLOOM_LEVELS.includes(level.toUpperCase() as BloomLevelString);
}
