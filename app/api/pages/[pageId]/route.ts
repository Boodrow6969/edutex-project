import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

/**
 * Helper to get a page and verify user has access through project or curriculum workspace.
 */
async function getPageWithAccess(pageId: string, userId: string, allowedRoles?: WorkspaceRole[]) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      title: true,
      type: true,
      order: true,
      projectId: true,
      curriculumId: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          id: true,
          workspaceId: true,
        },
      },
      curriculum: {
        select: {
          id: true,
          workspaceId: true,
        },
      },
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  // Verify workspace membership through page's parent (project or curriculum)
  const access = await assertPageAccess(pageId, userId, allowedRoles);

  return { page, membership: access.membership, workspaceId: access.workspaceId };
}

/**
 * GET /api/pages/[pageId]
 * Fetch page metadata and all blocks ordered by order ascending.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    const { page, membership, workspaceId } = await getPageWithAccess(pageId, user.id);

    // Fetch blocks separately for cleaner query
    const blocks = await prisma.block.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        content: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      id: page.id,
      title: page.title,
      type: page.type,
      order: page.order,
      projectId: page.projectId,
      curriculumId: page.curriculumId,
      workspaceId,
      createdById: page.createdById,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      role: membership.role,
      blocks,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch page');
  }
}

/**
 * PUT /api/pages/[pageId]
 * Update page title.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 *
 * Request body:
 * {
 *   "title": "string (optional)"
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    // Verify access with appropriate roles
    await getPageWithAccess(pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Build update data
    const updateData: { title?: string } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return Response.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(updatedPage);
  } catch (error) {
    return errorResponse(error, 'Failed to update page');
  }
}

/**
 * DELETE /api/pages/[pageId]
 * Delete a page and all its blocks.
 * Requires ADMINISTRATOR or MANAGER role.
 *
 * Note: This is a hard delete. Blocks cascade delete via schema.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    // Only ADMINISTRATOR and MANAGER can delete pages
    await getPageWithAccess(pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
    ]);

    await prisma.page.delete({
      where: { id: pageId },
    });

    return Response.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete page');
  }
}
