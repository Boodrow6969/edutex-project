import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertWorkspaceMember,
  errorResponse,
} from '@/lib/auth-helpers';
import { storageService } from '@/lib/storage';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

/**
 * POST /api/workspaces/[workspaceId]/assets
 * Upload a new content asset (image).
 *
 * Expects multipart/form-data with:
 * - file: the image file
 * - alt (optional): alt text
 * - tags (optional): comma-separated tag list
 * - sourceContext (optional): where the asset came from
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: `File type "${file.type}" is not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Read file into buffer and store
    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = await storageService.store(buffer, file.name);

    // Parse optional fields
    const alt = formData.get('alt')?.toString() || null;
    const tagsRaw = formData.get('tags')?.toString() || '';
    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const sourceContext = formData.get('sourceContext')?.toString() || null;

    // Create database record
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId,
        uploadedById: user.id,
        filename: file.name,
        storageKey,
        mimeType: file.type,
        fileSizeBytes: file.size,
        alt,
        tags,
        sourceContext,
      },
    });

    return Response.json(
      {
        ...asset,
        url: `/api/assets/${asset.id}/file`,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to upload asset');
  }
}

/**
 * GET /api/workspaces/[workspaceId]/assets
 * List assets for a workspace with optional filters.
 *
 * Query params:
 * - search: filter by filename (case-insensitive contains)
 * - tag: filter by tag (exact match in array)
 * - mimeType: filter by MIME type
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { workspaceId } = await params;

    await assertWorkspaceMember(workspaceId, user.id);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const mimeType = searchParams.get('mimeType');

    // Build where clause
    const where: Record<string, unknown> = { workspaceId };

    if (search) {
      where.filename = { contains: search, mode: 'insensitive' };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (mimeType) {
      where.mimeType = mimeType;
    }

    const assets = await prisma.contentAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json(
      assets.map((asset) => ({
        ...asset,
        url: `/api/assets/${asset.id}/file`,
      }))
    );
  } catch (error) {
    return errorResponse(error, 'Failed to list assets');
  }
}
