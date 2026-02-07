import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';

/**
 * GET /api/stakeholder/summary?workspaceId=X
 * Returns stakeholder analysis summary for a workspace dashboard card.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');

    if (!workspaceId) {
      return Response.json(
        { error: 'workspaceId query parameter is required' },
        { status: 400 }
      );
    }

    await assertWorkspaceMember(workspaceId, user.id);

    // Count active and total tokens
    const [activeTokenCount, totalTokenCount] = await Promise.all([
      prisma.stakeholderAccessToken.count({
        where: { workspaceId, isActive: true },
      }),
      prisma.stakeholderAccessToken.count({
        where: { workspaceId },
      }),
    ]);

    // Get submissions (exclude DRAFT — those haven't been submitted yet)
    const submissions = await prisma.stakeholderSubmission.findMany({
      where: {
        workspaceId,
        status: { not: 'DRAFT' },
      },
      include: {
        token: {
          select: { stakeholderName: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Latest submission
    const latest = submissions[0] ?? null;
    const latestSubmission = latest
      ? {
          id: latest.id,
          stakeholderName: latest.token?.stakeholderName ?? 'Unknown',
          status: mapStatus(latest.status),
          submittedAt: latest.submittedAt?.toISOString() ?? latest.createdAt.toISOString(),
        }
      : null;

    // Submission counts by mapped status
    const submissionCounts = {
      pending: submissions.filter(
        (s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'
      ).length,
      approved: submissions.filter((s) => s.status === 'APPROVED').length,
      revisionRequested: submissions.filter(
        (s) => s.status === 'REVISION_REQUESTED'
      ).length,
    };

    return Response.json({
      activeTokenCount,
      totalTokenCount,
      latestSubmission,
      submissionCounts,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch stakeholder summary');
  }
}

function mapStatus(
  status: string
): 'PENDING_REVIEW' | 'APPROVED' | 'REVISION_REQUESTED' {
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
    return 'PENDING_REVIEW';
  }
  if (status === 'APPROVED') return 'APPROVED';
  return 'REVISION_REQUESTED';
}
