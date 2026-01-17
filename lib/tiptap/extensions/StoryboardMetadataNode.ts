import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StoryboardMetadataComponent from '@/components/tiptap/nodes/StoryboardMetadataComponent';

export interface StoryboardMetadataOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    storyboardMetadata: {
      insertStoryboardMetadata: () => ReturnType;
    };
  }
}

export const StoryboardMetadataNode = Node.create<StoryboardMetadataOptions>({
  name: 'storyboardMetadata',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      title: {
        default: '',
      },
      audience: {
        default: '',
      },
      duration: {
        default: '',
      },
      deliveryMethod: {
        default: 'eLearning',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="storyboard-metadata"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'storyboard-metadata', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StoryboardMetadataComponent);
  },

  addCommands() {
    return {
      insertStoryboardMetadata:
        () =>
        ({ tr, dispatch, state }) => {
          const node = state.schema.nodes.storyboardMetadata.create({
            title: '',
            audience: '',
            duration: '',
            deliveryMethod: 'eLearning',
          });

          if (dispatch) {
            // Insert at the end of the document to avoid replacing existing content
            const endPos = state.doc.content.size;
            tr.insert(endPos, node);
            dispatch(tr);
          }

          return true;
        },
    };
  },
});

export default StoryboardMetadataNode;
