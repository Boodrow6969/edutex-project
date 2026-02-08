import { NextRequest } from 'next/server';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  errorResponse,
} from '@/lib/auth-helpers';
import { getCourseOverview } from '@/lib/courses/getCourseOverview';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/overview
 * Returns a comprehensive course overview including:
 * - Course metadata
 * - Pages list
 * - Objective statistics
 * - Task statistics
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { courseId } = await context.params;

    const overview = await getCourseOverview(courseId, user.id);

    return Response.json(overview);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch course overview');
  }
}
