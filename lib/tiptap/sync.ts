/**
 * Synchronization utilities for converting between Block[] (database) and TipTap JSONContent.
 *
 * This module handles the bidirectional conversion:
 * - blocksToTipTap: Converts Block[] from database to TipTap document structure
 * - tipTapToBlocks: Converts TipTap document back to Block[] for persistence
 */

import { JSONContent } from '@tiptap/core';
import { BlockType } from '@prisma/client';
import { Block } from '@/lib/types/blocks';

// =============================================================================
// Types
// =============================================================================

export interface BlockUpdate {
  id?: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
}

export interface SyncResult {
  toCreate: BlockUpdate[];
  toUpdate: Array<{ id: string; content: Record<string, unknown> }>;
  toDelete: string[];
  orderUpdates: Array<{ id: string; order: number }>;
}

// =============================================================================
// Block[] -> TipTap JSONContent
// =============================================================================

/**
 * Convert an array of Blocks from the database into TipTap JSON document format.
 */
export function blocksToTipTap(blocks: Block[]): JSONContent {
  if (!blocks || blocks.length === 0) {
    // Return empty document with a placeholder paragraph
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    };
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  const content = sortedBlocks.map(blockToNode).filter(Boolean) as JSONContent[];

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }],
  };
}

/**
 * Helper to safely get string from unknown content
 */
function getString(content: Record<string, unknown>, key: string): string {
  const value = content[key];
  return typeof value === 'string' ? value : '';
}

/**
 * Helper to safely get array from unknown content
 */
function getStringArray(content: Record<string, unknown>, key: string): string[] {
  const value = content[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * Convert a single Block to a TipTap node.
 */
function blockToNode(block: Block): JSONContent | null {
  const blockContent = block.content as Record<string, unknown>;

  switch (block.type) {
    case 'PARAGRAPH': {
      const text = getString(blockContent, 'text');
      return {
        type: 'paragraph',
        attrs: { blockId: block.id },
        content: text ? [{ type: 'text', text }] : [],
      };
    }

    case 'HEADING_1': {
      const text = getString(blockContent, 'text');
      return {
        type: 'heading',
        attrs: { level: 1, blockId: block.id },
        content: text ? [{ type: 'text', text }] : [],
      };
    }

    case 'HEADING_2': {
      const text = getString(blockContent, 'text');
      return {
        type: 'heading',
        attrs: { level: 2, blockId: block.id },
        content: text ? [{ type: 'text', text }] : [],
      };
    }

    case 'HEADING_3': {
      const text = getString(blockContent, 'text');
      return {
        type: 'heading',
        attrs: { level: 3, blockId: block.id },
        content: text ? [{ type: 'text', text }] : [],
      };
    }

    case 'BULLETED_LIST': {
      const items = getStringArray(blockContent, 'items');
      return {
        type: 'bulletList',
        attrs: { blockId: block.id },
        content: items.map((item) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: item ? [{ type: 'text', text: item }] : [],
            },
          ],
        })),
      };
    }

    case 'NUMBERED_LIST': {
      const items = getStringArray(blockContent, 'items');
      return {
        type: 'orderedList',
        attrs: { blockId: block.id },
        content: items.map((item) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: item ? [{ type: 'text', text: item }] : [],
            },
          ],
        })),
      };
    }

    case 'CALLOUT': {
      const text = getString(blockContent, 'text');
      const variant = getString(blockContent, 'variant') || 'info';
      return {
        type: 'blockquote',
        attrs: { blockId: block.id, variant },
        content: [
          {
            type: 'paragraph',
            content: text ? [{ type: 'text', text }] : [],
          },
        ],
      };
    }

    // M2: Storyboard blocks
    case 'CONTENT_SCREEN': {
      return {
        type: 'contentScreen',
        attrs: {
          blockId: block.id,
          // Core fields
          screenId: getString(blockContent, 'screenId'),
          screenTitle: getString(blockContent, 'screenTitle'),
          screenType: getString(blockContent, 'screenType') || 'content',
          duration: getString(blockContent, 'duration'),
          designerNotes: getString(blockContent, 'designerNotes') || getString(blockContent, 'notes'),
          developerNotes: getString(blockContent, 'developerNotes'),

          // Content type fields
          visuals: getString(blockContent, 'visuals'),
          onScreenText: getString(blockContent, 'onScreenText'),
          voiceoverScript: getString(blockContent, 'voiceoverScript'),
          interactionType: getString(blockContent, 'interactionType') || 'none',
          interactionDetails: getString(blockContent, 'interactionDetails'),

          // Title/Intro type fields
          titleCardText: getString(blockContent, 'titleCardText'),
          briefVoiceover: getString(blockContent, 'briefVoiceover'),
          backgroundNotes: getString(blockContent, 'backgroundNotes'),

          // Video type fields
          videoSource: getString(blockContent, 'videoSource'),
          scenes: blockContent.scenes || [],

          // Practice type fields
          activityType: getString(blockContent, 'activityType') || 'other',
          activityDescription: getString(blockContent, 'activityDescription'),
          instructions: getString(blockContent, 'instructions'),
          hints: getString(blockContent, 'hints'),
          correctFeedback: getString(blockContent, 'correctFeedback'),
          incorrectFeedback: getString(blockContent, 'incorrectFeedback'),

          // Assessment type fields
          questionType: getString(blockContent, 'questionType') || 'multiple_choice',
          questionText: getString(blockContent, 'questionText'),
          answerOptions: blockContent.answerOptions || [],
          points: typeof blockContent.points === 'number' ? blockContent.points : 1,

          // Scenario type fields
          scenarioSetup: getString(blockContent, 'scenarioSetup'),
          decisionPrompt: getString(blockContent, 'decisionPrompt'),
          scenarioOptions: blockContent.scenarioOptions || [],
          debrief: getString(blockContent, 'debrief'),
        },
      };
    }

    case 'LEARNING_OBJECTIVES_IMPORT': {
      const objectives = blockContent.objectives;
      return {
        type: 'learningObjectivesImport',
        attrs: {
          blockId: block.id,
          importedAt: getString(blockContent, 'importedAt'),
          objectives: Array.isArray(objectives) ? objectives : [],
          displayMode: getString(blockContent, 'displayMode') || 'detailed',
          projectId: getString(blockContent, 'projectId'),
        },
      };
    }

    // Legacy storyboard frame - convert to paragraph for now (full migration in Milestone 4)
    case 'STORYBOARD_FRAME': {
      const text = getString(blockContent, 'sceneTitle') || getString(blockContent, 'script') || '';
      return {
        type: 'paragraph',
        attrs: { blockId: block.id, originalType: 'STORYBOARD_FRAME' },
        content: text ? [{ type: 'text', text: `[Storyboard Frame: ${text}]` }] : [],
      };
    }

    default:
      // For unknown block types, render as paragraph with JSON
      console.warn(`Unknown block type: ${block.type}`);
      return {
        type: 'paragraph',
        attrs: { blockId: block.id, originalType: block.type },
        content: [{ type: 'text', text: `[${block.type}]` }],
      };
  }
}

// =============================================================================
// TipTap JSONContent -> Block[]
// =============================================================================

/**
 * Convert TipTap document back to Block updates for persistence.
 * Compares with existing blocks to determine creates, updates, and deletes.
 */
export function tipTapToBlocks(
  doc: JSONContent,
  existingBlocks: Block[]
): SyncResult {
  const existingBlockMap = new Map(existingBlocks.map((b) => [b.id, b]));
  const processedIds = new Set<string>();

  const toCreate: BlockUpdate[] = [];
  const toUpdate: Array<{ id: string; content: Record<string, unknown> }> = [];
  const orderUpdates: Array<{ id: string; order: number }> = [];

  if (!doc.content) {
    return {
      toCreate: [],
      toUpdate: [],
      toDelete: Array.from(existingBlockMap.keys()),
      orderUpdates: [],
    };
  }

  doc.content.forEach((node, index) => {
    const blockId = node.attrs?.blockId as string | undefined;
    const { type, content } = nodeToBlock(node);

    if (blockId && existingBlockMap.has(blockId)) {
      // Update existing block
      processedIds.add(blockId);
      const existingBlock = existingBlockMap.get(blockId)!;

      // Check if content changed
      const contentChanged = JSON.stringify(existingBlock.content) !== JSON.stringify(content);
      if (contentChanged) {
        toUpdate.push({ id: blockId, content });
      }

      // Check if order changed
      if (existingBlock.order !== index) {
        orderUpdates.push({ id: blockId, order: index });
      }
    } else {
      // Create new block
      toCreate.push({
        type,
        content,
        order: index,
      });
    }
  });

  // Find blocks to delete (exist in DB but not in document)
  const toDelete = Array.from(existingBlockMap.keys()).filter(
    (id) => !processedIds.has(id)
  );

  return { toCreate, toUpdate, toDelete, orderUpdates };
}

/**
 * Convert a TipTap node to BlockType and content.
 */
function nodeToBlock(node: JSONContent): { type: BlockType; content: Record<string, unknown> } {
  switch (node.type) {
    case 'paragraph': {
      const text = extractTextFromNode(node);
      return {
        type: 'PARAGRAPH',
        content: { text },
      };
    }

    case 'heading': {
      const level = (node.attrs?.level as number) || 1;
      const text = extractTextFromNode(node);
      const type: BlockType = level === 1 ? 'HEADING_1' : level === 2 ? 'HEADING_2' : 'HEADING_3';
      return {
        type,
        content: { text, level },
      };
    }

    case 'bulletList': {
      const items = extractListItems(node);
      return {
        type: 'BULLETED_LIST',
        content: { items },
      };
    }

    case 'orderedList': {
      const items = extractListItems(node);
      return {
        type: 'NUMBERED_LIST',
        content: { items },
      };
    }

    case 'blockquote': {
      const text = extractTextFromNode(node);
      const variant = (node.attrs?.variant as string) || 'info';
      return {
        type: 'CALLOUT',
        content: { text, variant },
      };
    }

    // M2: Storyboard blocks
    case 'contentScreen': {
      return {
        type: 'CONTENT_SCREEN',
        content: {
          // Core fields
          screenId: (node.attrs?.screenId as string) || '',
          screenTitle: (node.attrs?.screenTitle as string) || '',
          screenType: (node.attrs?.screenType as string) || 'content',
          duration: (node.attrs?.duration as string) || '',
          designerNotes: (node.attrs?.designerNotes as string) || '',
          developerNotes: (node.attrs?.developerNotes as string) || '',

          // Content type fields
          visuals: (node.attrs?.visuals as string) || '',
          onScreenText: (node.attrs?.onScreenText as string) || '',
          voiceoverScript: (node.attrs?.voiceoverScript as string) || '',
          interactionType: (node.attrs?.interactionType as string) || 'none',
          interactionDetails: (node.attrs?.interactionDetails as string) || '',

          // Title/Intro type fields
          titleCardText: (node.attrs?.titleCardText as string) || '',
          briefVoiceover: (node.attrs?.briefVoiceover as string) || '',
          backgroundNotes: (node.attrs?.backgroundNotes as string) || '',

          // Video type fields
          videoSource: (node.attrs?.videoSource as string) || '',
          scenes: node.attrs?.scenes || [],

          // Practice type fields
          activityType: (node.attrs?.activityType as string) || 'other',
          activityDescription: (node.attrs?.activityDescription as string) || '',
          instructions: (node.attrs?.instructions as string) || '',
          hints: (node.attrs?.hints as string) || '',
          correctFeedback: (node.attrs?.correctFeedback as string) || '',
          incorrectFeedback: (node.attrs?.incorrectFeedback as string) || '',

          // Assessment type fields
          questionType: (node.attrs?.questionType as string) || 'multiple_choice',
          questionText: (node.attrs?.questionText as string) || '',
          answerOptions: node.attrs?.answerOptions || [],
          points: typeof node.attrs?.points === 'number' ? node.attrs.points : 1,

          // Scenario type fields
          scenarioSetup: (node.attrs?.scenarioSetup as string) || '',
          decisionPrompt: (node.attrs?.decisionPrompt as string) || '',
          scenarioOptions: node.attrs?.scenarioOptions || [],
          debrief: (node.attrs?.debrief as string) || '',
        },
      };
    }

    case 'learningObjectivesImport': {
      const objectives = node.attrs?.objectives;
      return {
        type: 'LEARNING_OBJECTIVES_IMPORT',
        content: {
          importedAt: (node.attrs?.importedAt as string) || '',
          objectives: Array.isArray(objectives) ? objectives : [],
          displayMode: (node.attrs?.displayMode as string) || 'detailed',
          projectId: (node.attrs?.projectId as string) || '',
        },
      };
    }

    default:
      // Fallback to paragraph
      return {
        type: 'PARAGRAPH',
        content: { text: extractTextFromNode(node) },
      };
  }
}

/**
 * Extract plain text from a TipTap node.
 */
function extractTextFromNode(node: JSONContent): string {
  if (!node.content) return '';

  return node.content
    .map((child) => {
      if (child.type === 'text') {
        return child.text || '';
      }
      // Recursively extract from nested nodes
      return extractTextFromNode(child);
    })
    .join('');
}

/**
 * Extract list items from a bullet/ordered list node.
 */
function extractListItems(node: JSONContent): string[] {
  if (!node.content) return [];

  return node.content.map((listItem) => {
    if (listItem.type === 'listItem' && listItem.content) {
      return listItem.content
        .map((paragraph) => extractTextFromNode(paragraph))
        .join('\n');
    }
    return '';
  });
}

// =============================================================================
// Utility functions
// =============================================================================

/**
 * Check if two TipTap documents are equivalent.
 */
export function areDocumentsEqual(doc1: JSONContent, doc2: JSONContent): boolean {
  return JSON.stringify(doc1) === JSON.stringify(doc2);
}

/**
 * Get block count from a TipTap document.
 */
export function getBlockCount(doc: JSONContent): number {
  return doc.content?.length || 0;
}

/**
 * Extract all blockIds from a TipTap document.
 */
export function extractBlockIds(doc: JSONContent): string[] {
  if (!doc.content) return [];

  return doc.content
    .map((node) => node.attrs?.blockId as string)
    .filter(Boolean);
}
