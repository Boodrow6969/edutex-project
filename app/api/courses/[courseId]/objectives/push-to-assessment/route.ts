/**
 * Push to Assessment Builder API Route
 * POST /api/courses/[courseId]/objectives/push-to-assessment
 *
 * For each objective, creates an AssessmentItem and links it via
 * ObjectiveAssessmentLink. Skips objectives that already have links.
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

function mapBloomToAssessmentType(bloomLevel: string): string {
  switch (bloomLevel) {
    case 'REMEMBER':
      return 'MULTIPLE_CHOICE';
    case 'UNDERSTAND':
      return 'SHORT_ANSWER';
    case 'APPLY':
      return 'PERFORMANCE_CHECKLIST';
    case 'ANALYZE':
      return 'SCENARIO_BASED';
    case 'EVALUATE':
      return 'ESSAY';
    case 'CREATE':
      return 'PERFORMANCE_CHECKLIST';
    default:
      return 'MULTIPLE_CHOICE';
  }
}

function mapBloomToDifficulty(bloomLevel: string): number {
  switch (bloomLevel) {
    case 'REMEMBER':   return 1;
    case 'UNDERSTAND': return 2;
    case 'APPLY':      return 3;
    case 'ANALYZE':    return 4;
    case 'EVALUATE':   return 4;
    case 'CREATE':     return 5;
    default:           return 2;
  }
}

function buildStem(obj: {
  title: string;
  condition?: string | null;
  criteria?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(`[Assessment for: ${obj.title}]`);
  if (obj.condition) parts.push(`Context: ${obj.condition}`);
  if (obj.criteria) parts.push(`Expected performance: ${obj.criteria}`);
  parts.push('');
  parts.push('[Replace this placeholder with your assessment question/prompt]');
  return parts.join('\n');
}

function buildAssessmentRationale(obj: {
  bloomLevel: string;
  requiresAssessment: boolean;
  objectivePriority?: string | null;
  linkedTriageItem?: { text: string } | null;
}): string {
  const notes: string[] = [];
  notes.push('[Auto-generated from Learning Objectives Wizard]');
  notes.push(`Bloom's Level: ${obj.bloomLevel}`);
  notes.push(
    `Assessment Type: ${mapBloomToAssessmentType(obj.bloomLevel)} (suggested based on Bloom's level)`
  );
  if (obj.objectivePriority) notes.push(`Objective Priority: ${obj.objectivePriority}`);
  if (obj.linkedTriageItem?.text) notes.push(`Parent Task: ${obj.linkedTriageItem.text}`);
  notes.push(
    `Requires Assessment: ${obj.requiresAssessment ? 'Yes' : 'No (created for coverage)'}`
  );
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

    // 1. Fetch objectives with existing assessment links
    const objectives = await prisma.objective.findMany({
      where: { courseId },
      include: {
        linkedTriageItem: true,
        assessmentLinks: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Edge case: no objectives
    if (objectives.length === 0) {
      return Response.json({
        success: true,
        created: 0,
        skipped: 0,
        message: 'No objectives to push.',
      });
    }

    // 2. Filter out already-linked objectives
    const newObjectives = objectives.filter((obj) => obj.assessmentLinks.length === 0);
    const skipped = objectives.length - newObjectives.length;

    if (newObjectives.length === 0) {
      return Response.json({
        success: true,
        created: 0,
        skipped,
        message: `All ${skipped} objectives already have assessment items.`,
      });
    }

    // 3. Get current max order for assessment items
    const maxOrderResult = await prisma.assessmentItem.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const startOrder = (maxOrderResult._max.order ?? -1) + 1;

    // 4. Create AssessmentItem + ObjectiveAssessmentLink per objective in a transaction
    const createdIds = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];

      for (let i = 0; i < newObjectives.length; i++) {
        const obj = newObjectives[i];

        const assessmentItem = await tx.assessmentItem.create({
          data: {
            courseId,
            type: mapBloomToAssessmentType(obj.bloomLevel) as never,
            stem: buildStem(obj),
            bloomLevel: obj.bloomLevel,
            difficulty: mapBloomToDifficulty(obj.bloomLevel),
            rationale: buildAssessmentRationale(obj),
            aiGenerated: false,
            order: startOrder + i,
          },
        });

        await tx.objectiveAssessmentLink.create({
          data: {
            objectiveId: obj.id,
            assessmentItemId: assessmentItem.id,
            bloomLevelAssessed: obj.bloomLevel,
            isAligned: true,
            alignmentNotes: `Auto-generated from Learning Objectives Wizard. ${
              obj.requiresAssessment
                ? 'Objective marked as requiring assessment.'
                : 'Assessment item created for coverage — objective not explicitly marked as requiring assessment.'
            }`,
          },
        });

        ids.push(assessmentItem.id);
      }

      return ids;
    });

    return Response.json({
      success: true,
      created: createdIds.length,
      skipped,
      message:
        `${createdIds.length} assessment item${createdIds.length !== 1 ? 's' : ''} created and linked.` +
        (skipped > 0 ? ` ${skipped} objective${skipped !== 1 ? 's' : ''} already had assessments.` : ''),
    });
  } catch (error) {
    return errorResponse(error, 'Failed to push objectives to assessment builder');
  }
}
