import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertPageAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';
import { defaultCourseAnalysisFormData } from '@/lib/types/courseAnalysis';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

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

  await assertPageAccess(pageId, userId, allowedRoles);

  return page;
}

/**
 * GET /api/pages/[pageId]/course-analysis
 * Fetch course analysis data for a page, including audiences and tasks.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    await getPageWithAccess(pageId, user.id);

    const courseAnalysis = await prisma.courseAnalysis.findUnique({
      where: { pageId },
      include: {
        audiences: { orderBy: { order: 'asc' } },
        tasks: { orderBy: { order: 'asc' } },
      },
    });

    if (!courseAnalysis) {
      return Response.json({ pageId, ...defaultCourseAnalysisFormData });
    }

    return Response.json(courseAnalysis);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch course analysis');
  }
}

/**
 * PUT /api/pages/[pageId]/course-analysis
 * Save (upsert) course analysis data for a page.
 * Handles nested audiences and tasks sync in a transaction.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { pageId } = await params;

    await getPageWithAccess(pageId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    const flatData = {
      problemSummary: body.problemSummary ?? '',
      currentStateSummary: body.currentStateSummary ?? '',
      desiredStateSummary: body.desiredStateSummary ?? '',
      constraints: body.constraints ?? [],
      assumptions: body.assumptions ?? [],
      learnerPersonas: body.learnerPersonas ?? [],
      stakeholders: body.stakeholders ?? [],
      smes: body.smes ?? [],
      isTrainingSolution: body.isTrainingSolution ?? null,
      nonTrainingFactors: body.nonTrainingFactors ?? '',
      solutionRationale: body.solutionRationale ?? '',
      deliveryNotes: body.deliveryNotes ?? '',
      existingMaterials: body.existingMaterials ?? '',
      level1Reaction: body.level1Reaction ?? '',
      level2Learning: body.level2Learning ?? '',
      level3Behavior: body.level3Behavior ?? '',
      level4Results: body.level4Results ?? '',
    };

    const incomingAudiences: Array<{
      id?: string;
      role: string;
      headcount?: string;
      frequency?: string;
      techComfort?: string;
      trainingFormat?: string;
      notes?: string;
      order?: number;
    }> = body.audiences ?? [];

    const incomingTasks: Array<{
      id?: string;
      task: string;
      audience?: string;
      source?: string;
      complexity?: string;
      intervention?: string;
      priority?: string;
      notes?: string;
      order?: number;
    }> = body.tasks ?? [];

    const result = await prisma.$transaction(async (tx) => {
      // Upsert flat fields
      const ca = await tx.courseAnalysis.upsert({
        where: { pageId },
        create: { pageId, ...flatData },
        update: flatData,
      });

      // Sync audiences: delete removed, update existing, create new
      const existingAudienceIds = incomingAudiences
        .filter((a) => a.id)
        .map((a) => a.id as string);

      await tx.audienceProfile.deleteMany({
        where: {
          courseAnalysisId: ca.id,
          id: { notIn: existingAudienceIds },
        },
      });

      for (const audience of incomingAudiences) {
        const audienceData = {
          role: audience.role,
          headcount: audience.headcount ?? '',
          frequency: audience.frequency ?? 'Daily',
          techComfort: audience.techComfort ?? 'Moderate',
          trainingFormat: audience.trainingFormat ?? '',
          notes: audience.notes ?? '',
          order: audience.order ?? 0,
        };

        if (audience.id) {
          await tx.audienceProfile.update({
            where: { id: audience.id },
            data: audienceData,
          });
        } else {
          await tx.audienceProfile.create({
            data: { ...audienceData, courseAnalysisId: ca.id },
          });
        }
      }

      // Sync tasks: same pattern
      const existingTaskIds = incomingTasks
        .filter((t) => t.id)
        .map((t) => t.id as string);

      await tx.analysisTask.deleteMany({
        where: {
          courseAnalysisId: ca.id,
          id: { notIn: existingTaskIds },
        },
      });

      for (const task of incomingTasks) {
        const taskData = {
          task: task.task,
          audience: task.audience ?? '',
          source: task.source ?? 'ID-added',
          complexity: task.complexity ?? 'Medium',
          intervention: task.intervention ?? 'training',
          priority: task.priority ?? 'Medium',
          notes: task.notes ?? '',
          order: task.order ?? 0,
        };

        if (task.id) {
          await tx.analysisTask.update({
            where: { id: task.id },
            data: taskData,
          });
        } else {
          await tx.analysisTask.create({
            data: { ...taskData, courseAnalysisId: ca.id },
          });
        }
      }

      // Return full record with relations
      return tx.courseAnalysis.findUnique({
        where: { id: ca.id },
        include: {
          audiences: { orderBy: { order: 'asc' } },
          tasks: { orderBy: { order: 'asc' } },
        },
      });
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to save course analysis');
  }
}
