import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { WorkspaceRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string; blueprintId: string }>;
}

/**
 * GET /api/courses/[courseId]/blueprints/[blueprintId]/objectives
 * Get all objectives for a blueprint.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, blueprintId } = await params;

    // Verify user has access to this course
    await assertCourseAccess(courseId, user.id);

    // Verify blueprint exists and belongs to course
    const blueprint = await prisma.learningBlueprint.findUnique({
      where: { id: blueprintId },
      select: { id: true, courseId: true },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    if (blueprint.courseId !== courseId) {
      throw new NotFoundError('Blueprint does not belong to this course');
    }

    const objectives = await prisma.blueprintObjective.findMany({
      where: { blueprintId },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(objectives);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch objectives');
  }
}

/**
 * POST /api/courses/[courseId]/blueprints/[blueprintId]/objectives
 * Create a new objective for a blueprint.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 *
 * Request body:
 * {
 *   "text": "string",
 *   "bloomLevel": "string",
 *   "priority": "string",
 *   "requiresAssessment": boolean
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId, blueprintId } = await params;

    // Verify user has permission to create objectives
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify blueprint exists and belongs to course
    const blueprint = await prisma.learningBlueprint.findUnique({
      where: { id: blueprintId },
      select: { id: true, courseId: true },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    if (blueprint.courseId !== courseId) {
      throw new NotFoundError('Blueprint does not belong to this course');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.text || typeof body.text !== 'string' || body.text.trim() === '') {
      return Response.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.bloomLevel || typeof body.bloomLevel !== 'string' || body.bloomLevel.trim() === '') {
      return Response.json(
        { error: 'Bloom level is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.priority || typeof body.priority !== 'string' || body.priority.trim() === '') {
      return Response.json(
        { error: 'Priority is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof body.requiresAssessment !== 'boolean') {
      return Response.json(
        { error: 'requiresAssessment must be a boolean' },
        { status: 400 }
      );
    }

    const objective = await prisma.blueprintObjective.create({
      data: {
        blueprintId,
        text: body.text.trim(),
        bloomLevel: body.bloomLevel.trim(),
        priority: body.priority.trim(),
        requiresAssessment: body.requiresAssessment,
      },
    });

    return Response.json(objective, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create objective');
  }
}
