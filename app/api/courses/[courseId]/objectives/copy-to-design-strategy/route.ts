/**
 * Copy to Design Strategy API Route
 * POST /api/courses/[courseId]/objectives/copy-to-design-strategy
 *
 * Upserts a DesignStrategy record (objective snapshot + lesson stubs)
 * and returns a pre-filled .docx file for download.
 */

import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { generateDesignStrategyDocx } from '@/lib/export/design-strategy-to-docx';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;
    const user = await getCurrentUserOrThrow();
    await assertCourseAccess(courseId, user.id);

    // 1. Fetch course with objectives and triage items
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        objectives: {
          include: { linkedTriageItem: true },
          orderBy: { sortOrder: 'asc' },
        },
        triageItems: { orderBy: { sortOrder: 'asc' } },
        designStrategy: true,
      },
    });

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // 2. No objectives edge case
    if (course.objectives.length === 0) {
      return Response.json({
        success: true,
        created: false,
        downloaded: false,
        message: 'No objectives to export.',
      });
    }

    // 3. Build objectives snapshot
    const objectivesSnapshot = course.objectives.map((obj) => ({
      id: obj.id,
      title: obj.title,
      bloomLevel: obj.bloomLevel,
      priority: obj.objectivePriority,
      condition: obj.condition,
      criteria: obj.criteria,
      requiresAssessment: obj.requiresAssessment,
      parentTask: obj.linkedTriageItem?.text ?? null,
    }));

    // 4. Build lesson stubs grouped by parent task
    const taskGroups = new Map<string, { title: string; objectiveIds: string[] }>();
    const orphanObjectiveIds: string[] = [];

    for (const obj of course.objectives) {
      if (obj.linkedTriageItem) {
        const key = obj.linkedTriageItemId!;
        if (!taskGroups.has(key)) {
          taskGroups.set(key, { title: obj.linkedTriageItem.text, objectiveIds: [] });
        }
        taskGroups.get(key)!.objectiveIds.push(obj.id);
      } else {
        orphanObjectiveIds.push(obj.id);
      }
    }

    const lessonStubs = [
      ...Array.from(taskGroups.values()).map((g) => ({
        title: g.title,
        objectiveIds: g.objectiveIds,
        duration: '',
        format: '',
      })),
      ...(orphanObjectiveIds.length > 0
        ? [
            {
              title: 'General',
              objectiveIds: orphanObjectiveIds,
              duration: '',
              format: '',
            },
          ]
        : []),
    ];

    // 5. Upsert DesignStrategy record
    const designStrategy = await prisma.designStrategy.upsert({
      where: { courseId },
      create: {
        courseId,
        objectivesSnapshot,
        lessonStubs,
        status: 'DRAFT',
      },
      update: {
        objectivesSnapshot,
        lessonStubs,
        generatedAt: new Date(),
        // Do NOT overwrite user-edited fields:
        // businessChallenge, businessGoal, evaluationPlan,
        // solutionComponents, communicationPlan
      },
    });

    // 6. Bloom distribution
    const bloomDistribution: Record<string, number> = {};
    for (const obj of course.objectives) {
      const level = obj.bloomLevel || 'UNKNOWN';
      bloomDistribution[level] = (bloomDistribution[level] || 0) + 1;
    }

    // 7. Build objective ID → title lookup for lesson stubs
    const objTitleMap = new Map<string, string>();
    for (const obj of course.objectives) {
      objTitleMap.set(obj.id, obj.title);
    }

    const lessonStubsWithTitles = lessonStubs.map((stub) => ({
      ...stub,
      objectiveTitles: stub.objectiveIds.map((id) => objTitleMap.get(id) || id),
    }));

    // 8. Generate .docx
    const buffer = await generateDesignStrategyDocx({
      courseName: course.name,
      courseType: course.courseType ?? undefined,
      exportDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      businessChallenge: designStrategy.businessChallenge ?? undefined,
      businessGoal: designStrategy.businessGoal ?? undefined,
      trainingPercent: designStrategy.trainingPercent ?? undefined,
      solutionComponents: (designStrategy.solutionComponents as Array<{ component: string; percentage: number; description?: string }>) ?? undefined,
      evaluationPlan: (designStrategy.evaluationPlan as { level1?: string; level2?: string; level3?: string; level4?: string }) ?? undefined,
      objectives: course.objectives.map((obj) => ({
        title: obj.title,
        bloomLevel: obj.bloomLevel,
        priority: obj.objectivePriority ?? undefined,
        condition: obj.condition ?? undefined,
        criteria: obj.criteria ?? undefined,
        parentTaskTitle: obj.linkedTriageItem?.text ?? undefined,
        requiresAssessment: obj.requiresAssessment,
      })),
      lessonStubs: lessonStubsWithTitles,
      bloomDistribution,
    });

    // 9. Return .docx
    const safeName = course.name.replace(/[^a-zA-Z0-9]/g, '_');
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Design_Strategy_${safeName}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    return errorResponse(error, 'Failed to generate Design Strategy');
  }
}
