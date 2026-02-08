import { aiService } from './index';
import { NeedsAnalysisResult } from '@/lib/types/needsAnalysis';
import { GeneratedObjective, GenerateObjectivesInput } from '@/lib/types/objectives';

/**
 * Convert raw SME notes into structured task lists
 */
export async function convertNotesToTaskList(notes: string): Promise<string> {
  const response = await aiService.complete({
    provider: 'openai', // Good for structured extraction
    messages: [
      {
        role: 'system',
        content: `You are an expert instructional designer. Your task is to analyze subject matter expert (SME) notes and convert them into a clear, structured task list for training development.

Extract concrete, actionable tasks from the notes. Each task should be:
- Specific and measurable
- Focused on a single action or outcome
- Written in clear, professional language
- Relevant to instructional design or training development

Format the output as a numbered list.`,
      },
      {
        role: 'user',
        content: `Convert these SME notes into a structured task list:\n\n${notes}`,
      },
    ],
    temperature: 0.5,
    maxTokens: 1500,
  });

  return response.content;
}

/**
 * Generate measurable learning objectives from context and needs analysis.
 *
 * @param input - Generation input including courseId, optional context, and optional needs summary
 * @param projectInfo - Basic project information (name, description)
 * @returns Array of generated objectives with Bloom levels and rationales
 */
export async function generateLearningObjectives(
  input: GenerateObjectivesInput,
  projectInfo?: { name: string; description?: string | null }
): Promise<GeneratedObjective[]> {
  // Build context from all available sources
  const contextParts: string[] = [];

  if (projectInfo?.name) {
    contextParts.push(`Project: ${projectInfo.name}`);
    if (projectInfo.description) {
      contextParts.push(`Project Description: ${projectInfo.description}`);
    }
  }

  if (input.needsSummary) {
    contextParts.push(`Needs Analysis Summary:\n${input.needsSummary}`);
  }

  if (input.context) {
    contextParts.push(`Additional Context:\n${input.context}`);
  }

  const combinedContext = contextParts.join('\n\n');

  if (!combinedContext.trim()) {
    throw new Error('At least one source of context is required to generate objectives');
  }

  const response = await aiService.complete({
    provider: 'anthropic', // Good for structured, analytical outputs
    messages: [
      {
        role: 'system',
        content: `You are an expert instructional designer specializing in learning objectives. Create measurable learning objectives following SMART criteria and Bloom's Taxonomy.

Guidelines for each objective:
1. Use precise action verbs from Bloom's Taxonomy (e.g., "identify", "explain", "apply", "analyze", "evaluate", "create")
2. Make objectives measurable and observable - avoid vague verbs like "understand" or "know"
3. Focus on learner performance, not instructor activities
4. Be specific about conditions and criteria when relevant
5. Keep each objective concise (1-2 sentences)
6. Cover different cognitive levels appropriate to the training need

Return your response as a JSON array with this exact structure:
[
  {
    "title": "A concise objective statement starting with an action verb",
    "description": "Extended explanation of what the learner will demonstrate",
    "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE",
    "rationale": "Brief explanation of why this Bloom level was chosen",
    "tags": ["optional", "categorization", "tags"]
  }
]

Generate 4-6 objectives that progressively build from lower to higher cognitive levels.`,
      },
      {
        role: 'user',
        content: `Generate learning objectives based on this context:\n\n${combinedContext}`,
      },
    ],
    temperature: 0.6,
    maxTokens: 2500,
  });

  try {
    const parsed = JSON.parse(response.content);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // Validate and normalize each objective
    return parsed.map((obj: Record<string, unknown>) => ({
      title: typeof obj.title === 'string' ? obj.title : 'Untitled Objective',
      description: typeof obj.description === 'string' ? obj.description : '',
      bloomLevel: normalizeBloomLevel(obj.bloomLevel),
      rationale: typeof obj.rationale === 'string' ? obj.rationale : undefined,
      tags: Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === 'string') : undefined,
    }));
  } catch {
    // Fallback if JSON parsing fails - create a single objective from the response
    return [
      {
        title: 'Review AI-generated content',
        description: response.content,
        bloomLevel: 'APPLY',
        rationale: 'Generated from unstructured AI response',
      },
    ];
  }
}

/**
 * Normalize a bloom level string to valid BloomLevelString
 */
function normalizeBloomLevel(level: unknown): GeneratedObjective['bloomLevel'] {
  if (typeof level !== 'string') return 'APPLY';

  const normalized = level.toUpperCase();
  const validLevels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];

  if (validLevels.includes(normalized)) {
    return normalized as GeneratedObjective['bloomLevel'];
  }

  return 'APPLY';
}

/**
 * Suggest assessment ideas aligned with objectives and Bloom level
 */
export async function suggestAssessments(
  objective: string,
  bloomLevel: string
): Promise<string> {
  const response = await aiService.complete({
    messages: [
      {
        role: 'system',
        content: `You are an expert in assessment design for instructional design. Generate assessment ideas that are:
- Aligned with the learning objective and Bloom's Taxonomy level
- Authentic and practical
- Measurable and observable
- Appropriate for adult learners in professional training

Provide 2-3 specific assessment ideas with brief descriptions.`,
      },
      {
        role: 'user',
        content: `Suggest assessment ideas for this learning objective (Bloom level: ${bloomLevel}):\n\n${objective}`,
      },
    ],
    temperature: 0.7,
    maxTokens: 1000,
  });

  return response.content;
}

/**
 * Analyze needs analysis content and extract key insights, audience notes,
 * constraints, and recommended tasks for the instructional design project.
 */
export async function analyzeNeedsAnalysis(content: string): Promise<NeedsAnalysisResult> {
  const response = await aiService.complete({
    provider: 'anthropic', // Good for long-form analysis
    messages: [
      {
        role: 'system',
        content: `You are an expert instructional designer analyzing a needs analysis document. Extract and structure the following information:

1. Summary: A concise 2-3 sentence overview of the training need
2. Key Insights: Important observations about performance gaps, business impact, and training needs
3. Audience Notes: Description of the target audience, their current skills, and learning preferences
4. Constraints: Any limitations identified (time, budget, technology, organizational, etc.)
5. Recommended Tasks: Specific actionable tasks for the instructional design project

Return your analysis as JSON with this exact structure:
{
  "summary": "Brief 2-3 sentence summary...",
  "keyInsights": ["insight 1", "insight 2", "..."],
  "audienceNotes": "Description of target audience...",
  "constraints": ["constraint 1", "constraint 2", "..."],
  "recommendedTasks": [
    { "title": "Task title", "priority": "HIGH|MEDIUM|LOW|URGENT", "description": "Optional brief description" }
  ]
}

For recommendedTasks, include 3-7 concrete tasks that would help develop the training solution. Assign priority based on:
- URGENT: Critical blockers or dependencies
- HIGH: Essential tasks for project success
- MEDIUM: Important but not blocking
- LOW: Nice-to-have or future considerations`,
      },
      {
        role: 'user',
        content: `Analyze this needs analysis content and extract structured insights:\n\n${content}`,
      },
    ],
    temperature: 0.5,
    maxTokens: 2500,
  });

  try {
    const parsed = JSON.parse(response.content);
    // Ensure all required fields exist with defaults
    return {
      summary: parsed.summary || '',
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      audienceNotes: parsed.audienceNotes || '',
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      recommendedTasks: Array.isArray(parsed.recommendedTasks)
        ? parsed.recommendedTasks.map((task: { title?: string; priority?: string; description?: string }) => ({
            title: task.title || 'Untitled Task',
            priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(task.priority || '')
              ? task.priority
              : 'MEDIUM',
            description: task.description,
          }))
        : [],
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary: response.content,
      keyInsights: [],
      audienceNotes: '',
      constraints: [],
      recommendedTasks: [],
    };
  }
}

/**
 * Generate executive summary for stakeholders
 */
export async function generateExecutiveSummary(
  projectData: {
    needsAnalysis?: string;
    objectives?: string[];
    deliverables?: string[];
  }
): Promise<string> {
  const content = `
Needs Analysis: ${projectData.needsAnalysis || 'Not provided'}
Learning Objectives: ${projectData.objectives?.join(', ') || 'Not provided'}
Deliverables: ${projectData.deliverables?.join(', ') || 'Not provided'}
  `.trim();

  const response = await aiService.complete({
    messages: [
      {
        role: 'system',
        content: `You are an expert at creating executive summaries for training projects. Create a concise, professional summary (250-300 words) that:
- Highlights the business problem and training solution
- Summarizes key objectives and outcomes
- Mentions major deliverables
- Uses clear, non-technical language suitable for executives
- Focuses on business impact and ROI`,
      },
      {
        role: 'user',
        content: `Create an executive summary from this project information:\n\n${content}`,
      },
    ],
    temperature: 0.6,
    maxTokens: 800,
  });

  return response.content;
}
