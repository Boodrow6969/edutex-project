/**
 * TipTap Extensions Configuration for Storyboard Editor
 *
 * This module configures all TipTap extensions used in the storyboard editor.
 * Milestone 1: Basic StarterKit configuration
 * Milestone 2+: Custom block nodes will be added here
 */

import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

// Extend Image to explicitly include blockId attribute
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes) => {
          if (!attributes.blockId) return {};
          return { 'data-block-id': attributes.blockId };
        },
      },
    };
  },
});

// Custom block nodes (Milestone 2+)
import { StoryboardMetadataNode } from './StoryboardMetadataNode';
import { ContentScreenNode } from './ContentScreenNode';
import { LearningObjectivesImportNode } from './LearningObjectivesImportNode';
import { VideoNode } from './VideoNode';

/**
 * Custom extension to add blockId attribute to all block-level nodes.
 * This allows us to track which database Block each node corresponds to.
 */
const BlockIdExtension = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'bulletList',
          'orderedList',
          'blockquote',
          'codeBlock',
          'horizontalRule',
          // M2: Storyboard blocks
          'storyboardMetadata',
          'contentScreen',
          'learningObjectivesImport',
          // M2.5: Media blocks
          'image',
          'video',
        ],
        attributes: {
          blockId: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-block-id'),
            renderHTML: (attributes) => {
              if (!attributes.blockId) return {};
              return { 'data-block-id': attributes.blockId };
            },
          },
          originalType: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-original-type'),
            renderHTML: (attributes) => {
              if (!attributes.originalType) return {};
              return { 'data-original-type': attributes.originalType };
            },
          },
        },
      },
    ];
  },
});

/**
 * Custom extension to add variant attribute to blockquote (for callouts).
 */
const CalloutVariantExtension = Extension.create({
  name: 'calloutVariant',

  addGlobalAttributes() {
    return [
      {
        types: ['blockquote'],
        attributes: {
          variant: {
            default: 'info',
            parseHTML: (element) => element.getAttribute('data-variant') || 'info',
            renderHTML: (attributes) => {
              return { 'data-variant': attributes.variant || 'info' };
            },
          },
        },
      },
    ];
  },
});

/**
 * Get all extensions for the storyboard editor.
 */
export function getStoryboardExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      // StarterKit includes: paragraph, text, bold, italic, strike, code,
      // bulletList, orderedList, listItem, blockquote, codeBlock,
      // horizontalRule, hardBreak, history, dropcursor, gapcursor
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level;
          return level === 1
            ? 'Heading 1'
            : level === 2
            ? 'Heading 2'
            : 'Heading 3';
        }
        return 'Type "/" for commands, or start writing...';
      },
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
    BlockIdExtension,
    CalloutVariantExtension,
    // M2: Storyboard blocks
    StoryboardMetadataNode,
    ContentScreenNode,
    LearningObjectivesImportNode,
    // M2.5: Media blocks
    CustomImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'rounded-lg max-w-full my-4',
      },
    }),
    VideoNode,
  ];
}

/**
 * Editor configuration for read-only mode (viewing/commenting).
 */
export function getReadOnlyExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    BlockIdExtension,
    CalloutVariantExtension,
  ];
}

// Re-export for convenience
export { StarterKit, Placeholder };

// Export custom nodes
export { StoryboardMetadataNode };
export { ContentScreenNode };
export { LearningObjectivesImportNode };
export { VideoNode };
