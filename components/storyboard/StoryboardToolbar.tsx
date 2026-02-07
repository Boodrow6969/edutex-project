'use client';

import { Editor } from '@tiptap/react';
import {
  PlayCircle,
  FileText,
  Video,
  Dumbbell,
  ClipboardCheck,
  GitBranch,
  Target
} from 'lucide-react';

interface StoryboardToolbarProps {
  editor: Editor | null;
  projectId?: string;
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  screenType?: string;
  isObjectives?: boolean;
}

const toolbarButtons: ToolbarButton[] = [
  {
    id: 'title_intro',
    label: 'Title/Intro',
    icon: <PlayCircle className="w-5 h-5" />,
    screenType: 'title_intro',
  },
  {
    id: 'content',
    label: 'Content',
    icon: <FileText className="w-5 h-5" />,
    screenType: 'content',
  },
  {
    id: 'video',
    label: 'Video',
    icon: <Video className="w-5 h-5" />,
    screenType: 'video',
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: <Dumbbell className="w-5 h-5" />,
    screenType: 'practice',
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: <ClipboardCheck className="w-5 h-5" />,
    screenType: 'assessment',
  },
  {
    id: 'scenario',
    label: 'Scenario',
    icon: <GitBranch className="w-5 h-5" />,
    screenType: 'scenario',
  },
  {
    id: 'objectives',
    label: 'Learning Objectives',
    icon: <Target className="w-5 h-5" />,
    isObjectives: true,
  },
];

export default function StoryboardToolbar({ editor, projectId }: StoryboardToolbarProps) {
  if (!editor) return null;

  const handleInsert = (button: ToolbarButton) => {
    if (button.isObjectives) {
      // Insert Learning Objectives Import block
      editor.chain().focus().insertLearningObjectivesImport({ projectId }).run();
    } else if (button.screenType) {
      // Insert Content Screen with specific type
      const { state, dispatch } = editor.view;
      const { tr } = state;

      const node = state.schema.nodes.contentScreen.create({
        screenId: '',
        screenTitle: '',
        screenType: button.screenType,
        visuals: '',
        onScreenText: '',
        voiceoverScript: '',
        interactionType: 'none',
        interactionDetails: '',
        designerNotes: '',
        developerNotes: '',
        duration: '',
      });

      const endPos = state.doc.content.size;
      tr.insert(endPos, node);
      dispatch(tr);
      editor.commands.focus();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex justify-center pb-4">
        <div className="pointer-events-auto bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-2 flex items-center gap-1">
          {toolbarButtons.map((button) => (
            <div key={button.id} className="flex items-center">
              {/* Divider before Learning Objectives */}
              {button.isObjectives && (
                <div className="w-px h-8 bg-gray-200 mx-2" />
              )}
              <button
                onClick={() => handleInsert(button)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title={button.label}
              >
                <span className="text-gray-500 group-hover:text-[#03428e] transition-colors">
                  {button.icon}
                </span>
                <span className="text-xs text-gray-600 group-hover:text-[#03428e] font-medium transition-colors whitespace-nowrap">
                  {button.label}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
