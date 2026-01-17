/**
 * Mock data for AI endpoints when MOCK_AI=true
 * Used for development without real API calls
 */

import { NeedsAnalysisResult } from '@/lib/types/needsAnalysis';
import { GeneratedObjective } from '@/lib/types/objectives';

/**
 * Mock response for analyzeNeedsAnalysis
 */
export const mockNeedsAnalysisResult: NeedsAnalysisResult = {
  summary:
    'New sales representatives are struggling to meet quota in their first 90 days due to inconsistent onboarding and lack of product knowledge.',
  keyInsights: [
    'Current onboarding is informal and varies by manager',
    'Reps don\'t have access to competitive positioning materials',
    'No structured practice opportunities before live calls',
    'Top performers spend 2x more time on product training',
  ],
  audienceNotes:
    'New sales hires, typically 1-3 years B2B experience, joining from various industries. Mix of recent graduates and career changers. Comfortable with technology but need guidance on sales methodology.',
  constraints: [
    'Must complete within first 4 weeks of employment',
    'Limited SME availability (2 hours/week max)',
    'No budget for external content or tools',
    'Remote-first workforce requires async-friendly design',
  ],
  recommendedTasks: [
    {
      title: 'Interview top performers',
      priority: 'HIGH',
      description: 'Identify what successful reps do differently in their first 90 days',
    },
    {
      title: 'Map current onboarding process',
      priority: 'MEDIUM',
      description: 'Document existing informal practices and identify gaps',
    },
    {
      title: 'Define proficiency milestones',
      priority: 'HIGH',
      description: 'What should reps know at week 1, 2, 3, 4?',
    },
    {
      title: 'Create product knowledge assessment',
      priority: 'MEDIUM',
      description: 'Baseline assessment to measure knowledge gaps',
    },
    {
      title: 'Develop practice call scenarios',
      priority: 'LOW',
      description: 'Role-play scenarios for safe practice before live calls',
    },
  ],
};

/**
 * Mock response for generateLearningObjectives / generateObjectivesFromAnalysis
 */
export const mockGeneratedObjectives: GeneratedObjective[] = [
  {
    title: 'Demonstrate the 5-step discovery framework during prospect calls',
    description:
      'Given a prospect call scenario, the sales representative will demonstrate the 5-step discovery framework by asking all required qualification questions and documenting responses accurately.',
    bloomLevel: 'APPLY',
    rationale:
      'Application level chosen because reps need to execute the framework in real situations, not just understand it conceptually.',
    tags: ['discovery', 'sales-process', 'core-skill'],
  },
  {
    title: 'Differentiate our product from top 3 competitors',
    description:
      'When presented with competitor comparisons, the sales representative will correctly identify and articulate at least 3 key differentiators for each of our top 3 competitors.',
    bloomLevel: 'ANALYZE',
    rationale:
      'Analysis level required because reps must break down competitive offerings and compare them to identify meaningful differences.',
    tags: ['competitive', 'product-knowledge'],
  },
  {
    title: 'Explain the value proposition to different buyer personas',
    description:
      'Given a specific buyer persona (Economic Buyer, Technical Evaluator, or End User), the sales representative will explain our value proposition using language and benefits relevant to that persona.',
    bloomLevel: 'UNDERSTAND',
    rationale:
      'Understanding level because reps need to interpret and adapt the core message for different audiences.',
    tags: ['value-prop', 'personas', 'communication'],
  },
  {
    title: 'Create customized proposals addressing customer pain points',
    description:
      'After completing discovery, the sales representative will create a customized proposal that addresses all identified customer pain points with specific product features and expected outcomes.',
    bloomLevel: 'CREATE',
    rationale:
      'Creation level required as reps must synthesize discovery findings into a new, tailored document.',
    tags: ['proposals', 'advanced-skill'],
  },
  {
    title: 'Handle common objections using the LAER framework',
    description:
      'When presented with common sales objections (price, timing, competition, status quo), the sales representative will respond using the LAER (Listen, Acknowledge, Explore, Respond) framework.',
    bloomLevel: 'APPLY',
    rationale:
      'Application level because reps need to execute a specific methodology in response to predictable situations.',
    tags: ['objection-handling', 'sales-process'],
  },
];

/**
 * Simulate API delay for more realistic mock behavior
 */
export async function simulateApiDelay(minMs = 600, maxMs = 1200): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Check if mock AI mode is enabled
 */
export function isMockAiEnabled(): boolean {
  return process.env.MOCK_AI === 'true';
}

/**
 * Log when using mock mode
 */
export function logMockMode(endpoint: string): void {
  console.log(`[AI] Using mock data for ${endpoint} - MOCK_AI=true`);
}
