import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { QUESTION_MAP } from '@/lib/questions';
import {
  defaultCourseAnalysisFormData,
  type CourseAnalysisFormData,
  type StakeholderSubmissionDisplay,
  type StakeholderSectionDisplay,
  type WorkspaceContact,
} from '@/lib/types/courseAnalysis';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/analysis-context
 * Returns merged context: course analysis + stakeholder submissions + workspace contacts
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    const { workspaceId } = await assertCourseAccess(courseId, user.id);

    // Fetch all three data sources in parallel
    const [submissions, naPage, workspace] = await Promise.all([
      prisma.stakeholderSubmission.findMany({
        where: {
          workspaceId,
          status: 'APPROVED',
        },
        include: {
          responses: true,
          token: { select: { stakeholderName: true, trainingType: true } },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.page.findFirst({
        where: { courseId, type: 'NEEDS_ANALYSIS' },
        include: {
          courseAnalysis: {
            include: {
              audiences: { orderBy: { order: 'asc' } },
              tasks: { orderBy: { order: 'asc' } },
            },
          },
        },
      }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { stakeholders: true },
      }),
    ]);

    // Build course analysis data
    const ca = naPage?.courseAnalysis;
    const courseAnalysis: CourseAnalysisFormData = ca
      ? {
          problemSummary: ca.problemSummary,
          currentStateSummary: ca.currentStateSummary,
          desiredStateSummary: ca.desiredStateSummary,
          constraints: ca.constraints ?? [],
          assumptions: ca.assumptions ?? [],
          learnerPersonas: ca.learnerPersonas ?? [],
          stakeholders: ca.stakeholders ?? [],
          smes: ca.smes ?? [],
          isTrainingSolution: ca.isTrainingSolution,
          nonTrainingFactors: ca.nonTrainingFactors ?? '',
          solutionRationale: ca.solutionRationale ?? '',
          deliveryNotes: ca.deliveryNotes ?? '',
          existingMaterials: ca.existingMaterials ?? '',
          level1Reaction: ca.level1Reaction,
          level2Learning: ca.level2Learning,
          level3Behavior: ca.level3Behavior,
          level4Results: ca.level4Results,
          audiences: (ca.audiences ?? []).map((a) => ({
            id: a.id,
            role: a.role,
            headcount: a.headcount,
            frequency: a.frequency,
            techComfort: a.techComfort,
            trainingFormat: a.trainingFormat,
            notes: a.notes,
            order: a.order,
          })),
          tasks: (ca.tasks ?? []).map((t) => ({
            id: t.id,
            task: t.task,
            audience: t.audience,
            source: t.source,
            complexity: t.complexity,
            intervention: t.intervention,
            priority: t.priority,
            notes: t.notes,
            order: t.order,
          })),
        }
      : defaultCourseAnalysisFormData;

    // Group submission responses by section using question metadata
    const submissionDisplays: StakeholderSubmissionDisplay[] = submissions.map((sub) => {
      const sectionMap = new Map<string, StakeholderSectionDisplay>();

      for (const resp of sub.responses) {
        const qDef = QUESTION_MAP[resp.questionId];
        const sectionTitle = qDef?.section ?? 'Other';
        const questionText = qDef?.questionText ?? resp.questionId;

        if (!sectionMap.has(sectionTitle)) {
          sectionMap.set(sectionTitle, { title: sectionTitle, responses: [] });
        }

        sectionMap.get(sectionTitle)!.responses.push({
          question: questionText,
          value: resp.value,
          questionId: resp.questionId,
        });
      }

      return {
        id: sub.id,
        stakeholderName: sub.token.stakeholderName ?? 'Unknown',
        trainingType: sub.token.trainingType,
        submittedAt: sub.submittedAt?.toISOString() ?? '',
        status: sub.status,
        sections: Array.from(sectionMap.values()),
      };
    });

    // Parse workspace contacts from JSON field
    const workspaceContacts: WorkspaceContact[] = Array.isArray(workspace?.stakeholders)
      ? (workspace.stakeholders as unknown as WorkspaceContact[])
      : [];

    return Response.json({
      courseAnalysis,
      submissions: submissionDisplays,
      workspaceContacts,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch analysis context');
  }
}
