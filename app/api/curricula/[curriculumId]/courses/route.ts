import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  assertCourseAccess,
  errorResponse,
  NotFoundError,
  AuthorizationError,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType, CourseStatus, CoursePhase, CourseType, Priority } from '@prisma/client';

interface RouteParams {
  params: Promise<{ curriculumId: string }>;
}

/**
 * GET /api/curricula/[curriculumId]/courses
 * List courses linked to this curriculum with order.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access
    await assertCurriculumAccess(curriculumId, user.id);

    const curriculumCourses = await prisma.curriculumCourse.findMany({
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
            clientName: true,
            courseType: true,
            targetGoLive: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                pages: true,
                objectives: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const result = curriculumCourses.map((cc) => ({
      linkId: cc.id,
      order: cc.order,
      linkedAt: cc.createdAt,
      id: cc.course.id,
      name: cc.course.name,
      description: cc.course.description,
      status: cc.course.status,
      phase: cc.course.phase,
      priority: cc.course.priority,
      clientName: cc.course.clientName,
      courseType: cc.course.courseType,
      targetGoLive: cc.course.targetGoLive,
      createdAt: cc.course.createdAt,
      updatedAt: cc.course.updatedAt,
      pageCount: cc.course._count.pages,
      objectiveCount: cc.course._count.objectives,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch curriculum courses');
  }
}

/**
 * POST /api/curricula/[curriculumId]/courses
 * Link an existing course OR create a new course and link it.
 *
 * Request body for linking:
 * {
 *   courseId: string
 * }
 *
 * Request body for creating:
 * {
 *   create: true,
 *   name: string,
 *   description?: string,
 *   clientName?: string,
 *   courseType?: string,
 *   phase?: string,
 *   priority?: string,
 *   status?: string,
 *   targetGoLive?: string (ISO date)
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access with edit permissions
    const { workspaceId } = await assertCurriculumAccess(curriculumId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    const body = await request.json();

    // Get the highest order value for existing links
    const maxOrderLink = await prisma.curriculumCourse.findFirst({
      where: { curriculumId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (maxOrderLink?.order ?? -1) + 1;

    if (body.create === true) {
      // Create a new course and link it
      if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
        return Response.json(
          { error: 'name is required when creating a new course' },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        // Create the course
        const course = await tx.course.create({
          data: {
            name: body.name.trim(),
            description: body.description?.trim() || null,
            clientName: body.clientName?.trim() || null,
            courseType: (body.courseType?.trim() || null) as CourseType | null,
            phase: (body.phase || CoursePhase.INTAKE) as CoursePhase,
            priority: (body.priority || Priority.MEDIUM) as Priority,
            status: (body.status || CourseStatus.DRAFT) as CourseStatus,
            targetGoLive: body.targetGoLive ? new Date(body.targetGoLive) : null,
            workspaceId,
          },
        });

        // Create default course pages
        const defaultPages: { title: string; type: PageType; order: number }[] = [
          { title: 'Needs Analysis', type: 'NEEDS_ANALYSIS', order: 0 },
          { title: 'Task Analysis', type: 'TASK_ANALYSIS', order: 1 },
          { title: 'Learning Objectives', type: 'LEARNING_OBJECTIVES', order: 2 },
          { title: 'Storyboard', type: 'STORYBOARD', order: 3 },
          { title: 'Assessment Plan', type: 'ASSESSMENT_PLAN', order: 4 },
        ];

        await tx.page.createMany({
          data: defaultPages.map((page) => ({
            title: page.title,
            type: page.type,
            order: page.order,
            courseId: course.id,
            createdById: user.id,
          })),
        });

        // Link to curriculum
        const link = await tx.curriculumCourse.create({
          data: {
            curriculumId,
            courseId: course.id,
            order: nextOrder,
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                phase: true,
                priority: true,
                clientName: true,
                courseType: true,
                targetGoLive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });

        return link;
      });

      return Response.json(
        {
          linkId: result.id,
          order: result.order,
          linkedAt: result.createdAt,
          id: result.course.id,
          name: result.course.name,
          description: result.course.description,
          status: result.course.status,
          phase: result.course.phase,
          priority: result.course.priority,
          clientName: result.course.clientName,
          courseType: result.course.courseType,
          targetGoLive: result.course.targetGoLive,
          createdAt: result.course.createdAt,
          updatedAt: result.course.updatedAt,
          created: true,
        },
        { status: 201 }
      );
    } else {
      // Link an existing course
      if (!body.courseId || typeof body.courseId !== 'string') {
        return Response.json(
          { error: 'courseId is required when linking an existing course' },
          { status: 400 }
        );
      }

      // Verify the course exists and user has access to it
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          phase: true,
          priority: true,
          clientName: true,
          courseType: true,
          targetGoLive: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Verify user has access to the course's workspace
      if (course.workspaceId) {
        await assertCourseAccess(body.courseId, user.id);
      }

      // Check if already linked
      const existingLink = await prisma.curriculumCourse.findUnique({
        where: {
          curriculumId_courseId: {
            curriculumId,
            courseId: body.courseId,
          },
        },
      });

      if (existingLink) {
        return Response.json(
          { error: 'This course is already linked to this curriculum' },
          { status: 400 }
        );
      }

      // Create the link
      const link = await prisma.curriculumCourse.create({
        data: {
          curriculumId,
          courseId: body.courseId,
          order: nextOrder,
        },
      });

      return Response.json(
        {
          linkId: link.id,
          order: link.order,
          linkedAt: link.createdAt,
          id: course.id,
          name: course.name,
          description: course.description,
          status: course.status,
          phase: course.phase,
          priority: course.priority,
          clientName: course.clientName,
          courseType: course.courseType,
          targetGoLive: course.targetGoLive,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          created: false,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return errorResponse(error, 'Failed to add course to curriculum');
  }
}

/**
 * DELETE /api/curricula/[curriculumId]/courses
 * Unlink a course from the curriculum (doesn't delete the course).
 *
 * Request body:
 * {
 *   courseId: string
 * }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    if (!body.courseId || typeof body.courseId !== 'string') {
      return Response.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    // Check if the link exists
    const link = await prisma.curriculumCourse.findUnique({
      where: {
        curriculumId_courseId: {
          curriculumId,
          courseId: body.courseId,
        },
      },
    });

    if (!link) {
      throw new NotFoundError('Course is not linked to this curriculum');
    }

    // Delete the link
    await prisma.curriculumCourse.delete({
      where: { id: link.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, 'Failed to unlink course from curriculum');
  }
}
