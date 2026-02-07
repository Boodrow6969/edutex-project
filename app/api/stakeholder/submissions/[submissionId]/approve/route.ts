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
 * POST /api/stakeholder/submissions/[submissionId]/approve
 * Approve a stakeholder submission.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { submissionId } = await params;

    const submission = await prisma.stakeholderSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, workspaceId: true, status: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    await assertWorkspaceMember(submission.workspaceId, user.id);

    const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW'];
    if (!allowedStatuses.includes(submission.status)) {
      return Response.json(
        { error: `Cannot approve a submission with status: ${submission.status}` },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated = await prisma.stakeholderSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        reviewedAt: now,
        reviewedById: user.id,
      },
    });

    return Response.json({
      success: true,
      submissionId: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to approve submission');
  }
}
