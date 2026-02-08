import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ curriculumId: string }>;
}

/**
 * PUT /api/curricula/[curriculumId]/courses/reorder
 * Update course order within curriculum.
 *
 * Request body:
 * {
 *   orderedCourseIds: string[]  // Course IDs in the desired order
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

    // Validate orderedCourseIds
    if (!Array.isArray(body.orderedCourseIds)) {
      return Response.json(
        { error: 'orderedCourseIds must be an array of course IDs' },
        { status: 400 }
      );
    }

    const orderedCourseIds: string[] = body.orderedCourseIds;

    // Validate each ID is a string
    for (const id of orderedCourseIds) {
      if (typeof id !== 'string' || id.trim() === '') {
        return Response.json(
          { error: 'Each course ID must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Verify all courses are actually linked to this curriculum
    const existingLinks = await prisma.curriculumCourse.findMany({
      where: { curriculumId },
      select: { courseId: true },
    });

    const linkedCourseIds = new Set(existingLinks.map((l) => l.courseId));
    const invalidIds = orderedCourseIds.filter((id) => !linkedCourseIds.has(id));

    if (invalidIds.length > 0) {
      return Response.json(
        { error: `Some courses are not linked to this curriculum: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Update order for each link in a transaction
    await prisma.$transaction(
      orderedCourseIds.map((courseId, index) =>
        prisma.curriculumCourse.update({
          where: {
            curriculumId_courseId: {
              curriculumId,
              courseId,
            },
          },
          data: { order: index },
        })
      )
    );

    // Fetch and return the updated list
    const updatedCourses = await prisma.curriculumCourse.findMany({
      where: { curriculumId },
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
            priority: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const result = updatedCourses.map((cc) => ({
      linkId: cc.id,
      order: cc.order,
      linkedAt: cc.createdAt,
      id: cc.course.id,
      name: cc.course.name,
      description: cc.course.description,
      status: cc.course.status,
      phase: cc.course.phase,
      priority: cc.course.priority,
    }));

    return Response.json({ courses: result });
  } catch (error) {
    return errorResponse(error, 'Failed to reorder courses');
  }
}
