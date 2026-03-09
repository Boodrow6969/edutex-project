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
  params: Promise<{ courseId: string; jobAidId: string }>;
}

/**
 * Helper to get job aid and verify access.
 */
async function getJobAidWithAccess(
  jobAidId: string,
  userId: string,
  requiredRoles?: WorkspaceRole[]
) {
  const jobAid = await prisma.jobAid.findUnique({
    where: { id: jobAidId },
    include: {
      course: {
        select: { id: true, workspaceId: true },
      },
    },
  });

  if (!jobAid) {
    throw { status: 404, message: 'Job aid not found' };
  }

  await assertCourseAccess(jobAid.courseId, userId, requiredRoles);

  return jobAid;
}

/**
 * GET /api/courses/[courseId]/job-aids/[jobAidId]
 * Returns a single job aid.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { jobAidId } = await context.params;

    const jobAid = await getJobAidWithAccess(jobAidId, user.id);

    const { course: _course, ...jobAidData } = jobAid;
    return Response.json(jobAidData);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch job aid');
  }
}

/**
 * PUT /api/courses/[courseId]/job-aids/[jobAidId]
 * Updates a job aid.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { jobAidId } = await context.params;
    const body = await request.json();

    await getJobAidWithAccess(jobAidId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.linkedObjectiveId !== undefined) updateData.linkedObjectiveId = body.linkedObjectiveId || null;
    if (body.linkedTaskId !== undefined) updateData.linkedTaskId = body.linkedTaskId || null;
    if (body.assetIds !== undefined) updateData.assetIds = body.assetIds;
    if (body.rationale !== undefined) updateData.rationale = body.rationale;

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.jobAid.update({
      where: { id: jobAidId },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error, 'Failed to update job aid');
  }
}

/**
 * DELETE /api/courses/[courseId]/job-aids/[jobAidId]
 * Deletes a job aid.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { jobAidId } = await context.params;

    await getJobAidWithAccess(jobAidId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    await prisma.jobAid.delete({
      where: { id: jobAidId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete job aid');
  }
}
