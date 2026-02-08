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
  params: Promise<{ pageId: string }>;
}

// Valid block types for validation
const VALID_BLOCK_TYPES: BlockType[] = [
  // M1: Basic blocks
  'PARAGRAPH',
  'HEADING_1',
  'HEADING_2',
  'HEADING_3',
  'BULLETED_LIST',
  'NUMBERED_LIST',
  'CALLOUT',
  // M1: Needs analysis blocks
  'PERFORMANCE_PROBLEM',
  'INSTRUCTIONAL_GOAL',
  'TASK_STEP',
  'LEARNING_OBJECTIVE',
  'ASSESSMENT_IDEA',
  'STORYBOARD_FRAME',
  // M2: Storyboard blocks
  'STORYBOARD_METADATA',
  'CONTENT_SCREEN',
  'LEARNING_OBJECTIVES_IMPORT',
  'CHECKLIST',
  'TABLE',
  'FACILITATOR_NOTES',
  'MATERIALS_LIST',
  // M2.5: Media blocks
  'IMAGE',
  'VIDEO',
];

/**
 * Helper to verify page exists and user has access.
 */
async function verifyPageAccess(pageId: string, userId: string, allowedRoles?: WorkspaceRole[]) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      courseId: true,
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
 * POST /api/pages/[pageId]/blocks
 * Create a new block for the page.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 *
 * Request body:
 * {
 *   "type": "BlockType (required)",
 *   "content": "object (required)",
 *   "order": "number (optional, defaults to end of list)"
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Validate type
    if (!body.type || !VALID_BLOCK_TYPES.includes(body.type as BlockType)) {
      return Response.json(
        {
          error: `Invalid block type. Must be one of: ${VALID_BLOCK_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate content
    if (body.content === undefined || body.content === null) {
      return Response.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const blockType = body.type as BlockType;
    const content = body.content;

    // Determine order
    let order: number;
    if (typeof body.order === 'number' && body.order >= 0) {
      order = body.order;

      // Shift existing blocks at or after this order
      await prisma.block.updateMany({
        where: {
          pageId,
          order: { gte: order },
        },
        data: {
          order: { increment: 1 },
        },
      });
    } else {
      // Get the highest order value
      const maxOrderBlock = await prisma.block.findFirst({
        where: { pageId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrderBlock?.order ?? -1) + 1;
    }

    // Create the block
    const block = await prisma.block.create({
      data: {
        type: blockType,
        content,
        pageId,
        order,
      },
      select: {
        id: true,
        type: true,
        content: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(block, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create block');
  }
}
