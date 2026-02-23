import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

const WRITE_ROLES: WorkspaceRole[] = [
  WorkspaceRole.ADMINISTRATOR,
  WorkspaceRole.MANAGER,
  WorkspaceRole.DESIGNER,
  WorkspaceRole.FACILITATOR,
];

/**
 * GET /api/courses/[courseId]/task-analyses
 * List all TaskAnalysis records for the course.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    await assertCourseAccess(courseId, user.id);

    const taskAnalyses = await prisma.taskAnalysis.findMany({
      where: {
        page: { courseId },
      },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        objective: { select: { id: true, title: true, bloomLevel: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(taskAnalyses);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch task analyses');
  }
}

/**
 * POST /api/courses/[courseId]/task-analyses
 * Create a new TaskAnalysis for the course.
 * Auto-creates a TASK_ANALYSIS page if one doesn't exist for the given task.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    await assertCourseAccess(courseId, user.id, WRITE_ROLES);

    const body = await request.json();

    // Find or create a TASK_ANALYSIS page for this course
    let page = await prisma.page.findFirst({
      where: { courseId, type: 'TASK_ANALYSIS', taskAnalysis: null },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          title: body.taskName || 'Task Analysis',
          type: 'TASK_ANALYSIS',
          courseId,
          createdById: user.id,
        },
      });
    }

    const taskAnalysis = await prisma.taskAnalysis.create({
      data: {
        pageId: page.id,
        objectiveId: body.objectiveId ?? null,
        sourceTaskId: body.sourceTaskId ?? null,
        analysisType: body.analysisType ?? 'PROCEDURAL',
        taskName: body.taskName ?? '',
        taskGoal: body.taskGoal ?? '',
        audienceRole: body.audienceRole ?? '',
        audiencePriorKnowledge: body.audiencePriorKnowledge ?? '',
        audienceTechComfort: body.audienceTechComfort ?? '',
        constraints: body.constraints ?? '',
        contextNotes: body.contextNotes ?? '',
        dataSource: body.dataSource ?? {},
        criticalityScore: body.criticalityScore ?? null,
        frequencyScore: body.frequencyScore ?? null,
        difficultyScore: body.difficultyScore ?? null,
        universalityScore: body.universalityScore ?? null,
        feasibilityScore: body.feasibilityScore ?? null,
        aiDrafted: body.aiDrafted ?? false,
        steps: body.steps?.length
          ? {
              create: body.steps.map(
                (
                  s: {
                    stepNumber: number;
                    description: string;
                    isDecisionPoint?: boolean;
                    branchCondition?: string;
                    commonErrors?: string;
                    cues?: string;
                    toolsRequired?: string;
                    instructionalEvent?: string;
                    notes?: string;
                  },
                  i: number,
                ) => ({
                  stepNumber: s.stepNumber ?? i + 1,
                  description: s.description ?? '',
                  isDecisionPoint: s.isDecisionPoint ?? false,
                  branchCondition: s.branchCondition ?? null,
                  commonErrors: s.commonErrors ?? null,
                  cues: s.cues ?? null,
                  toolsRequired: s.toolsRequired ?? null,
                  instructionalEvent: s.instructionalEvent ?? null,
                  notes: s.notes ?? null,
                }),
              ),
            }
          : undefined,
      },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        objective: { select: { id: true, title: true, bloomLevel: true } },
      },
    });

    return Response.json(taskAnalysis, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create task analysis');
  }
}
