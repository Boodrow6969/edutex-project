import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

/**
 * PATCH /api/courses/[courseId]/learning-tasks/reorder
 * Bulk reorder LearningTasks.
 * Body: { items: Array<{ id: string; order: number }> }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    if (!body.items || !Array.isArray(body.items)) {
      return Response.json(
        { error: 'items array is required' },
        { status: 400 }
      );
    }

    // Update all orders in a transaction
    await prisma.$transaction(
      body.items.map((item: { id: string; order: number }) =>
        prisma.learningTask.updateMany({
          where: { id: item.id, courseId },
          data: { order: item.order },
        })
      )
    );

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to reorder learning tasks');
  }
}
