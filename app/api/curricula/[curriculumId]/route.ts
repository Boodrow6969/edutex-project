import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole, CurriculumStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ curriculumId: string }>;
}

/**
 * GET /api/curricula/[curriculumId]
 * Get single curriculum with details, linked courses, and pages.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access
    await assertCurriculumAccess(curriculumId, user.id);

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { order: 'asc' },
        },
        courses: {
          select: {
            id: true,
            order: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                phase: true,
                clientName: true,
                courseType: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundError('Curriculum not found');
    }

    return Response.json({
      id: curriculum.id,
      name: curriculum.name,
      description: curriculum.description,
      status: curriculum.status,
      programDuration: curriculum.programDuration,
      totalHours: curriculum.totalHours,
      certificationName: curriculum.certificationName,
      audienceProgression: curriculum.audienceProgression,
      workspaceId: curriculum.workspaceId,
      createdAt: curriculum.createdAt,
      updatedAt: curriculum.updatedAt,
      pages: curriculum.pages,
      courses: curriculum.courses.map((cc) => ({
        linkId: cc.id,
        order: cc.order,
        linkedAt: cc.createdAt,
        ...cc.course,
      })),
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch curriculum');
  }
}

/**
 * PUT /api/curricula/[curriculumId]
 * Update curriculum fields.
 *
 * Request body:
 * {
 *   name?: string,
 *   description?: string,
 *   status?: string,
 *   programDuration?: string,
 *   totalHours?: number,
 *   certificationName?: string,
 *   audienceProgression?: string
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access with edit permissions
    await assertCurriculumAccess(curriculumId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const body = await request.json();

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      status?: CurriculumStatus;
      programDuration?: string | null;
      totalHours?: number | null;
      certificationName?: string | null;
      audienceProgression?: string | null;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return Response.json(
          { error: 'name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.status !== undefined) {
      updateData.status = body.status as CurriculumStatus;
    }

    if (body.programDuration !== undefined) {
      updateData.programDuration = body.programDuration?.trim() || null;
    }

    if (body.totalHours !== undefined) {
      updateData.totalHours = body.totalHours ? Number(body.totalHours) : null;
    }

    if (body.certificationName !== undefined) {
      updateData.certificationName = body.certificationName?.trim() || null;
    }

    if (body.audienceProgression !== undefined) {
      updateData.audienceProgression = body.audienceProgression?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: updateData,
      include: {
        _count: {
          select: {
            courses: true,
            pages: true,
          },
        },
      },
    });

    return Response.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      programDuration: updated.programDuration,
      totalHours: updated.totalHours,
      certificationName: updated.certificationName,
      audienceProgression: updated.audienceProgression,
      workspaceId: updated.workspaceId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      courseCount: updated._count.courses,
      pageCount: updated._count.pages,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update curriculum');
  }
}

/**
 * DELETE /api/curricula/[curriculumId]
 * Delete curriculum. Cascades to CurriculumCourse links but keeps the courses.
 * Requires ADMINISTRATOR or MANAGER role.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Only ADMINISTRATOR and MANAGER can delete curricula
    await assertCurriculumAccess(curriculumId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
    ]);

    await prisma.curriculum.delete({
      where: { id: curriculumId },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, 'Failed to delete curriculum');
  }
}
