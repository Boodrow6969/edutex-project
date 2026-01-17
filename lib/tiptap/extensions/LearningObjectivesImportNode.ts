import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import LearningObjectivesImportComponent from '@/components/tiptap/nodes/LearningObjectivesImportComponent';

export interface LearningObjectivesImportOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    learningObjectivesImport: {
      insertLearningObjectivesImport: (options?: { projectId?: string }) => ReturnType;
    };
  }
}

export const LearningObjectivesImportNode = Node.create<LearningObjectivesImportOptions>({
  name: 'learningObjectivesImport',

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
      importedAt: {
        default: '',
      },
      objectives: {
        default: [],
      },
      displayMode: {
        default: 'detailed',
      },
      projectId: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="learning-objectives-import"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'learning-objectives-import', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LearningObjectivesImportComponent);
  },

  addCommands() {
    return {
      insertLearningObjectivesImport:
        (options?: { projectId?: string }) =>
        ({ tr, dispatch, state }) => {
          const node = state.schema.nodes.learningObjectivesImport.create({
            importedAt: '',
            objectives: [],
            displayMode: 'detailed',
            projectId: options?.projectId || '',
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

export default LearningObjectivesImportNode;
