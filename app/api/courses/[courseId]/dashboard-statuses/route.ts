import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

const VALID_STATUSES = ['Not Started', 'In Progress', 'Complete'];

/**
 * GET /api/courses/[courseId]/dashboard-statuses
 * Returns the current dashboardStatuses JSON (or empty object if null).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    await assertCourseAccess(courseId, user.id);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { dashboardStatuses: true },
    });

    return Response.json(course?.dashboardStatuses || {});
  } catch (error) {
    return errorResponse(error, 'Failed to load dashboard statuses');
  }
}

/**
 * PUT /api/courses/[courseId]/dashboard-statuses
 * Saves card status overrides as JSON.
 * Body: { "needsAnalysis": "Complete", "stakeholders": "In Progress", ... }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    await assertCourseAccess(courseId, user.id);

    const body = await request.json();

    // Validate: must be a plain object with string values from allowed set
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json(
        { error: 'Body must be a plain object' },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== 'string' || !VALID_STATUSES.includes(value as string)) {
        return Response.json(
          { error: `Invalid status value for "${key}". Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { dashboardStatuses: body },
      select: { dashboardStatuses: true },
    });

    return Response.json(course.dashboardStatuses);
  } catch (error) {
    return errorResponse(error, 'Failed to save dashboard statuses');
  }
}
