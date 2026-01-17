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

interface BlockOrderUpdate {
  id: string;
  order: number;
}

/**
 * Helper to verify page exists and user has access.
 */
async function verifyPageAccess(pageId: string, userId: string, allowedRoles?: WorkspaceRole[]) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      projectId: true,
      curriculumId: true,
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  await assertPageAccess(pageId, userId, allowedRoles);

  return page;
}

/**
 * PUT /api/pages/[pageId]/blocks/reorder
 * Reorder blocks by updating their order field.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 *
 * Request body:
 * {
 *   "blocks": [
 *     { "id": "block-id-1", "order": 0 },
 *     { "id": "block-id-2", "order": 1 },
 *     ...
 *   ]
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    // Verify access
    await verifyPageAccess(pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Validate blocks array
    if (!Array.isArray(body.blocks)) {
      return Response.json(
        { error: 'blocks must be an array' },
        { status: 400 }
      );
    }

    const blockUpdates: BlockOrderUpdate[] = body.blocks;

    // Validate each block update
    for (const update of blockUpdates) {
      if (typeof update.id !== 'string' || update.id.trim() === '') {
        return Response.json(
          { error: 'Each block must have a valid id' },
          { status: 400 }
        );
      }
      if (typeof update.order !== 'number' || update.order < 0) {
        return Response.json(
          { error: 'Each block must have a valid order (non-negative number)' },
          { status: 400 }
        );
      }
    }

    // Verify all blocks belong to this page
    const blockIds = blockUpdates.map((b) => b.id);
    const existingBlocks = await prisma.block.findMany({
      where: {
        id: { in: blockIds },
        pageId: pageId,
      },
      select: { id: true },
    });

    const existingBlockIds = new Set(existingBlocks.map((b) => b.id));
    const invalidIds = blockIds.filter((id) => !existingBlockIds.has(id));

    if (invalidIds.length > 0) {
      return Response.json(
        { error: `Some blocks were not found on this page: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Update all block orders in a transaction
    await prisma.$transaction(
      blockUpdates.map((update) =>
        prisma.block.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    // Fetch and return the updated blocks
    const updatedBlocks = await prisma.block.findMany({
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

    return Response.json({ blocks: updatedBlocks });
  } catch (error) {
    return errorResponse(error, 'Failed to reorder blocks');
  }
}
