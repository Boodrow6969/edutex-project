import prisma from '@/lib/prisma';
import { assertProjectAccess, NotFoundError } from '@/lib/auth-helpers';
import { PageType, TaskStatus, BloomLevel } from '@prisma/client';

/**
 * Page summary for overview display
 */
export interface PageSummary {
  id: string;
  title: string;
  type: PageType;
  order: number;
  createdAt: Date;
}

/**
 * Objective statistics
 */
export interface ObjectiveStats {
  total: number;
  byBloomLevel: Record<BloomLevel, number>;
  recentObjectives: Array<{
    id: string;
    title: string;
    bloomLevel: BloomLevel;
    createdAt: Date;
  }>;
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

/**
 * Complete project overview data
 */
export interface ProjectOverview {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    workspaceId: string;
  };
  pages: PageSummary[];
  objectiveStats: ObjectiveStats;
  taskStats: TaskStats;
}

/**
 * Fetches a complete project overview with pages, objectives stats, and task stats.
 * Verifies user access through workspace membership.
 *
 * @param projectId - The project ID to fetch overview for
 * @param userId - The user ID requesting access
 * @returns ProjectOverview with all summary data
 * @throws NotFoundError if project doesn't exist
 * @throws AuthorizationError if user lacks access
 */
export async function getProjectOverview(
  projectId: string,
  userId: string
): Promise<ProjectOverview> {
  // Verify user has access to this project
  await assertProjectAccess(projectId, userId);

  // Fetch project with pages
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      workspaceId: true,
      pages: {
        select: {
          id: true,
          title: true,
          type: true,
          order: true,
          createdAt: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Ensure project has a workspace (should be guaranteed by assertProjectAccess, but TypeScript needs this)
  if (!project.workspaceId) {
    throw new NotFoundError('Project does not belong to a workspace');
  }

  // Fetch objective stats using groupBy for efficiency
  const objectiveCounts = await prisma.objective.groupBy({
    by: ['bloomLevel'],
    where: { projectId },
    _count: { id: true },
  });

  // Fetch recent objectives (last 3)
  const recentObjectives = await prisma.objective.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
      bloomLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // Build objective stats
  const byBloomLevel: Record<BloomLevel, number> = {
    REMEMBER: 0,
    UNDERSTAND: 0,
    APPLY: 0,
    ANALYZE: 0,
    EVALUATE: 0,
    CREATE: 0,
  };

  let totalObjectives = 0;
  for (const count of objectiveCounts) {
    byBloomLevel[count.bloomLevel] = count._count.id;
    totalObjectives += count._count.id;
  }

  // Fetch task stats using groupBy
  const taskCountsByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { id: true },
  });

  const taskCountsByPriority = await prisma.task.groupBy({
    by: ['priority'],
    where: { projectId },
    _count: { id: true },
  });

  // Build task stats
  const byStatus: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  };

  let totalTasks = 0;
  for (const count of taskCountsByStatus) {
    byStatus[count.status] = count._count.id;
    totalTasks += count._count.id;
  }

  const byPriority = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };

  for (const count of taskCountsByPriority) {
    byPriority[count.priority] = count._count.id;
  }

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      workspaceId: project.workspaceId,
    },
    pages: project.pages,
    objectiveStats: {
      total: totalObjectives,
      byBloomLevel,
      recentObjectives,
    },
    taskStats: {
      total: totalTasks,
      byStatus,
      byPriority,
    },
  };
}
