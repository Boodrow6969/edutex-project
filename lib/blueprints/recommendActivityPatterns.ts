import prisma from '@/lib/prisma';

/**
 * Constraint object structure
 */
export interface ConstraintInput {
  type: string;
  description: string;
  value?: string | null;
}

/**
 * ActivityPattern recommendation result
 */
export interface RecommendedPattern {
  id: string;
  name: string;
  description: string;
  bestForBloomLevels: string;
  references: string | null;
  typicalDurationMinutes: number | null;
}

/**
 * Recommends ActivityPatterns based on bloom level and constraints.
 *
 * @param bloomLevel - The Bloom's taxonomy level (e.g., "REMEMBER", "UNDERSTAND", "APPLY")
 * @param constraints - Array of constraints that may affect pattern selection
 * @returns Array of recommended ActivityPattern objects
 */
export async function recommendActivityPatterns(
  bloomLevel: string,
  constraints: ConstraintInput[] = []
): Promise<RecommendedPattern[]> {
  // Fetch all activity patterns
  const allPatterns = await prisma.activityPattern.findMany({
    orderBy: { name: 'asc' },
  });

  // Filter patterns based on bloom level
  const bloomMatchedPatterns = allPatterns.filter((pattern) => {
    // bestForBloomLevels is stored as comma-separated string like "REMEMBER,UNDERSTAND,APPLY"
    const supportedLevels = pattern.bestForBloomLevels
      .split(',')
      .map((level) => level.trim().toUpperCase());

    return supportedLevels.includes(bloomLevel.toUpperCase());
  });

  // Apply constraint-based filtering
  let filteredPatterns = bloomMatchedPatterns;

  // Filter by time constraints if present
  const timeConstraint = constraints.find((c) => c.type.toLowerCase().includes('time'));
  if (timeConstraint && timeConstraint.value) {
    const maxTime = parseInt(timeConstraint.value, 10);
    if (!isNaN(maxTime)) {
      filteredPatterns = filteredPatterns.filter((pattern) => {
        // Include patterns with no duration specified or duration within constraint
        return (
          pattern.typicalDurationMinutes === null ||
          pattern.typicalDurationMinutes <= maxTime
        );
      });
    }
  }

  // Filter by delivery mode constraints if present
  const deliveryConstraint = constraints.find((c) =>
    c.type.toLowerCase().includes('delivery') || c.type.toLowerCase().includes('mode')
  );
  if (deliveryConstraint) {
    // This is a simple implementation - could be enhanced with pattern metadata
    // For now, we don't filter by delivery mode as patterns don't have this field
    // but we could add it to the pattern model in the future
  }

  // Map to return format
  return filteredPatterns.map((pattern) => ({
    id: pattern.id,
    name: pattern.name,
    description: pattern.description,
    bestForBloomLevels: pattern.bestForBloomLevels,
    references: pattern.references,
    typicalDurationMinutes: pattern.typicalDurationMinutes,
  }));
}

/**
 * Helper function to get recommended patterns by IDs only
 */
export async function recommendActivityPatternIds(
  bloomLevel: string,
  constraints: ConstraintInput[] = []
): Promise<string[]> {
  const patterns = await recommendActivityPatterns(bloomLevel, constraints);
  return patterns.map((p) => p.id);
}

