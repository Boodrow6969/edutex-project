import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
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
  params: Promise<{ assetId: string }>;
}

/**
 * GET /api/assets/[assetId]/file
 * Serve the binary file for an asset.
 * Auth check: user must be a member of the asset's workspace.
 * Returns the file with appropriate Content-Type and Cache-Control headers.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { assetId } = await params;

    const asset = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        workspaceId: true,
        storageKey: true,
        mimeType: true,
        filename: true,
      },
    });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    // Verify user has access to the workspace this asset belongs to
    await assertWorkspaceMember(asset.workspaceId, user.id);

    const filePath = storageService.getFilePath(asset.storageKey);
    const fileBuffer = await fs.readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': asset.mimeType,
        'Content-Disposition': `inline; filename="${asset.filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return Response.json({ error: 'File not found on disk' }, { status: 404 });
    }
    return errorResponse(error, 'Failed to serve asset');
  }
}
