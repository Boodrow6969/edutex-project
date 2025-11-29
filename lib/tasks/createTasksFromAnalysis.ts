import prisma from '@/lib/prisma';
import { NeedsAnalysisResult, RecommendedTask } from '@/lib/types/needsAnalysis';
import { Priority, TaskStatus, Task } from '@prisma/client';

/**
 * Map priority string from analysis to Prisma Priority enum
 */
function mapPriority(priority: RecommendedTask['priority']): Priority {
  switch (priority) {
    case 'URGENT':
      return Priority.URGENT;
    case 'HIGH':
      return Priority.HIGH;
    case 'LOW':
      return Priority.LOW;
    case 'MEDIUM':
    default:
      return Priority.MEDIUM;
  }
}

/**
 * Result of task creation including created and skipped tasks
 */
export interface CreateTasksResult {
  created: Task[];
  skipped: string[];
}

/**
 * Creates Task records from a NeedsAnalysisResult.
 *
 * @param projectId - The project to create tasks in
 * @param createdById - The user ID who is creating the tasks
 * @param analysis - The needs analysis result containing recommended tasks
 * @returns Object with created tasks and skipped task titles (duplicates)
 */
export async function createTasksFromAnalysis(
  projectId: string,
  createdById: string,
  analysis: NeedsAnalysisResult
): Promise<CreateTasksResult> {
  const { recommendedTasks } = analysis;

  if (!recommendedTasks || recommendedTasks.length === 0) {
    return { created: [], skipped: [] };
  }

  // Get existing task titles for this project to avoid duplicates
  const existingTasks = await prisma.task.findMany({
    where: { projectId },
    select: { title: true },
  });

  const existingTitles = new Set(
    existingTasks.map((t) => t.title.toLowerCase().trim())
  );

  const created: Task[] = [];
  const skipped: string[] = [];

  for (const recommendedTask of recommendedTasks) {
    const title = recommendedTask.title.trim();
    const titleLower = title.toLowerCase();

    // Skip if a task with this title already exists (case-insensitive)
    if (existingTitles.has(titleLower)) {
      skipped.push(title);
      continue;
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description: recommendedTask.description || null,
        status: TaskStatus.TODO,
        priority: mapPriority(recommendedTask.priority),
        projectId,
        createdById,
      },
    });

    created.push(task);

    // Add to existing titles to prevent duplicates within the same batch
    existingTitles.add(titleLower);
  }

  return { created, skipped };
}
