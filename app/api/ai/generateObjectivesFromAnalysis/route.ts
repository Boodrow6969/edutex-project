import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { aiService } from '@/lib/ai';
import { WorkspaceRole } from '@prisma/client';
import { GeneratedObjective } from '@/lib/types/objectives';
import {
  isMockAiEnabled,
  logMockMode,
  simulateApiDelay,
  mockGeneratedObjectives,
} from '@/lib/ai/mock-data';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generateObjectivesFromAnalysis
 * Generates learning objectives from a Needs Analysis page.
 *
 * Request body:
 * {
 *   pageId: string  // ID of the NEEDS_ANALYSIS page
 * }
 *
 * Returns: { objectives: GeneratedObjective[], courseId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate pageId
    if (!body.pageId || typeof body.pageId !== 'string') {
      return Response.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    // Check for mock mode - still need to get courseId from DB for realistic response
    if (isMockAiEnabled()) {
      logMockMode('generateObjectivesFromAnalysis');

      // Get minimal page info for courseId
      const page = await prisma.page.findUnique({
        where: { id: body.pageId },
        select: { courseId: true },
      });

      await simulateApiDelay();
      return Response.json({
        objectives: mockGeneratedObjectives,
        courseId: page?.courseId || 'demo-course-id',
      });
    }

    const user = await getCurrentUserOrThrow();

    // Fetch the page and its needs analysis data
    const page = await prisma.page.findUnique({
      where: { id: body.pageId },
      select: {
        id: true,
        type: true,
        courseId: true,
        curriculumId: true,
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        curriculum: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        needsAnalysis: true,
      },
    });

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    if (page.type !== 'NEEDS_ANALYSIS') {
      return Response.json(
        { error: 'Page is not a Needs Analysis page' },
        { status: 400 }
      );
    }

    // Verify user has permission to generate objectives
    await assertPageAccess(body.pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const na = page.needsAnalysis;

    // Check that we have enough data to generate objectives
    if (!na || (!na.desiredState && !na.problemStatement)) {
      return Response.json(
        { error: 'Please fill in at least the Desired State or Problem Statement before generating objectives' },
        { status: 400 }
      );
    }

    // Build a comprehensive prompt from needs analysis data
    const contextParts: string[] = [];

    // Handle both course and curriculum pages
    if (page.course) {
      contextParts.push(`Course: ${page.course.name}`);
      if (page.course.description) {
        contextParts.push(`Course Description: ${page.course.description}`);
      }
    } else if (page.curriculum) {
      contextParts.push(`Curriculum: ${page.curriculum.name}`);
      if (page.curriculum.description) {
        contextParts.push(`Curriculum Description: ${page.curriculum.description}`);
      }
    }

    if (na.problemStatement) {
      contextParts.push(`\n## Problem Statement\n${na.problemStatement}`);
    }

    if (na.businessNeed) {
      contextParts.push(`\n## Business Need\n${na.businessNeed}`);
    }

    if (na.desiredState) {
      contextParts.push(`\n## Desired State (What learners should be able to do)\n${na.desiredState}`);
    }

    if (na.currentState) {
      contextParts.push(`\n## Current State\n${na.currentState}`);
    }

    if (na.learnerPersonas && na.learnerPersonas.length > 0) {
      contextParts.push(`\n## Target Audience\n${na.learnerPersonas.join('\n- ')}`);
    }

    if (na.level3Behavior) {
      contextParts.push(`\n## Observable Behaviors (Kirkpatrick Level 3)\n${na.level3Behavior}`);
    }

    if (na.level4Results) {
      contextParts.push(`\n## Business Results (Kirkpatrick Level 4)\n${na.level4Results}`);
    }

    if (na.constraints && na.constraints.length > 0) {
      contextParts.push(`\n## Constraints\n- ${na.constraints.join('\n- ')}`);
    }

    const combinedContext = contextParts.join('\n');

    // Generate objectives using AI
    const response = await aiService.complete({
      provider: 'anthropic',
      messages: [
        {
          role: 'system',
          content: `You are an expert instructional designer creating learning objectives from a needs analysis.

Your objectives must follow the ABCD format:
- Audience: Who the learner is
- Behavior: What they will be able to do (using Bloom's action verbs)
- Condition: Under what circumstances
- Degree: To what standard or criterion

Guidelines:
1. Use precise action verbs from Bloom's Taxonomy
2. Make objectives measurable and observable
3. Focus on performance, not content coverage
4. Align with the desired state and observable behaviors from the needs analysis
5. Consider the identified constraints and audience characteristics
6. Generate 3-7 objectives that progressively build cognitive skills

Return your response as a JSON array:
[
  {
    "title": "Concise objective statement with action verb",
    "description": "Full ABCD objective with condition and criterion details",
    "bloomLevel": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE",
    "rationale": "Why this objective addresses the needs analysis",
    "tags": ["relevant", "tags"]
  }
]`,
        },
        {
          role: 'user',
          content: `Generate learning objectives based on this needs analysis:\n\n${combinedContext}`,
        },
      ],
      temperature: 0.6,
      maxTokens: 3000,
    });

    let objectives: GeneratedObjective[];

    try {
      const parsed = JSON.parse(response.content);
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      objectives = parsed.map((obj: Record<string, unknown>) => ({
        title: typeof obj.title === 'string' ? obj.title : 'Untitled Objective',
        description: typeof obj.description === 'string' ? obj.description : '',
        bloomLevel: normalizeBloomLevel(obj.bloomLevel),
        rationale: typeof obj.rationale === 'string' ? obj.rationale : undefined,
        tags: Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === 'string') : [],
      }));
    } catch {
      // Fallback if JSON parsing fails
      objectives = [
        {
          title: 'Review AI-generated content',
          description: response.content,
          bloomLevel: 'APPLY',
          rationale: 'Generated from unstructured AI response',
          tags: [],
        },
      ];
    }

    return Response.json({
      objectives,
      courseId: page.courseId || null,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to generate objectives from analysis');
  }
}

function normalizeBloomLevel(level: unknown): GeneratedObjective['bloomLevel'] {
  if (typeof level !== 'string') return 'APPLY';

  const normalized = level.toUpperCase();
  const validLevels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];

  if (validLevels.includes(normalized)) {
    return normalized as GeneratedObjective['bloomLevel'];
  }

  return 'APPLY';
}
