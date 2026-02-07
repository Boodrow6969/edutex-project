import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { SubmissionStatus } from '@/lib/types/stakeholderAnalysis';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * PUT /api/stakeholder/form/[token]/responses
 * Save stakeholder responses (upsert) with change log tracking.
 * Token-based auth — no session required.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { token: tokenString } = await params;
    const body = await request.json();

    const { responses, changedBy } = body;

    if (!Array.isArray(responses)) {
      return Response.json(
        { error: 'responses must be an array of { questionId, value }' },
        { status: 400 }
      );
    }

    if (!changedBy || typeof changedBy !== 'string') {
      return Response.json(
        { error: 'changedBy is required' },
        { status: 400 }
      );
    }

    // Validate token
    const token = await prisma.stakeholderAccessToken.findUnique({
      where: { token: tokenString },
      include: {
        submission: true,
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

    const allowedStatuses: string[] = [SubmissionStatus.DRAFT, SubmissionStatus.REVISION_REQUESTED];
    if (!allowedStatuses.includes(token.submission.status)) {
      return Response.json(
        { error: 'Responses can only be saved when the submission is in DRAFT or REVISION_REQUESTED status' },
        { status: 403 }
      );
    }

    const submissionId = token.submission.id;

    // Load existing responses for change detection
    const existingResponses = await prisma.stakeholderResponse.findMany({
      where: { submissionId },
    });
    const existingMap = new Map(
      existingResponses.map((r) => [r.questionId, r])
    );

    let saved = 0;
    let changed = 0;

    await prisma.$transaction(async (tx) => {
      for (const { questionId, value } of responses) {
        if (!questionId || typeof questionId !== 'string') continue;
        if (typeof value !== 'string') continue;

        const existing = existingMap.get(questionId);

        if (existing) {
          // Value unchanged — skip
          if (existing.value === value) continue;

          // Update existing response
          await tx.stakeholderResponse.update({
            where: { id: existing.id },
            data: { value, updatedBy: changedBy },
          });

          // Create change log
          await tx.stakeholderChangeLog.create({
            data: {
              submissionId,
              questionId,
              changedBy,
              previousValue: existing.value,
              newValue: value,
            },
          });

          changed++;
        } else {
          // Create new response
          await tx.stakeholderResponse.create({
            data: {
              submissionId,
              questionId,
              value,
              updatedBy: changedBy,
            },
          });

          // Create change log for new entry
          await tx.stakeholderChangeLog.create({
            data: {
              submissionId,
              questionId,
              changedBy,
              previousValue: null,
              newValue: value,
            },
          });

          changed++;
        }

        saved++;
      }
    });

    return Response.json({ saved, changed });
  } catch (error) {
    console.error('Failed to save responses:', error);
    return Response.json(
      { error: 'Failed to save responses' },
      { status: 500 }
    );
  }
}
