import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { TrainingType } from '@/lib/types/stakeholderAnalysis';

/**
 * POST /api/stakeholder/tokens
 * Create a new stakeholder access token and draft submission.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const body = await request.json();

    const { workspaceId, trainingType, expiresAt } = body;

    if (!workspaceId || typeof workspaceId !== 'string') {
      return Response.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    if (!trainingType || !Object.values(TrainingType).includes(trainingType)) {
      return Response.json(
        { error: 'trainingType must be one of: ' + Object.values(TrainingType).join(', ') },
        { status: 400 }
      );
    }

    if (expiresAt !== undefined && expiresAt !== null) {
      const parsed = new Date(expiresAt);
      if (isNaN(parsed.getTime()) || parsed <= new Date()) {
        return Response.json(
          { error: 'expiresAt must be a valid future date' },
          { status: 400 }
        );
      }
    }

    await assertWorkspaceMember(workspaceId, user.id);

    const result = await prisma.$transaction(async (tx) => {
      const tokenValue = randomBytes(32).toString('hex');
      const token = await tx.stakeholderAccessToken.create({
        data: {
          token: tokenValue,
          workspaceId,
          trainingType,
          createdById: user.id,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      const submission = await tx.stakeholderSubmission.create({
        data: {
          tokenId: token.id,
          workspaceId,
          trainingType,
        },
      });

      return { token, submission };
    });

    return Response.json({
      id: result.token.id,
      token: result.token.token,
      workspaceId: result.token.workspaceId,
      trainingType: result.token.trainingType,
      isActive: result.token.isActive,
      expiresAt: result.token.expiresAt,
      createdAt: result.token.createdAt,
      formUrl: `/stakeholder/form/${result.token.token}`,
      submission: {
        id: result.submission.id,
        status: result.submission.status,
      },
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create stakeholder token');
  }
}

/**
 * GET /api/stakeholder/tokens?workspaceId=xxx
 * List all tokens for a workspace with submission info.
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

    const tokens = await prisma.stakeholderAccessToken.findMany({
      where: { workspaceId },
      include: {
        submission: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            _count: {
              select: { responses: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = tokens.map((t) => ({
      id: t.id,
      token: t.token,
      trainingType: t.trainingType,
      isActive: t.isActive,
      expiresAt: t.expiresAt,
      stakeholderName: t.stakeholderName,
      stakeholderEmail: t.stakeholderEmail,
      createdAt: t.createdAt,
      submission: t.submission
        ? {
            id: t.submission.id,
            status: t.submission.status,
            submittedAt: t.submission.submittedAt,
            responseCount: t.submission._count.responses,
          }
        : null,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch stakeholder tokens');
  }
}
