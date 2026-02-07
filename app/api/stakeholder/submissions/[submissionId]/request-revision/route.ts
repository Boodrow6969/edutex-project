import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';

interface RouteParams {
  params: Promise<{ submissionId: string }>;
}

/**
 * POST /api/stakeholder/submissions/[submissionId]/request-revision
 * Request revision on a stakeholder submission. Reactivates the token.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { submissionId } = await params;
    const body = await request.json();

    const { revisionNotes } = body;

    if (!revisionNotes || typeof revisionNotes !== 'string' || revisionNotes.trim() === '') {
      return Response.json(
        { error: 'revisionNotes is required' },
        { status: 400 }
      );
    }

    const submission = await prisma.stakeholderSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, workspaceId: true, status: true, tokenId: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    await assertWorkspaceMember(submission.workspaceId, user.id);

    const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW'];
    if (!allowedStatuses.includes(submission.status)) {
      return Response.json(
        { error: `Cannot request revision for a submission with status: ${submission.status}` },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update submission and reactivate the token in a transaction
    const [updated] = await prisma.$transaction([
      prisma.stakeholderSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'REVISION_REQUESTED',
          revisionNotes: revisionNotes.trim(),
          reviewedAt: now,
          reviewedById: user.id,
        },
      }),
      prisma.stakeholderAccessToken.update({
        where: { id: submission.tokenId },
        data: { isActive: true },
      }),
    ]);

    return Response.json({
      success: true,
      submissionId: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to request revision');
  }
}
