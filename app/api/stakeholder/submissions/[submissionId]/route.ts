import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { TrainingType } from '@/lib/types/stakeholderAnalysis';
import { getQuestionsForType, QUESTION_MAP } from '@/lib/questions';

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

/**
 * GET /api/stakeholder/submissions/[submissionId]
 * Get full submission detail with questions, responses, and change logs.
 * ID-facing view — includes idNotes and idNotesExtended.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { submissionId } = await params;

    const submission = await prisma.stakeholderSubmission.findUnique({
      where: { id: submissionId },
      include: {
        token: {
          select: {
            stakeholderName: true,
            stakeholderEmail: true,
          },
        },
        responses: true,
        changeLogs: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // Verify access through workspace membership
    await assertWorkspaceMember(submission.workspaceId, user.id);

    const trainingType = submission.trainingType as TrainingType;
    const questions = getQuestionsForType(trainingType);

    // Build response map
    const responseMap = new Map(
      submission.responses.map((r) => [r.questionId, r])
    );

    // Merge questions with responses — full ID-facing view
    const questionResponses = questions.map((q) => {
      const response = responseMap.get(q.id);
      return {
        questionId: q.id,
        section: q.section,
        questionText: q.questionText,
        idNotes: q.idNotes,
        idNotesExtended: q.idNotesExtended || null,
        stakeholderGuidance: q.stakeholderGuidance,
        fieldType: q.fieldType,
        required: q.required,
        options: q.options || null,
        displayOrder: q.displayOrder,
        conditional: q.conditional || null,
        response: response
          ? {
              id: response.id,
              value: response.value,
              updatedAt: response.updatedAt,
            }
          : null,
      };
    });

    // Enrich change logs with question text
    const changeLog = submission.changeLogs.map((cl) => ({
      id: cl.id,
      questionId: cl.questionId,
      questionText: QUESTION_MAP[cl.questionId]?.questionText || cl.questionId,
      changedBy: cl.changedBy,
      previousValue: cl.previousValue,
      newValue: cl.newValue,
      changedAt: cl.changedAt,
    }));

    return Response.json({
      id: submission.id,
      tokenId: submission.tokenId,
      workspaceId: submission.workspaceId,
      trainingType: submission.trainingType,
      status: submission.status,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
      revisionNotes: submission.revisionNotes,
      createdAt: submission.createdAt,
      stakeholderName: submission.token.stakeholderName,
      stakeholderEmail: submission.token.stakeholderEmail,
      questionResponses,
      changeLog,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch submission');
  }
}
