import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

/**
 * PATCH /api/workspaces/[workspaceId]/archive
 * Archive or restore a workspace.
 * Any workspace member can archive/restore.
 *
 * Request body: { "action": "archive" | "restore" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const body = await request.json();
    const { action } = body;

    if (action !== 'archive' && action !== 'restore') {
      return Response.json(
        { error: 'action must be "archive" or "restore"' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        archivedAt: action === 'archive' ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        archivedAt: true,
        updatedAt: true,
      },
    });

    return Response.json(workspace);
  } catch (error) {
    return errorResponse(error, 'Failed to update workspace archive status');
  }
}
