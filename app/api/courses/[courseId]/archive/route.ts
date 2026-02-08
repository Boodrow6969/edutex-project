import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * PATCH /api/courses/[courseId]/archive
 * Archive or restore a course.
 * Requires ADMINISTRATOR or MANAGER role.
 *
 * Request body: { "action": "archive" | "restore" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    await assertCourseAccess(courseId, user.id, [
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

    const course = await prisma.course.update({
      where: { id: courseId },
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

    return Response.json(course);
  } catch (error) {
    return errorResponse(error, 'Failed to update course archive status');
  }
}
