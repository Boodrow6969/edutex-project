import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';
import { defaultMetadata } from '@/lib/types/storyboard';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

/**
 * Helper to get a page and verify user has access through course or curriculum workspace.
 */
async function getPageWithAccess(
  pageId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      type: true,
      courseId: true,
      curriculumId: true,
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  // Verify workspace membership through page's parent (course or curriculum)
  await assertPageAccess(pageId, userId, allowedRoles);

  return page;
}

/**
 * GET /api/pages/[pageId]/storyboard
 * Fetch storyboard metadata for a page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    await getPageWithAccess(pageId, user.id);

    const storyboard = await prisma.storyboard.findUnique({
      where: { pageId },
    });

    // Return default data if no storyboard exists yet
    if (!storyboard) {
      return Response.json({
        pageId,
        ...defaultMetadata,
      });
    }

    return Response.json(storyboard);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch storyboard');
  }
}

/**
 * PUT /api/pages/[pageId]/storyboard
 * Save (upsert) storyboard metadata for a page.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
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

    // Validate status if provided
    const validStatuses = ['draft', 'review', 'approved'];
    if (body.status && !validStatuses.includes(body.status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert the storyboard metadata
    const storyboard = await prisma.storyboard.upsert({
      where: { pageId },
      create: {
        pageId,
        targetAudience: body.targetAudience ?? '',
        status: body.status ?? 'draft',
        linkedObjectiveIds: body.linkedObjectiveIds ?? [],
        version: body.version ?? 1,
      },
      update: {
        targetAudience: body.targetAudience ?? undefined,
        status: body.status ?? undefined,
        linkedObjectiveIds: body.linkedObjectiveIds ?? undefined,
        version: body.version ?? undefined,
      },
    });

    return Response.json(storyboard);
  } catch (error) {
    return errorResponse(error, 'Failed to save storyboard');
  }
}
