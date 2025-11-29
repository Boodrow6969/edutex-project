import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertProjectAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ projectId: string; blueprintId: string; objectiveId: string }>;
}

/**
 * PUT /api/projects/[projectId]/blueprints/[blueprintId]/objectives/[objectiveId]
 * Update an objective.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 *
 * Request body:
 * {
 *   "text": "string (optional)",
 *   "bloomLevel": "string (optional)",
 *   "priority": "string (optional)",
 *   "requiresAssessment": boolean (optional)
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId, blueprintId, objectiveId } = await params;

    // Verify user has permission to update objectives
    await assertProjectAccess(projectId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify blueprint exists and belongs to project
    const blueprint = await prisma.learningBlueprint.findUnique({
      where: { id: blueprintId },
      select: { id: true, projectId: true },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    if (blueprint.projectId !== projectId) {
      throw new NotFoundError('Blueprint does not belong to this project');
    }

    // Verify objective exists and belongs to blueprint
    const existingObjective = await prisma.blueprintObjective.findUnique({
      where: { id: objectiveId },
      select: { id: true, blueprintId: true },
    });

    if (!existingObjective) {
      throw new NotFoundError('Objective not found');
    }

    if (existingObjective.blueprintId !== blueprintId) {
      throw new NotFoundError('Objective does not belong to this blueprint');
    }

    const body = await request.json();

    // Build update data
    const updateData: {
      text?: string;
      bloomLevel?: string;
      priority?: string;
      requiresAssessment?: boolean;
    } = {};

    if (body.text !== undefined) {
      if (typeof body.text !== 'string' || body.text.trim() === '') {
        return Response.json(
          { error: 'Text must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.text = body.text.trim();
    }

    if (body.bloomLevel !== undefined) {
      if (typeof body.bloomLevel !== 'string' || body.bloomLevel.trim() === '') {
        return Response.json(
          { error: 'Bloom level must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.bloomLevel = body.bloomLevel.trim();
    }

    if (body.priority !== undefined) {
      if (typeof body.priority !== 'string' || body.priority.trim() === '') {
        return Response.json(
          { error: 'Priority must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.priority = body.priority.trim();
    }

    if (body.requiresAssessment !== undefined) {
      if (typeof body.requiresAssessment !== 'boolean') {
        return Response.json(
          { error: 'requiresAssessment must be a boolean' },
          { status: 400 }
        );
      }
      updateData.requiresAssessment = body.requiresAssessment;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const objective = await prisma.blueprintObjective.update({
      where: { id: objectiveId },
      data: updateData,
    });

    return Response.json(objective);
  } catch (error) {
    return errorResponse(error, 'Failed to update objective');
  }
}

/**
 * DELETE /api/projects/[projectId]/blueprints/[blueprintId]/objectives/[objectiveId]
 * Delete an objective.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId, blueprintId, objectiveId } = await params;

    // Verify user has permission to delete objectives
    await assertProjectAccess(projectId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify blueprint exists and belongs to project
    const blueprint = await prisma.learningBlueprint.findUnique({
      where: { id: blueprintId },
      select: { id: true, projectId: true },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    if (blueprint.projectId !== projectId) {
      throw new NotFoundError('Blueprint does not belong to this project');
    }

    // Verify objective exists and belongs to blueprint
    const existingObjective = await prisma.blueprintObjective.findUnique({
      where: { id: objectiveId },
      select: { id: true, blueprintId: true },
    });

    if (!existingObjective) {
      throw new NotFoundError('Objective not found');
    }

    if (existingObjective.blueprintId !== blueprintId) {
      throw new NotFoundError('Objective does not belong to this blueprint');
    }

    await prisma.blueprintObjective.delete({
      where: { id: objectiveId },
    });

    return Response.json({ success: true, message: 'Objective deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete objective');
  }
}

