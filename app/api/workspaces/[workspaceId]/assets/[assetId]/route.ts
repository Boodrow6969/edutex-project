import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { storageService } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ workspaceId: string; assetId: string }>;
}

/**
 * GET /api/workspaces/[workspaceId]/assets/[assetId]
 * Get a single asset's metadata.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId, assetId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const asset = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!asset || asset.workspaceId !== workspaceId) {
      throw new NotFoundError('Asset not found');
    }

    return Response.json({
      ...asset,
      url: `/api/assets/${asset.id}/file`,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch asset');
  }
}

/**
 * PUT /api/workspaces/[workspaceId]/assets/[assetId]
 * Update asset metadata (alt, tags, sourceContext).
 *
 * Request body:
 * {
 *   "alt": "string (optional)",
 *   "tags": ["string"] (optional),
 *   "sourceContext": "string (optional)"
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId, assetId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const existing = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      select: { id: true, workspaceId: true },
    });

    if (!existing || existing.workspaceId !== workspaceId) {
      throw new NotFoundError('Asset not found');
    }

    const body = await request.json();
    const updateData: { alt?: string | null; tags?: string[]; sourceContext?: string | null } = {};

    if (body.alt !== undefined) {
      updateData.alt = body.alt?.trim() || null;
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return Response.json(
          { error: 'tags must be an array of strings' },
          { status: 400 }
        );
      }
      updateData.tags = body.tags.map((t: string) => String(t).trim()).filter(Boolean);
    }

    if (body.sourceContext !== undefined) {
      updateData.sourceContext = body.sourceContext?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const asset = await prisma.contentAsset.update({
      where: { id: assetId },
      data: updateData,
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json({
      ...asset,
      url: `/api/assets/${asset.id}/file`,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to update asset');
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/assets/[assetId]
 * Delete an asset (file + database record).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId, assetId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const asset = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      select: { id: true, workspaceId: true, storageKey: true },
    });

    if (!asset || asset.workspaceId !== workspaceId) {
      throw new NotFoundError('Asset not found');
    }

    // Delete file from storage, then database record
    await storageService.delete(asset.storageKey);
    await prisma.contentAsset.delete({ where: { id: assetId } });

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, 'Failed to delete asset');
  }
}
