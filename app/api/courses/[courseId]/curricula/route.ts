import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  assertWorkspaceMember,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/curricula
 * List curricula this course belongs to.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify access to the course
    await assertCourseAccess(courseId, user.id);

    const curriculumLinks = await prisma.curriculumCourse.findMany({
      where: { courseId },
      select: {
        id: true,
        order: true,
        createdAt: true,
        curriculum: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            programDuration: true,
            certificationName: true,
            workspaceId: true,
            _count: {
              select: {
                courses: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = curriculumLinks.map((link) => ({
      linkId: link.id,
      orderInCurriculum: link.order,
      linkedAt: link.createdAt,
      id: link.curriculum.id,
      name: link.curriculum.name,
      description: link.curriculum.description,
      status: link.curriculum.status,
      programDuration: link.curriculum.programDuration,
      certificationName: link.curriculum.certificationName,
      workspaceId: link.curriculum.workspaceId,
      courseCount: link.curriculum._count.courses,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch course curricula');
  }
}

/**
 * PUT /api/courses/[courseId]/curricula
 * Update which curricula this course belongs to.
 * Handles adding and removing links.
 *
 * Request body:
 * {
 *   curriculumIds: string[]  // The complete list of curriculum IDs this course should belong to
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify access to the course with edit permissions
    const { workspaceId } = await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const body = await request.json();

    // Validate curriculumIds
    if (!Array.isArray(body.curriculumIds)) {
      return Response.json(
        { error: 'curriculumIds must be an array' },
        { status: 400 }
      );
    }

    const desiredCurriculumIds: string[] = body.curriculumIds;

    // Validate each ID
    for (const id of desiredCurriculumIds) {
      if (typeof id !== 'string' || id.trim() === '') {
        return Response.json(
          { error: 'Each curriculum ID must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Verify all curricula exist and user has access
    if (desiredCurriculumIds.length > 0) {
      const curricula = await prisma.curriculum.findMany({
        where: { id: { in: desiredCurriculumIds } },
        select: { id: true, workspaceId: true },
      });

      const foundIds = new Set(curricula.map((c) => c.id));
      const notFoundIds = desiredCurriculumIds.filter((id) => !foundIds.has(id));

      if (notFoundIds.length > 0) {
        return Response.json(
          { error: `Some curricula were not found: ${notFoundIds.join(', ')}` },
          { status: 400 }
        );
      }

      // Verify user has access to all target curricula's workspaces
      for (const curriculum of curricula) {
        await assertWorkspaceMember(curriculum.workspaceId, user.id, [
          WorkspaceRole.ADMINISTRATOR,
          WorkspaceRole.MANAGER,
          WorkspaceRole.DESIGNER,
        ]);
      }
    }

    // Get current links
    const currentLinks = await prisma.curriculumCourse.findMany({
      where: { courseId },
      select: { curriculumId: true },
    });

    const currentCurriculumIds = new Set(currentLinks.map((l) => l.curriculumId));
    const desiredCurriculumIdSet = new Set(desiredCurriculumIds);

    // Calculate additions and removals
    const toAdd = desiredCurriculumIds.filter((id) => !currentCurriculumIds.has(id));
    const toRemove = [...currentCurriculumIds].filter((id) => !desiredCurriculumIdSet.has(id));

    // Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove old links
      if (toRemove.length > 0) {
        await tx.curriculumCourse.deleteMany({
          where: {
            courseId,
            curriculumId: { in: toRemove },
          },
        });
      }

      // Add new links
      for (const curriculumId of toAdd) {
        // Get the next order for this curriculum
        const maxOrder = await tx.curriculumCourse.findFirst({
          where: { curriculumId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });

        await tx.curriculumCourse.create({
          data: {
            curriculumId,
            courseId,
            order: (maxOrder?.order ?? -1) + 1,
          },
        });
      }
    });

    // Fetch and return updated list
    const updatedLinks = await prisma.curriculumCourse.findMany({
      where: { courseId },
      select: {
        id: true,
        order: true,
        createdAt: true,
        curriculum: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            programDuration: true,
            certificationName: true,
            workspaceId: true,
            _count: {
              select: {
                courses: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = updatedLinks.map((link) => ({
      linkId: link.id,
      orderInCurriculum: link.order,
      linkedAt: link.createdAt,
      id: link.curriculum.id,
      name: link.curriculum.name,
      description: link.curriculum.description,
      status: link.curriculum.status,
      programDuration: link.curriculum.programDuration,
      certificationName: link.curriculum.certificationName,
      workspaceId: link.curriculum.workspaceId,
      courseCount: link.curriculum._count.courses,
    }));

    return Response.json({
      curricula: result,
      added: toAdd.length,
      removed: toRemove.length,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update course curricula');
  }
}
