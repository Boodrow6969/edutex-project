import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';
import {
  getCurrentUserOrThrow,
  assertProjectAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { generateLearningObjectives } from '@/lib/ai/instructional-design';
import { WorkspaceRole } from '@prisma/client';
import {
  isMockAiEnabled,
  logMockMode,
  simulateApiDelay,
  mockGeneratedObjectives,
} from '@/lib/ai/mock-data';

/**
 * POST /api/ai/generateObjectives
 * Generates learning objectives using AI based on project context.
 *
 * Request body:
 * {
 *   projectId: string,
 *   context?: string,        // Optional additional context from user
 *   needsSummary?: string    // Optional needs analysis summary
 * }
 *
 * Returns: { objectives: GeneratedObjective[] }
 */
export async function POST(request: NextRequest) {
  // Check for mock mode first
  if (isMockAiEnabled()) {
    logMockMode('generateObjectives');
    await simulateApiDelay();
    return Response.json({ objectives: mockGeneratedObjectives });
  }

  try {
    const user = await getCurrentUserOrThrow();
    const body = await request.json();

    // Validate projectId
    if (!body.projectId || typeof body.projectId !== 'string') {
      return Response.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Verify user has permission to generate objectives (Designers and above)
    await assertProjectAccess(body.projectId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Fetch project info for context
    const project = await prisma.project.findUnique({
      where: { id: body.projectId },
      select: {
        name: true,
        description: true,
      },
    });

    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check that we have at least some context to work with
    const hasContext = body.context?.trim() || body.needsSummary?.trim() || project.description?.trim();
    if (!hasContext) {
      return Response.json(
        { error: 'At least one source of context is required (context, needsSummary, or project description)' },
        { status: 400 }
      );
    }

    // Generate objectives using AI
    const objectives = await generateLearningObjectives(
      {
        projectId: body.projectId,
        context: body.context?.trim() || undefined,
        needsSummary: body.needsSummary?.trim() || undefined,
      },
      {
        name: project.name,
        description: project.description,
      }
    );

    return Response.json({ objectives });
  } catch (error) {
    return errorResponse(error, 'Failed to generate objectives');
  }
}
