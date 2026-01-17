import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

/**
 * Helper to get a page and verify user has access through project or curriculum workspace.
 */
async function getPageWithAccess(pageId: string, userId: string, allowedRoles?: WorkspaceRole[]) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      type: true,
      projectId: true,
      curriculumId: true,
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  // Verify workspace membership through page's parent (project or curriculum)
  await assertPageAccess(pageId, userId, allowedRoles);

  return page;
}

/**
 * GET /api/pages/[pageId]/task-analysis
 * Fetch task analysis data for a page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    await getPageWithAccess(pageId, user.id);

    const taskAnalysis = await prisma.taskAnalysis.findUnique({
      where: { pageId },
    });

    // Return empty data if no task analysis exists yet
    if (!taskAnalysis) {
      return Response.json({
        pageId,
        jobTitle: '',
        roleDescription: '',
        tasks: [],
      });
    }

    return Response.json({
      pageId: taskAnalysis.pageId,
      jobTitle: taskAnalysis.jobTitle,
      roleDescription: taskAnalysis.roleDescription,
      tasks: taskAnalysis.tasks,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch task analysis');
  }
}

/**
 * PUT /api/pages/[pageId]/task-analysis
 * Save (upsert) task analysis data for a page.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    // Verify access with appropriate roles
    await getPageWithAccess(pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Upsert the task analysis data
    const taskAnalysis = await prisma.taskAnalysis.upsert({
      where: { pageId },
      create: {
        pageId,
        jobTitle: body.jobTitle ?? '',
        roleDescription: body.roleDescription ?? '',
        tasks: body.tasks ?? [],
      },
      update: {
        jobTitle: body.jobTitle ?? '',
        roleDescription: body.roleDescription ?? '',
        tasks: body.tasks ?? [],
      },
    });

    return Response.json({
      pageId: taskAnalysis.pageId,
      jobTitle: taskAnalysis.jobTitle,
      roleDescription: taskAnalysis.roleDescription,
      tasks: taskAnalysis.tasks,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to save task analysis');
  }
}
