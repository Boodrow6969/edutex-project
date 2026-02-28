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
import { WorkspaceRole, Prisma } from '@prisma/client';

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
 * Supports two modes:
 * 1. Batch mode: { objectives: Array<{title, description, bloomLevel, tags?}> }
 * 2. Wizard mode (single): { title, description?, bloomLevel?, ...wizard fields }
 *
 * Returns: { created: Objective[] } (batch) or single Objective (wizard)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Wizard single-objective mode (no objectives array)
    if (!body.objectives) {
      const data: Prisma.ObjectiveUncheckedCreateInput = {
        courseId,
        title: body.title || '',
        description: body.description || '',
        bloomLevel: body.bloomLevel && isValidBloomLevel(body.bloomLevel)
          ? toBloomLevel(body.bloomLevel)
          : 'REMEMBER',
        tags: [],
        // Wizard ABCD fields
        ...(body.audience !== undefined && { audience: body.audience }),
        ...(body.verb !== undefined && { verb: body.verb }),
        ...(body.bloomKnowledge !== undefined && { bloomKnowledge: body.bloomKnowledge || null }),
        ...(body.condition !== undefined && { condition: body.condition }),
        ...(body.criteria !== undefined && { criteria: body.criteria }),
        ...(body.freeformText !== undefined && { freeformText: body.freeformText }),
        ...(body.objectivePriority !== undefined && { objectivePriority: body.objectivePriority || null }),
        ...(body.requiresAssessment !== undefined && { requiresAssessment: body.requiresAssessment }),
        ...(body.wiifm !== undefined && { wiifm: body.wiifm }),
        ...(body.rationale !== undefined && { rationale: body.rationale }),
        ...(body.linkedTriageItemId !== undefined && { linkedTriageItemId: body.linkedTriageItemId || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      };

      const created = await prisma.objective.create({ data });
      return Response.json(created, { status: 201 });
    }

    // Batch mode (existing behavior)
    if (!Array.isArray(body.objectives)) {
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
