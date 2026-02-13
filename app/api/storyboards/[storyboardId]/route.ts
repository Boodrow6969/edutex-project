import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole, StoryboardStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ storyboardId: string }>;
}

/**
 * Helper to get a storyboard and verify user has access through page's parent.
 */
async function getStoryboardWithAccess(
  storyboardId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
) {
  const storyboard = await prisma.storyboard.findUnique({
    where: { id: storyboardId },
    include: {
      page: {
        select: {
          id: true,
          courseId: true,
          curriculumId: true,
        },
      },
    },
  });

  if (!storyboard) {
    throw new NotFoundError('Storyboard not found');
  }

  // Verify workspace membership through the page's parent
  await assertPageAccess(storyboard.pageId, userId, allowedRoles);

  return storyboard;
}

/**
 * GET /api/storyboards/[storyboardId]
 * Fetch storyboard by id.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { storyboardId } = await params;

    const storyboard = await getStoryboardWithAccess(storyboardId, user.id);

    return Response.json(storyboard);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch storyboard');
  }
}

/**
 * PATCH /api/storyboards/[storyboardId]
 * Update storyboard fields (title, targetAudience, duration, deliveryMethod, status).
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { storyboardId } = await params;

    // Verify access with appropriate roles
    await getStoryboardWithAccess(storyboardId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Validate status if provided
    const validStatuses = Object.values(StoryboardStatus);
    if (body.status && !validStatuses.includes(body.status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate deliveryMethod if provided (case-insensitive comparison)
    const validDeliveryMethods = ['eLearning', 'vILT', 'ILT', 'video', 'blended'];
    if (body.deliveryMethod && !validDeliveryMethods.includes(body.deliveryMethod)) {
      return Response.json(
        { error: `Invalid deliveryMethod. Must be one of: ${validDeliveryMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.deliveryMethod !== undefined) updateData.deliveryMethod = body.deliveryMethod;
    if (body.status !== undefined) updateData.status = body.status;

    const storyboard = await prisma.storyboard.update({
      where: { id: storyboardId },
      data: updateData,
    });

    return Response.json(storyboard);
  } catch (error) {
    return errorResponse(error, 'Failed to update storyboard');
  }
}
