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
 * GET /api/courses/[courseId]/job-aids
 * Returns all job aids for the course, ordered by createdAt asc.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;

    await assertCourseAccess(courseId, user.id);

    const jobAids = await prisma.jobAid.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json({ jobAids });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch job aids');
  }
}

/**
 * POST /api/courses/[courseId]/job-aids
 * Creates a new job aid for the course.
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

    // Validate title
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return Response.json(
        { error: 'title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const created = await prisma.jobAid.create({
      data: {
        courseId,
        title: body.title.trim(),
        type: body.type || 'CHECKLIST',
        description: body.description || null,
        notes: body.notes || null,
        linkedObjectiveId: body.linkedObjectiveId || null,
        linkedTaskId: body.linkedTaskId || null,
        assetIds: Array.isArray(body.assetIds) ? body.assetIds : [],
      },
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create job aid');
  }
}
