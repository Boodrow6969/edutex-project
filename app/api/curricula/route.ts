import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType, CurriculumStatus } from '@prisma/client';

/**
 * GET /api/curricula?workspaceId=xxx
 * List all curricula for a workspace.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return Response.json(
        { error: 'workspaceId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    await assertWorkspaceMember(workspaceId, user.id);

    const curricula = await prisma.curriculum.findMany({
      where: { workspaceId, archivedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        programDuration: true,
        totalHours: true,
        certificationName: true,
        audienceProgression: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true,
            pages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = curricula.map((curriculum) => ({
      id: curriculum.id,
      name: curriculum.name,
      description: curriculum.description,
      status: curriculum.status,
      programDuration: curriculum.programDuration,
      totalHours: curriculum.totalHours,
      certificationName: curriculum.certificationName,
      audienceProgression: curriculum.audienceProgression,
      createdAt: curriculum.createdAt,
      updatedAt: curriculum.updatedAt,
      courseCount: curriculum._count.courses,
      pageCount: curriculum._count.pages,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch curricula');
  }
}

/**
 * POST /api/curricula
 * Create a new curriculum with default program pages.
 *
 * Request body:
 * {
 *   workspaceId: string (required),
 *   name: string (required),
 *   description?: string,
 *   status?: string,
 *   programDuration?: string,
 *   totalHours?: number,
 *   certificationName?: string,
 *   audienceProgression?: string
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
        { error: 'name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Verify user has permission to create curricula
    await assertWorkspaceMember(body.workspaceId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Create curriculum with default program pages in a transaction
    const curriculum = await prisma.$transaction(async (tx) => {
      // Create the curriculum
      const newCurriculum = await tx.curriculum.create({
        data: {
          workspaceId: body.workspaceId,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          status: (body.status || CurriculumStatus.DRAFT) as CurriculumStatus,
          programDuration: body.programDuration?.trim() || null,
          totalHours: body.totalHours ? Number(body.totalHours) : null,
          certificationName: body.certificationName?.trim() || null,
          audienceProgression: body.audienceProgression?.trim() || null,
        },
      });

      // Create default program pages
      const defaultPages: { title: string; type: PageType; order: number }[] = [
        { title: 'Program Needs Analysis', type: 'PROGRAM_NEEDS_ANALYSIS', order: 0 },
        { title: 'Program Map', type: 'PROGRAM_MAP', order: 1 },
        { title: 'Program Assessment Strategy', type: 'PROGRAM_ASSESSMENT_STRATEGY', order: 2 },
        { title: 'Program Evaluation', type: 'PROGRAM_EVALUATION', order: 3 },
      ];

      await tx.page.createMany({
        data: defaultPages.map((page) => ({
          title: page.title,
          type: page.type,
          order: page.order,
          curriculumId: newCurriculum.id,
          createdById: user.id,
        })),
      });

      // Fetch the curriculum with pages
      return tx.curriculum.findUnique({
        where: { id: newCurriculum.id },
        include: {
          pages: {
            select: {
              id: true,
              title: true,
              type: true,
              order: true,
              createdAt: true,
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              courses: true,
            },
          },
        },
      });
    });

    return Response.json(
      {
        id: curriculum!.id,
        name: curriculum!.name,
        description: curriculum!.description,
        status: curriculum!.status,
        programDuration: curriculum!.programDuration,
        totalHours: curriculum!.totalHours,
        certificationName: curriculum!.certificationName,
        audienceProgression: curriculum!.audienceProgression,
        workspaceId: curriculum!.workspaceId,
        createdAt: curriculum!.createdAt,
        updatedAt: curriculum!.updatedAt,
        courseCount: curriculum!._count.courses,
        pages: curriculum!.pages,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create curriculum');
  }
}
