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
 * Helper to get a page and verify user has access through course or curriculum workspace.
 */
async function getPageWithAccess(pageId: string, userId: string, allowedRoles?: WorkspaceRole[]) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      type: true,
      courseId: true,
      curriculumId: true,
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  // Verify workspace membership through page's parent (course or curriculum)
  await assertPageAccess(pageId, userId, allowedRoles);

  return page;
}

/**
 * GET /api/pages/[pageId]/needs-analysis
 * Fetch needs analysis data for a page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    await getPageWithAccess(pageId, user.id);

    const needsAnalysis = await prisma.needsAnalysis.findUnique({
      where: { pageId },
    });

    // Return empty data if no needs analysis exists yet
    if (!needsAnalysis) {
      return Response.json({
        pageId,
        problemStatement: '',
        businessNeed: '',
        department: '',
        constraints: [],
        assumptions: [],
        learnerPersonas: [],
        stakeholders: [],
        smes: [],
        currentState: '',
        desiredState: '',
        level1Reaction: '',
        level2Learning: '',
        level3Behavior: '',
        level4Results: '',
      });
    }

    return Response.json(needsAnalysis);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch needs analysis');
  }
}

/**
 * PUT /api/pages/[pageId]/needs-analysis
 * Save (upsert) needs analysis data for a page.
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

    // Upsert the needs analysis data
    const needsAnalysis = await prisma.needsAnalysis.upsert({
      where: { pageId },
      create: {
        pageId,
        problemStatement: body.problemStatement ?? '',
        businessNeed: body.businessNeed ?? '',
        department: body.department ?? '',
        constraints: body.constraints ?? [],
        assumptions: body.assumptions ?? [],
        learnerPersonas: body.learnerPersonas ?? [],
        stakeholders: body.stakeholders ?? [],
        smes: body.smes ?? [],
        currentState: body.currentState ?? '',
        desiredState: body.desiredState ?? '',
        level1Reaction: body.level1Reaction ?? '',
        level2Learning: body.level2Learning ?? '',
        level3Behavior: body.level3Behavior ?? '',
        level4Results: body.level4Results ?? '',
      },
      update: {
        problemStatement: body.problemStatement ?? '',
        businessNeed: body.businessNeed ?? '',
        department: body.department ?? '',
        constraints: body.constraints ?? [],
        assumptions: body.assumptions ?? [],
        learnerPersonas: body.learnerPersonas ?? [],
        stakeholders: body.stakeholders ?? [],
        smes: body.smes ?? [],
        currentState: body.currentState ?? '',
        desiredState: body.desiredState ?? '',
        level1Reaction: body.level1Reaction ?? '',
        level2Learning: body.level2Learning ?? '',
        level3Behavior: body.level3Behavior ?? '',
        level4Results: body.level4Results ?? '',
      },
    });

    return Response.json(needsAnalysis);
  } catch (error) {
    return errorResponse(error, 'Failed to save needs analysis');
  }
}
