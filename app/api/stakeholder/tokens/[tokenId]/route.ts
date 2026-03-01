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
  params: Promise<{ tokenId: string }>;
}

/**
 * PATCH /api/stakeholder/tokens/[tokenId]
 * Update a stakeholder access token (activate/deactivate, change expiry).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { tokenId } = await params;
    const body = await request.json();

    // Find the token to verify workspace access
    const token = await prisma.stakeholderAccessToken.findUnique({
      where: { id: tokenId },
      select: { id: true, workspaceId: true },
    });

    if (!token) {
      throw new NotFoundError('Token not found');
    }

    await assertWorkspaceMember(token.workspaceId, user.id);

    const updateData: { isActive?: boolean; expiresAt?: Date | null } = {};

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') {
        return Response.json(
          { error: 'isActive must be a boolean' },
          { status: 400 }
        );
      }
      updateData.isActive = body.isActive;
    }

    if (body.expiresAt !== undefined) {
      if (body.expiresAt !== null) {
        const parsed = new Date(body.expiresAt);
        if (isNaN(parsed.getTime()) || parsed <= new Date()) {
          return Response.json(
            { error: 'expiresAt must be a valid future date' },
            { status: 400 }
          );
        }
        updateData.expiresAt = parsed;
      } else {
        updateData.expiresAt = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.stakeholderAccessToken.update({
      where: { id: tokenId },
      data: updateData,
    });

    return Response.json({
      id: updated.id,
      token: updated.token,
      isActive: updated.isActive,
      expiresAt: updated.expiresAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update token');
  }
}
