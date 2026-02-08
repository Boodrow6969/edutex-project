import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { toBloomLevel, isValidBloomLevel, CreateObjectiveInput } from '@/lib/types/objectives';
import { WorkspaceRole } from '@prisma/client';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/objectives
 * Returns all objectives for the course, ordered by createdAt.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;

    // Verify user has access to this course
    await assertCourseAccess(courseId, user.id);

    const objectives = await prisma.objective.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(objectives);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch objectives');
  }
}

/**
 * POST /api/courses/[courseId]/objectives
 * Creates one or more objectives for the course.
 *
 * Request body:
 * {
 *   objectives: Array<{
 *     title: string,
 *     description: string,
 *     bloomLevel: string,
 *     tags?: string[]
 *   }>
 * }
 *
 * Returns: { created: Objective[] }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    const body = await request.json();

    // Verify user has permission to create objectives (Designers and above)
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Validate objectives array
    if (!body.objectives || !Array.isArray(body.objectives)) {
      return Response.json(
        { error: 'objectives array is required' },
        { status: 400 }
      );
    }

    if (body.objectives.length === 0) {
      return Response.json(
        { error: 'At least one objective is required' },
        { status: 400 }
      );
    }

    // Validate each objective
    const validatedObjectives: CreateObjectiveInput[] = [];
    for (let i = 0; i < body.objectives.length; i++) {
      const obj = body.objectives[i];

      if (!obj.title || typeof obj.title !== 'string') {
        return Response.json(
          { error: `Objective at index ${i} must have a title` },
          { status: 400 }
        );
      }

      if (typeof obj.description !== 'string') {
        return Response.json(
          { error: `Objective at index ${i} must have a description` },
          { status: 400 }
        );
      }

      if (!obj.bloomLevel || !isValidBloomLevel(obj.bloomLevel)) {
        return Response.json(
          { error: `Objective at index ${i} has invalid bloomLevel. Valid values: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE` },
          { status: 400 }
        );
      }

      validatedObjectives.push({
        title: obj.title.trim(),
        description: obj.description.trim(),
        bloomLevel: obj.bloomLevel.toUpperCase(),
        tags: Array.isArray(obj.tags)
          ? obj.tags.filter((t: unknown): t is string => typeof t === 'string')
          : undefined,
      });
    }

    // Create all objectives in a transaction
    const created = await prisma.$transaction(
      validatedObjectives.map((obj) =>
        prisma.objective.create({
          data: {
            title: obj.title,
            description: obj.description,
            bloomLevel: toBloomLevel(obj.bloomLevel),
            tags: obj.tags || [],
            courseId,
          },
        })
      )
    );

    return Response.json({ created }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create objectives');
  }
}
