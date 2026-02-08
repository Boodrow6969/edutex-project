import { NextRequest } from 'next/server';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { createTasksFromAnalysis } from '@/lib/tasks/createTasksFromAnalysis';
import { NeedsAnalysisResult } from '@/lib/types/needsAnalysis';
import { WorkspaceRole } from '@prisma/client';

/**
 * POST /api/tasks/fromNeedsAnalysis
 * Create tasks from needs analysis recommendations.
 *
 * Request body:
 * {
 *   courseId: string,
 *   analysis: NeedsAnalysisResult
 * }
 *
 * Returns: { created: Task[], skipped: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const body = await request.json();

    // Validate courseId
    if (!body.courseId || typeof body.courseId !== 'string') {
      return Response.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    // Validate analysis object
    if (!body.analysis || typeof body.analysis !== 'object') {
      return Response.json(
        { error: 'analysis object is required' },
        { status: 400 }
      );
    }

    const analysis = body.analysis as NeedsAnalysisResult;

    // Validate recommendedTasks exists
    if (!Array.isArray(analysis.recommendedTasks)) {
      return Response.json(
        { error: 'analysis.recommendedTasks must be an array' },
        { status: 400 }
      );
    }

    // Verify user has permission to create tasks in this course
    // Designers and above can create tasks
    await assertCourseAccess(body.courseId, user.id, [
      WorkspaceRole.ADMINISTRATOR,
      WorkspaceRole.MANAGER,
      WorkspaceRole.DESIGNER,
    ]);

    // Create tasks from analysis
    const result = await createTasksFromAnalysis(
      body.courseId,
      user.id,
      analysis
    );

    return Response.json({
      created: result.created,
      skipped: result.skipped,
      message: result.created.length > 0
        ? `Created ${result.created.length} task(s)${result.skipped.length > 0 ? `, skipped ${result.skipped.length} duplicate(s)` : ''}`
        : result.skipped.length > 0
          ? 'All tasks already exist'
          : 'No tasks to create',
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Failed to create tasks from analysis');
  }
}
