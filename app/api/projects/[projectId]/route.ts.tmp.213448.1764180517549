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
  params: Promise<{ projectId: string }>;
}

/**
 * GET /api/projects/[projectId]
 * Get project details including page count and related statistics.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId } = await params;

    // Verify user has access to this project's workspace
    const { membership } = await assertProjectAccess(projectId, user.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            tasks: true,
            objectives: true,
            deliverables: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return Response.json({
      id: project.id,
      name: project.name,
      description: project.description,
      workspaceId: project.workspaceId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role: membership.role,
      pages: project.pages,
      taskCount: project._count.tasks,
      objectiveCount: project._count.objectives,
      deliverableCount: project._count.deliverables,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch project');
  }
}

/**
 * PUT /api/projects/[projectId]
 * Update project name and/or description.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 *
 * Request body:
 * {
 *   "name": "string (optional)",
 *   "description": "string (optional)"
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId } = await params;

    // Verify user has permission to update projects
    await assertProjectAccess(projectId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const body = await request.json();

    // Build update data
    const updateData: { name?: string; description?: string | null } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return Response.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
            objectives: true,
          },
        },
      },
    });

    return Response.json({
      id: project.id,
      name: project.name,
      description: project.description,
      workspaceId: project.workspaceId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      pageCount: project._count.pages,
      taskCount: project._count.tasks,
      objectiveCount: project._count.objectives,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update project');
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a project and all its pages, tasks, etc.
 * Requires ADMINISTRATOR or MANAGER role.
 *
 * Note: This is a hard delete. The schema uses onDelete: Cascade,
 * so all related records (pages, blocks, tasks, etc.) will be deleted.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId } = await params;

    // Only ADMINISTRATOR and MANAGER can delete projects
    await assertProjectAccess(projectId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
    ]);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return Response.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete project');
  }
}
