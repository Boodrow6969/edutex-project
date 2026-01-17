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
 *   orderedProjectIds: string[]  // Project IDs in the desired order
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

    // Validate orderedProjectIds
    if (!Array.isArray(body.orderedProjectIds)) {
      return Response.json(
        { error: 'orderedProjectIds must be an array of project IDs' },
        { status: 400 }
      );
    }

    const orderedProjectIds: string[] = body.orderedProjectIds;

    // Validate each ID is a string
    for (const id of orderedProjectIds) {
      if (typeof id !== 'string' || id.trim() === '') {
        return Response.json(
          { error: 'Each project ID must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Verify all projects are actually linked to this curriculum
    const existingLinks = await prisma.curriculumCourse.findMany({
      where: { curriculumId },
      select: { projectId: true },
    });

    const linkedProjectIds = new Set(existingLinks.map((l) => l.projectId));
    const invalidIds = orderedProjectIds.filter((id) => !linkedProjectIds.has(id));

    if (invalidIds.length > 0) {
      return Response.json(
        { error: `Some projects are not linked to this curriculum: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Update order for each link in a transaction
    await prisma.$transaction(
      orderedProjectIds.map((projectId, index) =>
        prisma.curriculumCourse.update({
          where: {
            curriculumId_projectId: {
              curriculumId,
              projectId,
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
        project: {
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
      id: cc.project.id,
      name: cc.project.name,
      description: cc.project.description,
      status: cc.project.status,
      phase: cc.project.phase,
      priority: cc.project.priority,
    }));

    return Response.json({ courses: result });
  } catch (error) {
    return errorResponse(error, 'Failed to reorder courses');
  }
}
