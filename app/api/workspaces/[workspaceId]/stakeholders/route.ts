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
  params: Promise<{ workspaceId: string }>;
}

/**
 * GET /api/workspaces/[workspaceId]/stakeholders
 * Returns the stakeholders JSON array from the workspace.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { stakeholders: true },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    return Response.json(workspace.stakeholders ?? []);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch stakeholders');
  }
}

/**
 * PUT /api/workspaces/[workspaceId]/stakeholders
 * Replaces the stakeholders JSON array on the workspace.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    console.log('[stakeholders PUT] workspaceId:', workspaceId);

    await assertWorkspaceMember(workspaceId, user.id);

    const body = await request.json();
    const { stakeholders } = body;

    console.log('[stakeholders PUT] payload:', JSON.stringify(stakeholders).slice(0, 500));

    if (!Array.isArray(stakeholders)) {
      return Response.json(
        { error: 'stakeholders must be an array' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stakeholders: stakeholders as any },
      select: { stakeholders: true },
    });

    console.log('[stakeholders PUT] saved, count:', Array.isArray(workspace.stakeholders) ? (workspace.stakeholders as any[]).length : 'not-array');

    return Response.json(workspace.stakeholders);
  } catch (error) {
    console.error('[stakeholders PUT] error:', error);
    return errorResponse(error, 'Failed to update stakeholders');
  }
}
