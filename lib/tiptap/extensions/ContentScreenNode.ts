import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ContentScreenComponent from '@/components/tiptap/nodes/ContentScreenComponent';

export interface ContentScreenOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    contentScreen: {
      insertContentScreen: () => ReturnType;
    };
  }
}

export const ContentScreenNode = Node.create<ContentScreenOptions>({
  name: 'contentScreen',

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
      // Core attributes (all screen types)
      screenId: { default: '' },
      screenTitle: { default: '' },
      screenType: { default: 'content' },
      duration: { default: '' },
      designerNotes: { default: '' },
      developerNotes: { default: '' },

      // Content type fields (default layout)
      visuals: { default: '' },
      onScreenText: { default: '' },
      voiceoverScript: { default: '' },
      interactionType: { default: 'none' },
      interactionDetails: { default: '' },

      // Title/Intro type fields
      titleCardText: { default: '' },
      briefVoiceover: { default: '' },
      backgroundNotes: { default: '' },

      // Video type fields
      videoSource: { default: '' },
      scenes: { default: [] }, // Array of { timecode, visualDescription, voiceover, onScreenText }

      // Practice type fields
      activityType: { default: 'other' },
      activityDescription: { default: '' },
      instructions: { default: '' },
      hints: { default: '' },
      correctFeedback: { default: '' },
      incorrectFeedback: { default: '' },

      // Assessment type fields (redesigned)
      assessmentPurpose: { default: '' },
      assessmentFormat: { default: '' },
      assessmentFormatOther: { default: '' },
      linkedObjectiveIds: { default: [] },
      cognitiveDemand: { default: '' },
      assessmentRationale: { default: [] },
      assessmentRationaleOther: { default: '' },
      estimatedDuration: { default: '' },
      attemptsAllowed: { default: '1' },
      gradedWeighted: { default: '' },
      dynamicScopeValue: { default: '' },
      feedbackStrategy: { default: '' },
      passingCriteria: { default: '' },

      // Scenario type fields
      scenarioSetup: { default: '' },
      decisionPrompt: { default: '' },
      scenarioOptions: { default: [] }, // Array of { text, consequence, isBestChoice }
      debrief: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="content-screen"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'content-screen', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContentScreenComponent);
  },

  addCommands() {
    return {
      insertContentScreen:
        () =>
        ({ tr, dispatch, state }) => {
          const node = state.schema.nodes.contentScreen.create({
            screenId: '',
            screenTitle: '',
            screenType: 'content',
            visuals: '',
            onScreenText: '',
            voiceoverScript: '',
            interactionType: 'none',
            interactionDetails: '',
            designerNotes: '',
            developerNotes: '',
            duration: '',
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

export default ContentScreenNode;
