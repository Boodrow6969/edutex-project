import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ courseId: string; taskAnalysisId: string }>;
}

const WRITE_ROLES: WorkspaceRole[] = [
  WorkspaceRole.ADMINISTRATOR,
  WorkspaceRole.MANAGER,
  WorkspaceRole.DESIGNER,
  WorkspaceRole.FACILITATOR,
];

/**
 * Fetch a TaskAnalysis and verify it belongs to the given course.
 */
async function getTaskAnalysisForCourse(taskAnalysisId: string, courseId: string) {
  const ta = await prisma.taskAnalysis.findUnique({
    where: { id: taskAnalysisId },
    include: {
      page: { select: { courseId: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      objective: { select: { id: true, title: true, bloomLevel: true } },
    },
  });

  if (!ta || ta.page.courseId !== courseId) {
    throw new NotFoundError('Task analysis not found');
  }

  return ta;
}

/**
 * GET /api/courses/[courseId]/task-analyses/[taskAnalysisId]
 * Fetch a single task analysis with steps.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, taskAnalysisId } = await params;

    await assertCourseAccess(courseId, user.id);

    const ta = await getTaskAnalysisForCourse(taskAnalysisId, courseId);

    return Response.json(ta);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch task analysis');
  }
}

/**
 * PUT /api/courses/[courseId]/task-analyses/[taskAnalysisId]
 * Update fields + upsert steps (delete removed, update existing, create new).
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, taskAnalysisId } = await params;

    await assertCourseAccess(courseId, user.id, WRITE_ROLES);

    // Verify ownership
    await getTaskAnalysisForCourse(taskAnalysisId, courseId);

    const body = await request.json();

    // Build steps operations if steps array is provided
    type StepInput = {
      id?: string;
      stepNumber: number;
      description: string;
      isDecisionPoint?: boolean;
      branchCondition?: string;
      commonErrors?: string;
      cues?: string;
      toolsRequired?: string;
      instructionalEvent?: string;
      notes?: string;
    };

    let stepsOps = {};
    if (Array.isArray(body.steps)) {
      const incomingSteps: StepInput[] = body.steps;
      const incomingIds = incomingSteps.filter((s) => s.id).map((s) => s.id as string);

      stepsOps = {
        steps: {
          // Delete steps not in the incoming array
          deleteMany: {
            taskAnalysisId,
            id: { notIn: incomingIds },
          },
          // Upsert each incoming step
          upsert: incomingSteps.map((s, i) => ({
            where: { id: s.id ?? '' },
            create: {
              stepNumber: s.stepNumber ?? i + 1,
              description: s.description ?? '',
              isDecisionPoint: s.isDecisionPoint ?? false,
              branchCondition: s.branchCondition ?? null,
              commonErrors: s.commonErrors ?? null,
              cues: s.cues ?? null,
              toolsRequired: s.toolsRequired ?? null,
              instructionalEvent: s.instructionalEvent ?? null,
              notes: s.notes ?? null,
            },
            update: {
              stepNumber: s.stepNumber ?? i + 1,
              description: s.description ?? '',
              isDecisionPoint: s.isDecisionPoint ?? false,
              branchCondition: s.branchCondition ?? null,
              commonErrors: s.commonErrors ?? null,
              cues: s.cues ?? null,
              toolsRequired: s.toolsRequired ?? null,
              instructionalEvent: s.instructionalEvent ?? null,
              notes: s.notes ?? null,
            },
          })),
        },
      };
    }

    const updated = await prisma.taskAnalysis.update({
      where: { id: taskAnalysisId },
      data: {
        ...(body.objectiveId !== undefined && { objectiveId: body.objectiveId }),
        ...(body.sourceTaskId !== undefined && { sourceTaskId: body.sourceTaskId }),
        ...(body.analysisType !== undefined && { analysisType: body.analysisType }),
        ...(body.taskName !== undefined && { taskName: body.taskName }),
        ...(body.taskGoal !== undefined && { taskGoal: body.taskGoal }),
        ...(body.audienceRole !== undefined && { audienceRole: body.audienceRole }),
        ...(body.audiencePriorKnowledge !== undefined && {
          audiencePriorKnowledge: body.audiencePriorKnowledge,
        }),
        ...(body.audienceTechComfort !== undefined && {
          audienceTechComfort: body.audienceTechComfort,
        }),
        ...(body.constraints !== undefined && { constraints: body.constraints }),
        ...(body.contextNotes !== undefined && { contextNotes: body.contextNotes }),
        ...(body.dataSource !== undefined && { dataSource: body.dataSource }),
        ...(body.criticalityScore !== undefined && { criticalityScore: body.criticalityScore }),
        ...(body.frequencyScore !== undefined && { frequencyScore: body.frequencyScore }),
        ...(body.difficultyScore !== undefined && { difficultyScore: body.difficultyScore }),
        ...(body.universalityScore !== undefined && { universalityScore: body.universalityScore }),
        ...(body.feasibilityScore !== undefined && { feasibilityScore: body.feasibilityScore }),
        ...(body.aiDrafted !== undefined && { aiDrafted: body.aiDrafted }),
        ...stepsOps,
      },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        objective: { select: { id: true, title: true, bloomLevel: true } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    return errorResponse(error, 'Failed to update task analysis');
  }
}

/**
 * DELETE /api/courses/[courseId]/task-analyses/[taskAnalysisId]
 * Delete a task analysis (cascade deletes steps via schema).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, taskAnalysisId } = await params;

    await assertCourseAccess(courseId, user.id, WRITE_ROLES);

    // Verify ownership
    await getTaskAnalysisForCourse(taskAnalysisId, courseId);

    await prisma.taskAnalysis.delete({
      where: { id: taskAnalysisId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete task analysis');
  }
}
