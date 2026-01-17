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
import { WorkspaceRole, BlockType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ pageId: string; blockId: string }>;
}

// Valid block types for validation
const VALID_BLOCK_TYPES: BlockType[] = [
  'PARAGRAPH',
  'HEADING_1',
  'HEADING_2',
  'HEADING_3',
  'BULLETED_LIST',
  'NUMBERED_LIST',
  'CALLOUT',
  'PERFORMANCE_PROBLEM',
  'INSTRUCTIONAL_GOAL',
  'TASK_STEP',
  'LEARNING_OBJECTIVE',
  'ASSESSMENT_IDEA',
];

/**
 * Helper to verify block exists, belongs to the page, and user has access.
 */
async function verifyBlockAccess(
  pageId: string,
  blockId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
) {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      id: true,
      pageId: true,
      page: {
        select: {
          id: true,
          projectId: true,
          curriculumId: true,
        },
      },
    },
  });

  if (!block) {
    throw new NotFoundError('Block not found');
  }

  // Verify block belongs to the specified page
  if (block.pageId !== pageId) {
    throw new NotFoundError('Block not found on this page');
  }

  // Verify workspace membership through page's parent (project or curriculum)
  await assertPageAccess(pageId, userId, allowedRoles);

  return block;
}

/**
 * PUT /api/pages/[pageId]/blocks/[blockId]
 * Update block content and/or type.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 *
 * Request body:
 * {
 *   "type": "BlockType (optional)",
 *   "content": "object (optional)"
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId, blockId } = await params;

    // Verify access
    await verifyBlockAccess(pageId, blockId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Build update data
    const updateData: { type?: BlockType; content?: object } = {};

    if (body.type !== undefined) {
      if (!VALID_BLOCK_TYPES.includes(body.type as BlockType)) {
        return Response.json(
          {
            error: `Invalid block type. Must be one of: ${VALID_BLOCK_TYPES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.type = body.type as BlockType;
    }

    if (body.content !== undefined) {
      if (body.content === null) {
        return Response.json(
          { error: 'Content cannot be null' },
          { status: 400 }
        );
      }
      updateData.content = body.content;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: updateData,
      select: {
        id: true,
        type: true,
        content: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(updatedBlock);
  } catch (error) {
    return errorResponse(error, 'Failed to update block');
  }
}

/**
 * DELETE /api/pages/[pageId]/blocks/[blockId]
 * Delete a block.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId, blockId } = await params;

    // Verify access
    const block = await verifyBlockAccess(pageId, blockId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    // Delete the block
    await prisma.block.delete({
      where: { id: blockId },
    });

    // Reorder remaining blocks to fill the gap
    await prisma.$executeRaw`
      UPDATE blocks
      SET "order" = "order" - 1
      WHERE "pageId" = ${pageId}
        AND "order" > (SELECT "order" FROM blocks WHERE id = ${blockId})
    `.catch(() => {
      // Block already deleted, ignore the order update failure
    });

    return Response.json({ success: true, message: 'Block deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete block');
  }
}
