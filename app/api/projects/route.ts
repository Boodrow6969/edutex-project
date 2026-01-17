import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType } from '@prisma/client';

/**
 * GET /api/projects?workspaceId=123
 * Fetches all projects for a workspace.
 * Requires membership in the workspace (any role).
 *
 * Query parameters:
 * - workspaceId: string (required)
 *
 * Response:
 * {
 *   "role": "ADMINISTRATOR",
 *   "projects": [...]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();

    // Read workspaceId from query string
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');

    // Validate required fields
    if (!workspaceId || typeof workspaceId !== 'string') {
      return Response.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace (any role is acceptable)
    const userMembership = await assertWorkspaceMember(workspaceId, user.id);

    // Fetch all projects for this workspace, ordered by createdAt desc
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        clientName: true,
        projectType: true,
        phase: true,
        priority: true,
        status: true,
        targetGoLive: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
        curricula: {
          select: {
            curriculum: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to flatten curricula
    const projectsWithCurricula = projects.map((project) => ({
      ...project,
      curricula: project.curricula.map((cc) => cc.curriculum),
    }));

    return Response.json({
      role: userMembership.role,
      projects: projectsWithCurricula,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch projects');
  }
}

/**
 * POST /api/projects
 * Creates a new project inside a workspace.
 * Requires membership in the workspace (ADMINISTRATOR, MANAGER, or DESIGNER).
 *
 * Request body:
 * {
 *   "workspaceId": "string (required)",
 *   "name": "string (required)",
 *   "description": "string (optional)"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();

    const body = await request.json();

    // Validate required fields
    if (!body.workspaceId || typeof body.workspaceId !== 'string') {
      return Response.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return Response.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const workspaceId = body.workspaceId;
    const name = body.name.trim();
    const description = body.description?.trim() || null;
    const clientName = body.clientName?.trim() || null;
    const projectType = body.projectType?.trim() || null;
    const phase = body.phase?.trim() || 'intake';
    const priority = body.priority?.trim() || 'medium';
    const targetGoLive = body.targetGoLive ? new Date(body.targetGoLive) : null;

    // Verify user has permission to create projects in this workspace
    // ADMINISTRATOR, MANAGER, and DESIGNER can create projects
    await assertWorkspaceMember(workspaceId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Create the project with default pages in a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name,
          description,
          clientName,
          projectType,
          phase,
          priority,
          targetGoLive,
          workspaceId,
        },
      });

      // Define default pages to create
      const defaultPages: { title: string; type: PageType; order: number }[] = [
        { title: 'Needs Analysis', type: PageType.NEEDS_ANALYSIS, order: 0 },
        { title: 'Task Analysis', type: PageType.TASK_ANALYSIS, order: 1 },
        { title: 'Learning Objectives', type: PageType.LEARNING_OBJECTIVES, order: 2 },
        { title: 'Storyboard', type: PageType.STORYBOARD, order: 3 },
        { title: 'Assessment Plan', type: PageType.ASSESSMENT_PLAN, order: 4 },
      ];

      // Create default pages
      for (const page of defaultPages) {
        const createdPage = await tx.page.create({
          data: {
            title: page.title,
            type: page.type,
            projectId: newProject.id,
            createdById: user.id,
            order: page.order,
          },
        });

        // If it's a needs analysis page, create the associated NeedsAnalysis record
        if (page.type === PageType.NEEDS_ANALYSIS) {
          await tx.needsAnalysis.create({
            data: {
              pageId: createdPage.id,
            },
          });
        }
      }

      return newProject;
    });

    // Fetch the project with counts
    const projectWithCounts = await prisma.project.findUnique({
      where: { id: project.id },
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

    return Response.json(
      {
        id: project.id,
        name: project.name,
        description: project.description,
        clientName: project.clientName,
        projectType: project.projectType,
        phase: project.phase,
        priority: project.priority,
        status: project.status,
        targetGoLive: project.targetGoLive,
        workspaceId: project.workspaceId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        pageCount: projectWithCounts?._count.pages ?? 0,
        taskCount: projectWithCounts?._count.tasks ?? 0,
        objectiveCount: projectWithCounts?._count.objectives ?? 0,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create project');
  }
}
