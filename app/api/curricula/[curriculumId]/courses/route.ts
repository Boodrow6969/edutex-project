import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  assertProjectAccess,
  errorResponse,
  NotFoundError,
  AuthorizationError,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType } from '@prisma/client';

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
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            phase: true,
            priority: true,
            clientName: true,
            projectType: true,
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
      id: cc.project.id,
      name: cc.project.name,
      description: cc.project.description,
      status: cc.project.status,
      phase: cc.project.phase,
      priority: cc.project.priority,
      clientName: cc.project.clientName,
      projectType: cc.project.projectType,
      targetGoLive: cc.project.targetGoLive,
      createdAt: cc.project.createdAt,
      updatedAt: cc.project.updatedAt,
      pageCount: cc.project._count.pages,
      objectiveCount: cc.project._count.objectives,
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
 *   projectId: string
 * }
 *
 * Request body for creating:
 * {
 *   create: true,
 *   name: string,
 *   description?: string,
 *   clientName?: string,
 *   projectType?: string,
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
        // Create the project (course)
        const project = await tx.project.create({
          data: {
            name: body.name.trim(),
            description: body.description?.trim() || null,
            clientName: body.clientName?.trim() || null,
            projectType: body.projectType?.trim() || null,
            phase: body.phase || 'intake',
            priority: body.priority || 'medium',
            status: body.status || 'draft',
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
            projectId: project.id,
            createdById: user.id,
          })),
        });

        // Link to curriculum
        const link = await tx.curriculumCourse.create({
          data: {
            curriculumId,
            projectId: project.id,
            order: nextOrder,
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                phase: true,
                priority: true,
                clientName: true,
                projectType: true,
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
          id: result.project.id,
          name: result.project.name,
          description: result.project.description,
          status: result.project.status,
          phase: result.project.phase,
          priority: result.project.priority,
          clientName: result.project.clientName,
          projectType: result.project.projectType,
          targetGoLive: result.project.targetGoLive,
          createdAt: result.project.createdAt,
          updatedAt: result.project.updatedAt,
          created: true,
        },
        { status: 201 }
      );
    } else {
      // Link an existing course
      if (!body.projectId || typeof body.projectId !== 'string') {
        return Response.json(
          { error: 'projectId is required when linking an existing course' },
          { status: 400 }
        );
      }

      // Verify the project exists and user has access to it
      const project = await prisma.project.findUnique({
        where: { id: body.projectId },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          phase: true,
          priority: true,
          clientName: true,
          projectType: true,
          targetGoLive: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Verify user has access to the project's workspace
      if (project.workspaceId) {
        await assertProjectAccess(body.projectId, user.id);
      }

      // Check if already linked
      const existingLink = await prisma.curriculumCourse.findUnique({
        where: {
          curriculumId_projectId: {
            curriculumId,
            projectId: body.projectId,
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
          projectId: body.projectId,
          order: nextOrder,
        },
      });

      return Response.json(
        {
          linkId: link.id,
          order: link.order,
          linkedAt: link.createdAt,
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          phase: project.phase,
          priority: project.priority,
          clientName: project.clientName,
          projectType: project.projectType,
          targetGoLive: project.targetGoLive,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
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
 *   projectId: string
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

    if (!body.projectId || typeof body.projectId !== 'string') {
      return Response.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Check if the link exists
    const link = await prisma.curriculumCourse.findUnique({
      where: {
        curriculumId_projectId: {
          curriculumId,
          projectId: body.projectId,
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
