import { NextRequest } from 'next/server';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  errorResponse,
} from '@/lib/auth-helpers';
import { getProjectOverview } from '@/lib/projects/getProjectOverview';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * GET /api/projects/[projectId]/overview
 * Returns a comprehensive project overview including:
 * - Project metadata
 * - Pages list
 * - Objective statistics
 * - Task statistics
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUserOrThrow();
    const { projectId } = await context.params;

    const overview = await getProjectOverview(projectId, user.id);

    return Response.json(overview);
  } catch (error) {
    return errorResponse(error, 'Failed to fetch project overview');
  }
}
