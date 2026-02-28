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
 * GET /api/courses/[courseId]/gap
 * Returns gap classification booleans for the course.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;
    await assertCourseAccess(courseId, user.id);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { gapKnowledge: true, gapSkill: true },
    });

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    return Response.json(course);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch gap classification');
  }
}

/**
 * PATCH /api/courses/[courseId]/gap
 * Updates gap classification booleans.
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

    const updateData: { gapKnowledge?: boolean; gapSkill?: boolean } = {};
    if (typeof body.gapKnowledge === 'boolean') updateData.gapKnowledge = body.gapKnowledge;
    if (typeof body.gapSkill === 'boolean') updateData.gapSkill = body.gapSkill;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      select: { gapKnowledge: true, gapSkill: true },
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error, 'Failed to update gap classification');
  }
}
