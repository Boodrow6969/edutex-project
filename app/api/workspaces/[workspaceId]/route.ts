import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

/**
 * GET /api/workspaces/[workspaceId]
 * Get workspace details including courses and member count.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    // Verify membership (any role is fine for viewing)
    const membership = await assertWorkspaceMember(workspaceId, user.id);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        curricula: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            members: true,
            courses: true,
            curricula: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    return Response.json({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: membership.role,
      memberCount: workspace._count.members,
      courseCount: workspace._count.courses,
      curriculumCount: workspace._count.curricula,
      courses: workspace.courses,
      curricula: workspace.curricula,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch workspace');
  }
}

/**
 * PUT /api/workspaces/[workspaceId]
 * Update workspace name and/or description.
 * Requires ADMINISTRATOR or MANAGER role.
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
    const { workspaceId } = await params;

    // Only ADMINISTRATOR and MANAGER can update workspace
    await assertWorkspaceMember(workspaceId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
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

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return Response.json({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: workspace.members[0]?.role ?? null,
      courses: workspace.courses,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update workspace');
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]
 * Delete a workspace and all its courses, pages, etc.
 * Requires ADMINISTRATOR role.
 *
 * Note: This is a hard delete. The schema uses onDelete: Cascade,
 * so all related records (members, courses, pages, etc.) will be deleted.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    // Only ADMINISTRATOR can delete workspace
    await assertWorkspaceMember(workspaceId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
    ]);

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return Response.json({ success: true, message: 'Workspace deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete workspace');
  }
}
