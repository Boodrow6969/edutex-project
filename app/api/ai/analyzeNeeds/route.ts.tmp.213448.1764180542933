import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

import {
  getCurrentUserOrThrow,
  assertProjectAccess,
  errorResponse,
  NotFoundError,
} from '@/lib/auth-helpers';
import { analyzeNeedsAnalysis } from '@/lib/ai/instructional-design';

/**
 * POST /api/ai/analyzeNeeds
 * Analyze needs analysis content using AI and return structured insights.
 *
 * Request body (one of):
 * - { pageId: string } - Fetch content from page blocks
 * - { content: string } - Direct content input
 *
 * Returns: { result: NeedsAnalysisResult }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserOrThrow();
    const body = await request.json();

    let content: string;

    if (body.pageId && typeof body.pageId === 'string') {
      // Fetch content from page blocks
      const page = await prisma.page.findUnique({
        where: { id: body.pageId },
        select: {
          id: true,
          projectId: true,
          blocks: {
            orderBy: { order: 'asc' },
            select: {
              type: true,
              content: true,
            },
          },
        },
      });

      if (!page) {
        throw new NotFoundError('Page not found');
      }

      // Verify user has access to this project
      await assertProjectAccess(page.projectId, user.id);

      // Extract text content from blocks
      const textParts: string[] = [];

      for (const block of page.blocks) {
        const blockContent = block.content as Record<string, unknown>;

        // Extract text from various block types
        switch (block.type) {
          case 'PARAGRAPH':
          case 'HEADING_1':
          case 'HEADING_2':
          case 'HEADING_3':
          case 'CALLOUT':
          case 'BULLETED_LIST':
          case 'NUMBERED_LIST':
          case 'PERFORMANCE_PROBLEM':
          case 'INSTRUCTIONAL_GOAL':
          case 'TASK_STEP':
            if (typeof blockContent?.text === 'string' && blockContent.text.trim()) {
              textParts.push(blockContent.text.trim());
            }
            break;
          case 'LEARNING_OBJECTIVE':
            // Learning objectives have text plus additional metadata
            if (typeof blockContent?.text === 'string' && blockContent.text.trim()) {
              let objText = blockContent.text.trim();
              if (typeof blockContent?.bloomLevel === 'string') {
                objText += ` (Bloom Level: ${blockContent.bloomLevel})`;
              }
              textParts.push(objText);
            }
            break;
          default:
            // Try to extract text field from unknown block types
            if (typeof blockContent?.text === 'string' && blockContent.text.trim()) {
              textParts.push(blockContent.text.trim());
            }
        }
      }

      content = textParts.join('\n\n');

      if (!content.trim()) {
        return Response.json(
          { error: 'No text content found in page blocks' },
          { status: 400 }
        );
      }
    } else if (body.content && typeof body.content === 'string') {
      // Direct content input
      content = body.content.trim();

      if (!content) {
        return Response.json(
          { error: 'Content cannot be empty' },
          { status: 400 }
        );
      }
    } else {
      return Response.json(
        { error: 'Either pageId or content must be provided' },
        { status: 400 }
      );
    }

    // Call the AI analysis function
    const result = await analyzeNeedsAnalysis(content);

    return Response.json({ result });
  } catch (error) {
    return errorResponse(error, 'Failed to analyze needs');
  }
}
