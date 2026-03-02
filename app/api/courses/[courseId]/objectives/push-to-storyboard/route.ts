/**
 * Push to Storyboard API Route
 * POST /api/courses/[courseId]/objectives/push-to-storyboard
 *
 * For each learning objective, creates a CONTENT_SCREEN block
 * on the course's storyboard page. Skips objectives already pushed.
 */

import prisma from '@/lib/prisma';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function mapBloomToScreenType(bloomLevel?: string | null): string {
  switch (bloomLevel?.toUpperCase()) {
    case 'REMEMBER':
    case 'UNDERSTAND':
      return 'content';
    case 'APPLY':
      return 'practice';
    case 'ANALYZE':
    case 'EVALUATE':
      return 'scenario';
    case 'CREATE':
      return 'practice';
    default:
      return 'content';
  }
}

function mapBloomToInteraction(bloomLevel?: string | null): string {
  switch (bloomLevel?.toUpperCase()) {
    case 'REMEMBER':
    case 'UNDERSTAND':
      return 'knowledge_check';
    case 'APPLY':
    case 'CREATE':
      return 'guided_practice';
    case 'ANALYZE':
    case 'EVALUATE':
      return 'scenario';
    default:
      return '';
  }
}

interface ObjectiveData {
  id: string;
  title: string;
  description: string;
  condition: string | null;
  criteria: string | null;
  bloomLevel: string | null;
  objectivePriority: string | null;
  parentTaskTitle: string | null;
}

function buildOnScreenText(obj: ObjectiveData): string {
  const parts: string[] = [];
  if (obj.title) parts.push(`Objective: ${obj.title}`);
  if (obj.condition) parts.push(`Condition: ${obj.condition}`);
  if (obj.criteria) parts.push(`Success Criteria: ${obj.criteria}`);
  return parts.join('\n\n');
}

function buildDesignerNotes(obj: ObjectiveData): string {
  const notes: string[] = [];
  notes.push('[Auto-generated from Learning Objectives Wizard]');
  if (obj.bloomLevel) notes.push(`Bloom's Level: ${obj.bloomLevel}`);
  if (obj.objectivePriority) notes.push(`Priority: ${obj.objectivePriority}`);
  if (obj.parentTaskTitle) notes.push(`Parent Task: ${obj.parentTaskTitle}`);
  if (obj.description && obj.description !== obj.title) {
    notes.push(`Full Description: ${obj.description}`);
  }
  return notes.join('\n');
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;
    const user = await getCurrentUserOrThrow();
    await assertCourseAccess(courseId, user.id);

    // 1. Fetch objectives for this course
    const objectives = await prisma.objective.findMany({
      where: { courseId },
      include: {
        linkedTriageItem: { select: { text: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Edge case: no objectives
    if (objectives.length === 0) {
      return Response.json({
        success: true,
        storyboardPageId: null,
        created: 0,
        skipped: 0,
        message: 'No objectives to push.',
      });
    }

    // 2. Find or create the storyboard page
    let storyboardPage = await prisma.page.findFirst({
      where: { courseId, type: 'STORYBOARD' },
    });

    if (!storyboardPage) {
      storyboardPage = await prisma.page.create({
        data: {
          title: 'Storyboard',
          type: 'STORYBOARD',
          courseId,
          createdById: user.id,
        },
      });
    }

    // 3. Check for existing pushed blocks to avoid duplicates
    const existingBlocks = await prisma.block.findMany({
      where: {
        pageId: storyboardPage.id,
        type: 'CONTENT_SCREEN',
      },
      select: { content: true },
    });

    const pushedObjectiveIds = new Set<string>();
    for (const block of existingBlocks) {
      const content = block.content as Record<string, unknown> | null;
      if (content?.objectiveId && typeof content.objectiveId === 'string') {
        pushedObjectiveIds.add(content.objectiveId);
      }
    }

    const newObjectives = objectives.filter(
      (obj) => !pushedObjectiveIds.has(obj.id)
    );
    const skipped = objectives.length - newObjectives.length;

    if (newObjectives.length === 0) {
      return Response.json({
        success: true,
        storyboardPageId: storyboardPage.id,
        created: 0,
        skipped,
        message: `All ${skipped} objectives are already on the storyboard.`,
      });
    }

    // 4. Get current max order so new blocks append at the end
    const maxOrderResult = await prisma.block.aggregate({
      where: { pageId: storyboardPage.id },
      _max: { order: true },
    });
    const maxOrder = maxOrderResult._max.order ?? -1;

    // 5. Create one CONTENT_SCREEN block per un-pushed objective
    const blockData = newObjectives.map((obj, index) => {
      const objData: ObjectiveData = {
        id: obj.id,
        title: obj.title,
        description: obj.description,
        condition: obj.condition,
        criteria: obj.criteria,
        bloomLevel: obj.bloomLevel,
        objectivePriority: obj.objectivePriority,
        parentTaskTitle: obj.linkedTriageItem?.text ?? null,
      };

      return {
        pageId: storyboardPage!.id,
        type: 'CONTENT_SCREEN' as const,
        order: maxOrder + index + 1,
        content: {
          objectiveId: obj.id,
          screenId: `OBJ-${String(index + 1).padStart(3, '0')}`,
          screenTitle: obj.title,
          screenType: mapBloomToScreenType(obj.bloomLevel),
          onScreenText: buildOnScreenText(objData),
          voiceoverScript: '',
          visuals: '',
          interactionType: mapBloomToInteraction(obj.bloomLevel),
          interactionDetails: '',
          designerNotes: buildDesignerNotes(objData),
          developerNotes: '',
          duration: '',
        },
      };
    });

    await prisma.block.createMany({ data: blockData });

    return Response.json({
      success: true,
      storyboardPageId: storyboardPage.id,
      created: newObjectives.length,
      skipped,
      message:
        `${newObjectives.length} objective${newObjectives.length !== 1 ? 's' : ''} pushed to storyboard.` +
        (skipped > 0 ? ` ${skipped} already present.` : ''),
    });
  } catch (error) {
    return errorResponse(error, 'Failed to push objectives to storyboard');
  }
}
