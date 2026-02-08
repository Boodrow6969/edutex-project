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
  params: Promise<{ courseId: string }>;
}

/**
 * POST /api/courses/[courseId]/blueprints
 * Create a new LearningBlueprint with PerformanceNeed.
 * Requires ADMINISTRATOR, MANAGER, or DESIGNER role.
 *
 * Request body:
 * {
 *   "title": "string",
 *   "audience": "string",
 *   "deliveryMode": "string",
 *   "timeBudgetMinutes": number,
 *   "problemStatement": "string",
 *   "desiredBehavior": "string",
 *   "consequences": "string"
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await params;

    // Temporary debug log to verify courseId is correctly extracted
    console.log('[Blueprint API] Received courseId:', courseId, 'Type:', typeof courseId);

    // Verify user has permission to create blueprints
    await assertCourseAccess(courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return Response.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.audience || typeof body.audience !== 'string' || body.audience.trim() === '') {
      return Response.json(
        { error: 'Audience is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.deliveryMode || typeof body.deliveryMode !== 'string' || body.deliveryMode.trim() === '') {
      return Response.json(
        { error: 'Delivery mode is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof body.timeBudgetMinutes !== 'number' || body.timeBudgetMinutes < 0) {
      return Response.json(
        { error: 'Time budget minutes must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!body.problemStatement || typeof body.problemStatement !== 'string' || body.problemStatement.trim() === '') {
      return Response.json(
        { error: 'Problem statement is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.desiredBehavior || typeof body.desiredBehavior !== 'string' || body.desiredBehavior.trim() === '') {
      return Response.json(
        { error: 'Desired behavior is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.consequences || typeof body.consequences !== 'string' || body.consequences.trim() === '') {
      return Response.json(
        { error: 'Consequences is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Create blueprint with performance need in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Debug: Check if tx has learningBlueprint model
      if (!tx.learningBlueprint) {
        console.error('[Blueprint API] Transaction object missing learningBlueprint model');
        console.error('[Blueprint API] Available models:', Object.keys(tx));
        throw new Error('Prisma client transaction missing learningBlueprint model. Try running: npx prisma generate');
      }

      // Create LearningBlueprint
      const blueprint = await tx.learningBlueprint.create({
        data: {
          courseId,
          title: body.title.trim(),
          audience: body.audience.trim(),
          deliveryMode: body.deliveryMode.trim(),
          timeBudgetMinutes: body.timeBudgetMinutes,
          status: 'draft',
        },
      });

      // Create PerformanceNeed
      const performanceNeed = await tx.performanceNeed.create({
        data: {
          blueprintId: blueprint.id,
          problemStatement: body.problemStatement.trim(),
          desiredBehavior: body.desiredBehavior.trim(),
          consequences: body.consequences.trim(),
        },
      });

      return { blueprint, performanceNeed };
    });

    return Response.json({
      id: result.blueprint.id,
      title: result.blueprint.title,
      audience: result.blueprint.audience,
      deliveryMode: result.blueprint.deliveryMode,
      timeBudgetMinutes: result.blueprint.timeBudgetMinutes,
      status: result.blueprint.status,
      createdAt: result.blueprint.createdAt,
      updatedAt: result.blueprint.updatedAt,
      performanceNeed: {
        id: result.performanceNeed.id,
        problemStatement: result.performanceNeed.problemStatement,
        desiredBehavior: result.performanceNeed.desiredBehavior,
        consequences: result.performanceNeed.consequences,
      },
    });
  } catch (error) {
    return errorResponse(error, 'Failed to create blueprint');
  }
}
