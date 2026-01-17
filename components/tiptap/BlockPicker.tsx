'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Plus,
  Info,
  Monitor,
  Type,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  Target,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface BlockPickerProps {
  editor: Editor | null;
  projectId?: string;
}

interface BlockOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: (editor: Editor, context?: { projectId?: string }) => void;
}

// =============================================================================
// Block Options Configuration
// =============================================================================

const blockOptions: BlockOption[] = [
  {
    id: 'storyboardMetadata',
    label: 'Course Information',
    description: 'Add course title, audience, and duration',
    icon: <Info className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().insertStoryboardMetadata().run(),
  },
  {
    id: 'contentScreen',
    label: 'Content Screen',
    description: 'Add a new screen with visuals, text, and audio',
    icon: <Monitor className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().insertContentScreen().run(),
  },
  {
    id: 'learningObjectivesImport',
    label: 'Learning Objectives',
    description: 'Import objectives from this project',
    icon: <Target className="w-4 h-4" />,
    action: (editor, context) => {
      editor.chain().focus().insertLearningObjectivesImport({ projectId: context?.projectId }).run();
    },
  },
  {
    id: 'heading',
    label: 'Heading',
    description: 'Add a section heading',
    icon: <Type className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Add plain text content',
    icon: <AlignLeft className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'bulletList',
    label: 'Bullet List',
    description: 'Add an unordered list',
    icon: <List className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    label: 'Numbered List',
    description: 'Add an ordered list',
    icon: <ListOrdered className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    label: 'Quote / Callout',
    description: 'Add a highlighted quote or callout',
    icon: <Quote className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

// =============================================================================
// Component
// =============================================================================

export default function BlockPicker({ editor, projectId }: BlockPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!editor) {
    return null;
  }

  const handleSelect = (option: BlockOption) => {
    option.action(editor, { projectId });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:ring-offset-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Plus className="w-4 h-4" />
        <span>Add Block</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          {blockOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 group-hover:bg-[#03428e] group-hover:text-white transition-colors">
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
