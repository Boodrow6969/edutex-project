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
 * GET /api/courses/[courseId]/learning-tasks
 * Returns all LearningTasks for the course, ordered by `order`.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;

    await assertCourseAccess(courseId, user.id);

    const tasks = await prisma.learningTask.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { objectives: true } },
      },
    });

    return Response.json(tasks);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch learning tasks');
  }
}

/**
 * POST /api/courses/[courseId]/learning-tasks
 * Creates a new LearningTask. Required: title.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    const body = await request.json();

    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return Response.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // Get max order for auto-increment
    const maxOrder = await prisma.learningTask.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const task = await prisma.learningTask.create({
      data: {
        courseId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        order: nextOrder,
        taskAnalysisId: body.taskAnalysisId || null,
      },
      include: {
        _count: { select: { objectives: true } },
      },
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create learning task');
  }
}
