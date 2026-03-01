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
import { z } from 'zod';

const audienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().max(500),
  headcount: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  techComfort: z.string().max(100).optional(),
  trainingFormat: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

const taskSchema = z.object({
  id: z.string().optional(),
  task: z.string().max(1000),
  audience: z.string().max(500).optional(),
  source: z.string().max(200).optional(),
  complexity: z.string().max(100).optional(),
  intervention: z.string().max(200).optional(),
  priority: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

const courseAnalysisSchema = z.object({
  problemSummary: z.string().max(5000).optional(),
  currentStateSummary: z.string().max(5000).optional(),
  desiredStateSummary: z.string().max(5000).optional(),
  constraints: z.array(z.string().max(1000)).optional(),
  assumptions: z.array(z.string().max(1000)).optional(),
  learnerPersonas: z.array(z.string().max(1000)).optional(),
  stakeholders: z.array(z.string().max(1000)).optional(),
  smes: z.array(z.string().max(1000)).optional(),
  isTrainingSolution: z.boolean().nullable().optional(),
  nonTrainingFactors: z.string().max(5000).optional(),
  solutionRationale: z.string().max(5000).optional(),
  deliveryNotes: z.string().max(5000).optional(),
  existingMaterials: z.string().max(5000).optional(),
  level1Reaction: z.string().max(2000).optional(),
  level2Learning: z.string().max(2000).optional(),
  level3Behavior: z.string().max(2000).optional(),
  level4Results: z.string().max(2000).optional(),
  audiences: z.array(audienceSchema).optional(),
  tasks: z.array(taskSchema).optional(),
});

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
    const parsed = courseAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      problemSummary,
      currentStateSummary,
      desiredStateSummary,
      constraints,
      assumptions,
      learnerPersonas,
      stakeholders,
      smes,
      isTrainingSolution,
      nonTrainingFactors,
      solutionRationale,
      deliveryNotes,
      existingMaterials,
      level1Reaction,
      level2Learning,
      level3Behavior,
      level4Results,
      audiences,
      tasks,
    } = parsed.data;

    const flatData = {
      problemSummary,
      currentStateSummary,
      desiredStateSummary,
      constraints,
      assumptions,
      learnerPersonas,
      stakeholders,
      smes,
      isTrainingSolution,
      nonTrainingFactors,
      solutionRationale,
      deliveryNotes,
      existingMaterials,
      level1Reaction,
      level2Learning,
      level3Behavior,
      level4Results,
    };

    const incomingAudiences = audiences ?? [];
    const incomingTasks = tasks ?? [];

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
