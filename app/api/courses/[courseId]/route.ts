import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]
 * Get course details including page count and related statistics.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify user has access to this course's workspace
    const { membership } = await assertCourseAccess(courseId, user.id);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            tasks: true,
            objectives: true,
            deliverables: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return Response.json({
      id: course.id,
      name: course.name,
      description: course.description,
      workspaceId: course.workspaceId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      role: membership.role,
      pages: course.pages,
      taskCount: course._count.tasks,
      objectiveCount: course._count.objectives,
      deliverableCount: course._count.deliverables,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch course');
  }
}

/**
 * PUT /api/courses/[courseId]
 * Update course name and/or description.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 *
 * Request body:
 * {
 *   "name": "string (optional)",
 *   "description": "string (optional)"
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify user has permission to update courses
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const body = await request.json();

    // Build update data
    const updateData: { name?: string; description?: string | null } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return Response.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
            objectives: true,
          },
        },
      },
    });

    return Response.json({
      id: course.id,
      name: course.name,
      description: course.description,
      workspaceId: course.workspaceId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      pageCount: course._count.pages,
      taskCount: course._count.tasks,
      objectiveCount: course._count.objectives,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update course');
  }
}

/**
 * DELETE /api/courses/[courseId]
 * Delete a course and all its pages, tasks, etc.
 * Requires ADMINISTRATOR or MANAGER role.
 *
 * Note: This is a hard delete. The schema uses onDelete: Cascade,
 * so all related records (pages, blocks, tasks, etc.) will be deleted.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Only ADMINISTRATOR and MANAGER can delete courses
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
    ]);

    await prisma.course.delete({
      where: { id: courseId },
    });

    return Response.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return errorResponse(error, 'Failed to delete course');
  }
}
