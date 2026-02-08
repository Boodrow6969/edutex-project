import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { WorkspaceRole, PageType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// Valid page types for validation
const VALID_PAGE_TYPES: PageType[] = [
  'CUSTOM',
  'NEEDS_ANALYSIS',
  'TASK_ANALYSIS',
  'AUDIENCE_PROFILE',
  'LEARNING_OBJECTIVES',
  'ASSESSMENT_PLAN',
  'STORYBOARD',
  'CURRICULUM_MAP',
  'PROGRAM_NEEDS_ANALYSIS',
  'PROGRAM_MAP',
  'PROGRAM_ASSESSMENT_STRATEGY',
  'PROGRAM_EVALUATION',
];

/**
 * GET /api/courses/[courseId]/pages
 * List all pages for a course, ordered by their order field.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify user has access to this course's workspace
    await assertCourseAccess(courseId, user.id);

    const pages = await prisma.page.findMany({
      where: { courseId },
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
      orderBy: {
        order: 'asc',
      },
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
    return errorResponse(error, 'Failed to fetch pages');
  }
}

/**
 * POST /api/courses/[courseId]/pages
 * Create a new page in the course.
 * Requires ADMINISTRATOR, MANAGER, DESIGNER, or FACILITATOR role.
 *
 * Request body:
 * {
 *   "title": "string (required)",
 *   "type": "PageType enum (optional, defaults to CUSTOM)"
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Verify user has permission to create pages
    // SME role cannot create pages (they can only view and comment)
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
      WorkspaceRole.FACILITATOR,
    ]);

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return Response.json(
        { error: 'Title is required and must be a non-empty string' },
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
            error: `Invalid page type. Must be one of: ${VALID_PAGE_TYPES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      pageType = body.type as PageType;
    }

    // Get the highest order value for existing pages in this course
    const maxOrderPage = await prisma.page.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrderPage?.order ?? -1) + 1;

    // Create the page
    const page = await prisma.page.create({
      data: {
        title,
        type: pageType,
        courseId,
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
        courseId: page.courseId,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        createdBy: page.createdBy,
        blockCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to create page');
  }
}
