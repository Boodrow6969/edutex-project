import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteContext {
  params: Promise<{ courseId: string; itemId: string }>;
}

/**
 * POST /api/courses/[courseId]/triage-items/[itemId]/sub-tasks
 * Creates a new sub-task under a triage item.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, itemId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const subTask = await prisma.subTask.create({
      data: {
        parentItemId: itemId,
        text: body.text || '',
        isNew: body.isNew || 'New',
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return Response.json(subTask, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create sub-task');
  }
}
