import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

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
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      role: userMembership.role,
      projects,
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

    // Verify user has permission to create projects in this workspace
    // ADMINISTRATOR, MANAGER, and DESIGNER can create projects
    await assertWorkspaceMember(workspaceId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        workspaceId,
      },
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
        workspaceId: project.workspaceId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        pageCount: project._count.pages,
        taskCount: project._count.tasks,
        objectiveCount: project._count.objectives,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create project');
  }
}
