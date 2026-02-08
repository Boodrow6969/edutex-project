import prisma from '@/lib/prisma';
import { assertCourseAccess, NotFoundError } from '@/lib/auth-helpers';
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
 * Complete course overview data
 */
export interface CourseOverview {
  course: {
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
 * Fetches a complete course overview with pages, objectives stats, and task stats.
 * Verifies user access through workspace membership.
 *
 * @param courseId - The course ID to fetch overview for
 * @param userId - The user ID requesting access
 * @returns CourseOverview with all summary data
 * @throws NotFoundError if course doesn't exist
 * @throws AuthorizationError if user lacks access
 */
export async function getCourseOverview(
  courseId: string,
  userId: string
): Promise<CourseOverview> {
  // Verify user has access to this course
  await assertCourseAccess(courseId, userId);

  // Fetch course with pages
  const course = await prisma.course.findUnique({
    where: { id: courseId },
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

  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Ensure course has a workspace (should be guaranteed by assertCourseAccess, but TypeScript needs this)
  if (!course.workspaceId) {
    throw new NotFoundError('Course does not belong to a workspace');
  }

  // Fetch objective stats using groupBy for efficiency
  const objectiveCounts = await prisma.objective.groupBy({
    by: ['bloomLevel'],
    where: { courseId },
    _count: { id: true },
  });

  // Fetch recent objectives (last 3)
  const recentObjectives = await prisma.objective.findMany({
    where: { courseId },
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
    where: { courseId },
    _count: { id: true },
  });

  const taskCountsByPriority = await prisma.task.groupBy({
    by: ['priority'],
    where: { courseId },
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
    course: {
      id: course.id,
      name: course.name,
      description: course.description,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      workspaceId: course.workspaceId,
    },
    pages: course.pages,
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
