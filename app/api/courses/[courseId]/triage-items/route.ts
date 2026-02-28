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
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/triage-items
 * Returns all triage items with their sub-tasks.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    await assertCourseAccess(courseId, user.id);

    const items = await prisma.triageItem.findMany({
      where: { courseId },
      include: { subTasks: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });

    return Response.json(items);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch triage items');
  }
}

/**
 * POST /api/courses/[courseId]/triage-items
 * Creates a new triage item.
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

    if (!body.text || typeof body.text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const item = await prisma.triageItem.create({
      data: {
        courseId,
        text: body.text.trim(),
        column: body.column || 'must',
        source: body.source || 'Custom',
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create triage item');
  }
}
