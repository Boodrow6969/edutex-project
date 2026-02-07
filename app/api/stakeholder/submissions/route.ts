import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { TrainingType } from '@/lib/types/stakeholderAnalysis';
import { getQuestionsForType } from '@/lib/questions';

/**
 * GET /api/stakeholder/submissions?workspaceId=xxx&status=xxx
 * List submissions for a workspace, optionally filtered by status.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const status = request.nextUrl.searchParams.get('status');

    if (!workspaceId) {
      return Response.json(
        { error: 'workspaceId query parameter is required' },
        { status: 400 }
      );
    }

    await assertWorkspaceMember(workspaceId, user.id);

    const where: Record<string, unknown> = { workspaceId };
    if (status) {
      where.status = status;
    }

    const submissions = await prisma.stakeholderSubmission.findMany({
      where,
      include: {
        token: {
          select: {
            stakeholderName: true,
            stakeholderEmail: true,
            trainingType: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = submissions.map((s) => ({
      id: s.id,
      tokenId: s.tokenId,
      workspaceId: s.workspaceId,
      trainingType: s.trainingType,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      revisionNotes: s.revisionNotes,
      createdAt: s.createdAt,
      stakeholderName: s.token.stakeholderName,
      stakeholderEmail: s.token.stakeholderEmail,
      responseCount: s._count.responses,
      totalQuestions: getQuestionsForType(s.trainingType as TrainingType).length,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch submissions');
  }
}
