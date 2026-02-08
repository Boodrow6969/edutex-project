import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { toBloomLevel, isValidBloomLevel } from '@/lib/types/objectives';
import { WorkspaceRole } from '@prisma/client';

interface RouteContext {
  params: Promise<{ objectiveId: string }>;
}

/**
 * Helper to get objective and verify access
 */
async function getObjectiveWithAccess(
  objectiveId: string,
  userId: string,
  requiredRoles?: WorkspaceRole[]
) {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: {
      course: {
        select: { id: true, workspaceId: true },
      },
    },
  });

  if (!objective) {
    throw { status: 404, message: 'Objective not found' };
  }

  // Verify user has access to the course's workspace
  await assertCourseAccess(objective.courseId, userId, requiredRoles);

  return objective;
}

/**
 * GET /api/objectives/[objectiveId]
 * Returns a single objective.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { objectiveId } = await context.params;

    const objective = await getObjectiveWithAccess(objectiveId, user.id);

    // Return without the course include
    const { course: _course, ...objectiveData } = objective;
    return Response.json(objectiveData);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch objective');
  }
}

/**
 * PUT /api/objectives/[objectiveId]
 * Updates an objective.
 *
 * Request body (all fields optional):
 * {
 *   title?: string,
 *   description?: string,
 *   bloomLevel?: string,
 *   tags?: string[]
 * }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { objectiveId } = await context.params;
    const body = await request.json();

    // Verify user has permission to edit objectives (Designers and above)
    await getObjectiveWithAccess(objectiveId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Build update data
    const updateData: {
      title?: string;
      description?: string;
      bloomLevel?: ReturnType<typeof toBloomLevel>;
      tags?: string[];
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return Response.json(
          { error: 'title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return Response.json(
          { error: 'description must be a string' },
          { status: 400 }
        );
      }
      updateData.description = body.description.trim();
    }

    if (body.bloomLevel !== undefined) {
      if (!isValidBloomLevel(body.bloomLevel)) {
        return Response.json(
          { error: 'Invalid bloomLevel. Valid values: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE' },
          { status: 400 }
        );
      }
      updateData.bloomLevel = toBloomLevel(body.bloomLevel);
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return Response.json(
          { error: 'tags must be an array' },
          { status: 400 }
        );
      }
      updateData.tags = body.tags.filter(
        (t: unknown): t is string => typeof t === 'string'
      );
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.objective.update({
      where: { id: objectiveId },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error, 'Failed to update objective');
  }
}

/**
 * DELETE /api/objectives/[objectiveId]
 * Deletes an objective.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { objectiveId } = await context.params;

    // Verify user has permission to delete objectives (Designers and above)
    await getObjectiveWithAccess(objectiveId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    await prisma.objective.delete({
      where: { id: objectiveId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete objective');
  }
}
