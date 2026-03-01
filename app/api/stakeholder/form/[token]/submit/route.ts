import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

import { SubmissionStatus, TrainingType } from '@/lib/types/stakeholderAnalysis';
import { getQuestionsForType } from '@/lib/questions';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * POST /api/stakeholder/form/[token]/submit
 * Submit the stakeholder form. Validates required questions, then marks as SUBMITTED.
 * Token-based auth — no session required.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token: tokenString } = await params;
    const limited = await checkRateLimit(tokenString);
    if (limited) return limited;

    // Validate token
    const token = await prisma.stakeholderAccessToken.findUnique({
      where: { token: tokenString },
      include: {
        submission: {
          include: {
            responses: true,
          },
        },
      },
    });

    if (!token) {
      return Response.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (!token.isActive) {
      return Response.json({ error: 'This form link is no longer active' }, { status: 403 });
    }

    if (token.expiresAt && token.expiresAt < new Date()) {
      return Response.json({ error: 'This form link has expired' }, { status: 403 });
    }

    if (!token.submission) {
      return Response.json({ error: 'No submission found for this token' }, { status: 404 });
    }

    const allowedStatuses: string[] = [
      SubmissionStatus.DRAFT,
      SubmissionStatus.REVISION_REQUESTED,
    ];
    if (!allowedStatuses.includes(token.submission.status)) {
      return Response.json(
        { error: 'Submission can only be submitted from DRAFT or REVISION_REQUESTED status' },
        { status: 403 }
      );
    }

    // Validate required questions
    const trainingType = token.trainingType as TrainingType;
    const questions = getQuestionsForType(trainingType);
    const responseMap = new Map(
      token.submission.responses.map((r) => [r.questionId, r.value])
    );

    const missingQuestions: { questionId: string; questionText: string; section: string }[] = [];

    for (const q of questions) {
      if (!q.required) continue;

      // Check conditional requirement
      if (q.conditional) {
        const parentValue = responseMap.get(q.conditional.questionId) || '';
        let conditionMet = false;

        switch (q.conditional.operator) {
          case 'equals':
            conditionMet = parentValue === q.conditional.value;
            break;
          case 'not_equals':
            conditionMet = parentValue !== q.conditional.value;
            break;
          case 'includes':
            conditionMet = parentValue.includes(q.conditional.value);
            break;
        }

        // If condition is not met, this question is not required
        if (!conditionMet) continue;
      }

      const value = responseMap.get(q.id);
      if (!value || value.trim() === '') {
        missingQuestions.push({
          questionId: q.id,
          questionText: q.questionText,
          section: q.section,
        });
      }
    }

    if (missingQuestions.length > 0) {
      return Response.json(
        {
          error: 'MISSING_REQUIRED_RESPONSES',
          missingQuestions,
        },
        { status: 400 }
      );
    }

    // Submit: update status and deactivate token
    const now = new Date();

    const [submission] = await prisma.$transaction([
      prisma.stakeholderSubmission.update({
        where: { id: token.submission.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: now,
        },
      }),
      prisma.stakeholderAccessToken.update({
        where: { id: token.id },
        data: { isActive: false },
      }),
    ]);

    return Response.json({
      success: true,
      submissionId: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error('Failed to submit form:', error);
    return Response.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
