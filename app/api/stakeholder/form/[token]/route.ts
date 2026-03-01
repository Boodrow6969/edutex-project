import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

import { TRAINING_TYPE_LABELS, TrainingType } from '@/lib/types/stakeholderAnalysis';
import { getQuestionsForType } from '@/lib/questions';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * Validate a stakeholder access token.
 * Returns the token record or a 4xx Response.
 */
async function validateToken(tokenString: string) {
  const token = await prisma.stakeholderAccessToken.findUnique({
    where: { token: tokenString },
    include: {
      workspace: { select: { id: true, name: true } },
      submission: {
        include: {
          responses: true,
        },
      },
    },
  });

  if (!token) {
    return { error: Response.json({ error: 'Invalid token' }, { status: 404 }) };
  }

  if (!token.isActive) {
    return { error: Response.json({ error: 'This form link is no longer active' }, { status: 403 }) };
  }

  if (token.expiresAt && token.expiresAt < new Date()) {
    return { error: Response.json({ error: 'This form link has expired' }, { status: 403 }) };
  }

  return { token };
}

/**
 * GET /api/stakeholder/form/[token]
 * Get the stakeholder form data (questions, existing responses, workspace info).
 * Token-based auth — no session required.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token: tokenString } = await params;
    const limited = await checkRateLimit(tokenString);
    if (limited) return limited;
    const result = await validateToken(tokenString);

    if ('error' in result) {
      return result.error;
    }

    const { token } = result;
    const trainingType = token.trainingType as TrainingType;
    const questions = getQuestionsForType(trainingType);

    // Strip ID-facing fields — stakeholder should not see idNotes
    const stakeholderQuestions = questions.map((q) => ({
      id: q.id,
      section: q.section,
      questionText: q.questionText,
      stakeholderGuidance: q.stakeholderGuidance,
      fieldType: q.fieldType,
      required: q.required,
      options: q.options,
      displayOrder: q.displayOrder,
      conditional: q.conditional,
    }));

    // Build responses map
    const responses: Record<string, string> = {};
    if (token.submission?.responses) {
      for (const r of token.submission.responses) {
        responses[r.questionId] = r.value;
      }
    }

    return Response.json({
      workspaceName: token.workspace.name,
      trainingType: token.trainingType,
      trainingTypeLabel: TRAINING_TYPE_LABELS[trainingType],
      submission: token.submission
        ? {
            id: token.submission.id,
            status: token.submission.status,
            revisionNotes: token.submission.revisionNotes,
          }
        : null,
      stakeholderName: token.stakeholderName,
      stakeholderEmail: token.stakeholderEmail,
      questions: stakeholderQuestions,
      responses,
    });
  } catch (error) {
    console.error('Failed to load form:', error);
    return Response.json(
      { error: 'Failed to load form' },
      { status: 500 }
    );
  }
}
