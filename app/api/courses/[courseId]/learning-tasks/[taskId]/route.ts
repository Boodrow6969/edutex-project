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
  params: Promise<{ courseId: string; taskId: string }>;
}

/**
 * PATCH /api/courses/[courseId]/learning-tasks/[taskId]
 * Partial update of a LearningTask.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, taskId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify task belongs to course
    const existing = await prisma.learningTask.findFirst({
      where: { id: taskId, courseId },
    });

    if (!existing) {
      return Response.json(
        { error: 'Learning task not found' },
        { status: 404 }
      );
    }

    // Build partial update data — only include fields that were sent
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'description', 'frequency', 'criticality', 'complexity',
      'knowledgeType', 'isStandardized', 'variationNotes', 'isFeasibleToTrain',
      'feasibilityNotes', 'gapType', 'intervention', 'interventionNotes',
      'impactNote', 'order', 'rationale',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Trim string fields
    for (const key of Object.keys(updateData)) {
      if (typeof updateData[key] === 'string') {
        updateData[key] = (updateData[key] as string).trim() || null;
      }
    }

    // Title cannot be empty
    if ('title' in updateData && !updateData.title) {
      return Response.json(
        { error: 'title cannot be empty' },
        { status: 400 }
      );
    }

    const task = await prisma.learningTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        _count: { select: { objectives: true } },
      },
    });

    return Response.json(task);
  } catch (error) {
    return errorResponse(error, 'Failed to update learning task');
  }
}

/**
 * DELETE /api/courses/[courseId]/learning-tasks/[taskId]
 * Deletes a LearningTask. Cascade handles ObjectiveTaskLink cleanup.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, taskId } = await context.params;

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify task belongs to course
    const existing = await prisma.learningTask.findFirst({
      where: { id: taskId, courseId },
    });

    if (!existing) {
      return Response.json(
        { error: 'Learning task not found' },
        { status: 404 }
      );
    }

    await prisma.learningTask.delete({
      where: { id: taskId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete learning task');
  }
}
