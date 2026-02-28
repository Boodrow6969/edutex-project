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
  params: Promise<{ courseId: string; itemId: string; subTaskId: string }>;
}

/**
 * PATCH /api/courses/[courseId]/triage-items/[itemId]/sub-tasks/[subTaskId]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, subTaskId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const updateData: Record<string, unknown> = {};
    if (typeof body.text === 'string') updateData.text = body.text;
    if (typeof body.isNew === 'string') updateData.isNew = body.isNew;
    if (typeof body.sortOrder === 'number') updateData.sortOrder = body.sortOrder;

    const updated = await prisma.subTask.update({
      where: { id: subTaskId },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error, 'Failed to update sub-task');
  }
}

/**
 * DELETE /api/courses/[courseId]/triage-items/[itemId]/sub-tasks/[subTaskId]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, subTaskId } = await context.params;

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    await prisma.subTask.delete({ where: { id: subTaskId } });
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete sub-task');
  }
}
