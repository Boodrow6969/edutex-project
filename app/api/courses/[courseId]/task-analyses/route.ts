import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { Prisma, WorkspaceRole, TaskAnalysisType, InstructionalEvent } from '@prisma/client';
import { z } from 'zod';

const taskAnalysisStepSchema = z.object({
  stepNumber: z.number().int().min(1).optional(),
  description: z.string().max(5000).optional(),
  isDecisionPoint: z.boolean().optional(),
  branchCondition: z.string().max(2000).nullable().optional(),
  commonErrors: z.string().max(2000).nullable().optional(),
  cues: z.string().max(2000).nullable().optional(),
  toolsRequired: z.string().max(2000).nullable().optional(),
  instructionalEvent: z.enum([
    InstructionalEvent.DEMONSTRATION,
    InstructionalEvent.PRACTICE,
    InstructionalEvent.DECISION_BRANCH,
    InstructionalEvent.INFORMATION,
    InstructionalEvent.EXAMPLE,
    InstructionalEvent.CAUTION,
  ]).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const taskAnalysisSchema = z.object({
  objectiveId: z.string().nullable().optional(),
  sourceTaskId: z.string().nullable().optional(),
  analysisType: z.enum([
    TaskAnalysisType.PROCEDURAL,
    TaskAnalysisType.HIERARCHICAL,
    TaskAnalysisType.COGNITIVE,
  ]).optional(),
  taskName: z.string().max(1000).optional(),
  taskGoal: z.string().max(5000).optional(),
  audienceRole: z.string().max(500).optional(),
  audiencePriorKnowledge: z.string().max(2000).optional(),
  audienceTechComfort: z.string().max(200).optional(),
  constraints: z.string().max(5000).optional(),
  contextNotes: z.string().max(5000).optional(),
  dataSource: z.record(z.string(), z.unknown()).optional(),
  criticalityScore: z.number().min(0).max(10).nullable().optional(),
  frequencyScore: z.number().min(0).max(10).nullable().optional(),
  difficultyScore: z.number().min(0).max(10).nullable().optional(),
  universalityScore: z.number().min(0).max(10).nullable().optional(),
  feasibilityScore: z.number().min(0).max(10).nullable().optional(),
  aiDrafted: z.boolean().optional(),
  steps: z.array(taskAnalysisStepSchema).optional(),
});

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
    const parsed = taskAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const {
      objectiveId,
      sourceTaskId,
      analysisType,
      taskName,
      taskGoal,
      audienceRole,
      audiencePriorKnowledge,
      audienceTechComfort,
      constraints,
      contextNotes,
      dataSource,
      criticalityScore,
      frequencyScore,
      difficultyScore,
      universalityScore,
      feasibilityScore,
      aiDrafted,
      steps,
    } = parsed.data;

    // Find or create a TASK_ANALYSIS page for this course
    let page = await prisma.page.findFirst({
      where: { courseId, type: 'TASK_ANALYSIS', taskAnalysis: null },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          title: taskName || 'Task Analysis',
          type: 'TASK_ANALYSIS',
          courseId,
          createdById: user.id,
        },
      });
    }

    const taskAnalysis = await prisma.taskAnalysis.create({
      data: {
        pageId: page.id,
        objectiveId: objectiveId ?? null,
        sourceTaskId: sourceTaskId ?? null,
        analysisType: analysisType ?? 'PROCEDURAL',
        taskName: taskName ?? '',
        taskGoal: taskGoal ?? '',
        audienceRole: audienceRole ?? '',
        audiencePriorKnowledge: audiencePriorKnowledge ?? '',
        audienceTechComfort: audienceTechComfort ?? '',
        constraints: constraints ?? '',
        contextNotes: contextNotes ?? '',
        dataSource: (dataSource ?? {}) as Prisma.InputJsonValue,
        criticalityScore: criticalityScore ?? null,
        frequencyScore: frequencyScore ?? null,
        difficultyScore: difficultyScore ?? null,
        universalityScore: universalityScore ?? null,
        feasibilityScore: feasibilityScore ?? null,
        aiDrafted: aiDrafted ?? false,
        steps: steps?.length
          ? {
              create: steps.map((s, i) => ({
                stepNumber: s.stepNumber ?? i + 1,
                description: s.description ?? '',
                isDecisionPoint: s.isDecisionPoint ?? false,
                branchCondition: s.branchCondition ?? null,
                commonErrors: s.commonErrors ?? null,
                cues: s.cues ?? null,
                toolsRequired: s.toolsRequired ?? null,
                instructionalEvent: s.instructionalEvent ?? null,
                notes: s.notes ?? null,
              })),
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
