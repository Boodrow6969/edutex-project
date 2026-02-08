import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ curriculumId: string }>;
}

/**
 * PATCH /api/curricula/[curriculumId]/archive
 * Archive or restore a curriculum.
 * Requires ADMINISTRATOR or MANAGER role.
 *
 * Request body: { "action": "archive" | "restore" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    await assertCurriculumAccess(curriculumId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
    ]);

    const body = await request.json();
    const { action } = body;

    if (action !== 'archive' && action !== 'restore') {
      return Response.json(
        { error: 'action must be "archive" or "restore"' },
        { status: 400 }
      );
    }

    const curriculum = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        archivedAt: action === 'archive' ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        archivedAt: true,
        updatedAt: true,
      },
    });

    return Response.json(curriculum);
  } catch (error) {
    return errorResponse(error, 'Failed to update curriculum archive status');
  }
}
