import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

/**
 * GET /api/workspaces
 * Lists all workspaces the current user is a member of, including their projects.
 */
export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform to include the user's role at the top level
    const result = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: workspace.members[0]?.role ?? null,
      projects: workspace.projects,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch workspaces');
  }
}

/**
 * POST /api/workspaces
 * Creates a new workspace and adds the current user as ADMINISTRATOR.
 *
 * Request body:
 * {
 *   "name": "string (required)",
 *   "description": "string (optional)"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return Response.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const description = body.description?.trim() || null;

    // Create workspace with the creator as ADMINISTRATOR
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: user.id,
            role: WorkspaceRole.ADMINISTRATOR,
          },
        },
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return Response.json(
      {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        role: workspace.members[0]?.role ?? WorkspaceRole.ADMINISTRATOR,
        projects: workspace.projects,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create workspace');
  }
}
