import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';
import { z } from 'zod';

const needsAnalysisSchema = z.object({
  problemStatement: z.string().max(5000).optional(),
  businessNeed: z.string().max(5000).optional(),
  department: z.string().max(500).optional(),
  currentState: z.string().max(5000).optional(),
  desiredState: z.string().max(5000).optional(),
  constraints: z.array(z.string().max(1000)).optional(),
  assumptions: z.array(z.string().max(1000)).optional(),
  learnerPersonas: z.array(z.string().max(1000)).optional(),
  stakeholders: z.array(z.string().max(1000)).optional(),
  smes: z.array(z.string().max(1000)).optional(),
  level1Reaction: z.string().max(2000).optional(),
  level2Learning: z.string().max(2000).optional(),
  level3Behavior: z.string().max(2000).optional(),
  level4Results: z.string().max(2000).optional(),
});

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
    const result = needsAnalysisSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      );
    }
    const {
      problemStatement,
      businessNeed,
      department,
      constraints,
      assumptions,
      learnerPersonas,
      stakeholders,
      smes,
      currentState,
      desiredState,
      level1Reaction,
      level2Learning,
      level3Behavior,
      level4Results,
    } = result.data;

    // Upsert the needs analysis data
    const needsAnalysis = await prisma.needsAnalysis.upsert({
      where: { pageId },
      create: {
        pageId,
        problemStatement,
        businessNeed,
        department,
        constraints,
        assumptions,
        learnerPersonas,
        stakeholders,
        smes,
        currentState,
        desiredState,
        level1Reaction,
        level2Learning,
        level3Behavior,
        level4Results,
      },
      update: {
        problemStatement,
        businessNeed,
        department,
        constraints,
        assumptions,
        learnerPersonas,
        stakeholders,
        smes,
        currentState,
        desiredState,
        level1Reaction,
        level2Learning,
        level3Behavior,
        level4Results,
      },
    });

    return Response.json(needsAnalysis);
  } catch (error) {
    return errorResponse(error, 'Failed to save needs analysis');
  }
}
