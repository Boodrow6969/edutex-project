import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCurriculumAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ curriculumId: string }>;
}

// Valid page types for curriculum pages
const VALID_PAGE_TYPES: PageType[] = [
  'CUSTOM',
  'PROGRAM_NEEDS_ANALYSIS',
  'PROGRAM_MAP',
  'PROGRAM_ASSESSMENT_STRATEGY',
  'PROGRAM_EVALUATION',
];

/**
 * GET /api/curricula/[curriculumId]/pages
 * List pages for this curriculum.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access
    await assertCurriculumAccess(curriculumId, user.id);

    const pages = await prisma.page.findMany({
      where: { curriculumId },
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const result = pages.map((page) => ({
      id: page.id,
      title: page.title,
      type: page.type,
      order: page.order,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      createdBy: page.createdBy,
      blockCount: page._count.blocks,
    }));

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch curriculum pages');
  }
}

/**
 * POST /api/curricula/[curriculumId]/pages
 * Create a new page for the curriculum.
 *
 * Request body:
 * {
 *   title: string (required),
 *   type?: PageType (defaults to CUSTOM)
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { curriculumId } = await params;

    // Verify access with edit permissions
    await assertCurriculumAccess(curriculumId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return Response.json(
        { error: 'title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const title = body.title.trim();

    // Validate page type if provided
    let pageType: PageType = PageType.CUSTOM;
    if (body.type !== undefined) {
      if (!VALID_PAGE_TYPES.includes(body.type as PageType)) {
        return Response.json(
          {
            error: `Invalid page type for curriculum. Must be one of: ${VALID_PAGE_TYPES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      pageType = body.type as PageType;
    }

    // Get the highest order value for existing pages
    const maxOrderPage = await prisma.page.findFirst({
      where: { curriculumId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrderPage?.order ?? -1) + 1;

    // Create the page
    const page = await prisma.page.create({
      data: {
        title,
        type: pageType,
        curriculumId,
        createdById: user.id,
        order: newOrder,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json(
      {
        id: page.id,
        title: page.title,
        type: page.type,
        order: page.order,
        curriculumId: page.curriculumId,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        createdBy: page.createdBy,
        blockCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create curriculum page');
  }
}
