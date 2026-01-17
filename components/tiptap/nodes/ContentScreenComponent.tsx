'use client';

import { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Monitor, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

type ScreenType = 'content' | 'video' | 'practice' | 'assessment' | 'scenario' | 'title_intro';
type InteractionType = 'none' | 'click_reveal' | 'drag_drop' | 'multiple_choice' | 'branching' | 'discussion' | 'exercise' | 'video_playback' | 'other';

const SCREEN_TYPE_OPTIONS: { value: ScreenType; label: string }[] = [
  { value: 'content', label: 'Content' },
  { value: 'video', label: 'Video' },
  { value: 'practice', label: 'Practice' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'scenario', label: 'Scenario' },
  { value: 'title_intro', label: 'Title/Intro' },
];

const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'click_reveal', label: 'Click to Reveal' },
  { value: 'drag_drop', label: 'Drag and Drop' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'branching', label: 'Branching/Decision' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'exercise', label: 'Exercise/Activity' },
  { value: 'video_playback', label: 'Video Playback' },
  { value: 'other', label: 'Other' },
];

// =============================================================================
// Component
// =============================================================================

export default function ContentScreenComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const {
    screenId,
    screenTitle,
    screenType,
    visuals,
    onScreenText,
    voiceoverScript,
    interactionType,
    interactionDetails,
    designerNotes,
    developerNotes,
    duration,
  } = node.attrs;

  const [notesExpanded, setNotesExpanded] = useState(false);

  return (
    <NodeViewWrapper className="content-screen-wrapper">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4 relative group">
        {/* Delete Button - Always visible */}
        <button
          type="button"
          onClick={deleteNode}
          title="Delete block"
          className="absolute top-2 right-2 p-1.5 rounded-md z-10
                     text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header Row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg pr-12">
          <Monitor className="w-5 h-5 text-gray-500 flex-shrink-0" />

          {/* Screen Type Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={screenType || 'content'}
              onChange={(e) => updateAttributes({ screenType: e.target.value })}
              className="px-2 py-1 text-xs font-medium text-gray-700
                         border border-gray-300 rounded bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SCREEN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Screen ID */}
          <div className="flex-shrink-0">
            <input
              type="text"
              value={screenId || ''}
              onChange={(e) => updateAttributes({ screenId: e.target.value })}
              placeholder="SCR-001"
              className="w-20 px-2 py-1 text-xs font-mono font-medium text-gray-700
                         border border-gray-300 rounded bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400"
            />
          </div>

          {/* Screen Title */}
          <div className="flex-1">
            <input
              type="text"
              value={screenTitle || ''}
              onChange={(e) => updateAttributes({ screenTitle: e.target.value })}
              placeholder="Screen Title..."
              className="w-full px-3 py-1.5 text-sm font-medium text-gray-800
                         border border-gray-300 rounded bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400"
            />
          </div>

          {/* Duration */}
          <div className="flex-shrink-0">
            <input
              type="text"
              value={duration || ''}
              onChange={(e) => updateAttributes({ duration: e.target.value })}
              placeholder="30 sec"
              className="w-20 px-2 py-1 text-xs text-gray-600 text-center
                         border border-gray-300 rounded bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400"
            />
          </div>
        </div>

        {/* Main Content: Two Columns */}
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* Left Column: Visuals */}
          <div className="p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Visuals
            </label>
            <textarea
              value={visuals || ''}
              onChange={(e) => updateAttributes({ visuals: e.target.value })}
              placeholder="Describe what appears on screen: graphics, animations, characters, backgrounds, UI elements..."
              rows={8}
              className="w-full px-3 py-2 text-sm text-gray-700
                         border border-gray-200 rounded-md bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                         placeholder-gray-400 resize-none"
            />
          </div>

          {/* Right Column: On-Screen Text + Voiceover Script */}
          <div className="p-4 flex flex-col gap-4">
            {/* On-Screen Text */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                On-Screen Text
              </label>
              <textarea
                value={onScreenText || ''}
                onChange={(e) => updateAttributes({ onScreenText: e.target.value })}
                placeholder="Text that the learner reads on screen..."
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-700
                           border border-gray-200 rounded-md bg-gray-50
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                           placeholder-gray-400 resize-none"
              />
            </div>

            {/* Voiceover Script */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Voiceover Script
              </label>
              <textarea
                value={voiceoverScript || ''}
                onChange={(e) => updateAttributes({ voiceoverScript: e.target.value })}
                placeholder="Narration script for audio recording..."
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-700
                           border border-gray-200 rounded-md bg-gray-50
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                           placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Interaction Row */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-4">
            {/* Interaction Type Dropdown */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Interaction
              </label>
              <select
                value={interactionType || 'none'}
                onChange={(e) => updateAttributes({ interactionType: e.target.value })}
                className="px-2 py-1.5 text-sm text-gray-700
                           border border-gray-300 rounded bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INTERACTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interaction Details */}
            {interactionType !== 'none' && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {interactionType === 'other' ? 'Interaction Details (Required)' : 'Interaction Details (Optional)'}
                </label>
                <input
                  type="text"
                  value={interactionDetails || ''}
                  onChange={(e) => updateAttributes({ interactionDetails: e.target.value })}
                  placeholder={interactionType === 'other' ? 'Describe the custom interaction...' : 'Additional details about the interaction...'}
                  className="w-full px-3 py-1.5 text-sm text-gray-700
                             border border-gray-300 rounded bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes Section (Collapsible) */}
        <div className="border-t border-gray-200">
          <button
            type="button"
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-500
                       hover:bg-gray-50 transition-colors"
          >
            {notesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Designer & Developer Notes</span>
            {(designerNotes || developerNotes) && !notesExpanded && (
              <span className="ml-2 text-gray-400 truncate max-w-xs">
                {(designerNotes || developerNotes).substring(0, 40)}...
              </span>
            )}
          </button>

          {notesExpanded && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-4">
              {/* Designer Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Designer Notes
                </label>
                <textarea
                  value={designerNotes || ''}
                  onChange={(e) => updateAttributes({ designerNotes: e.target.value })}
                  placeholder="ID thoughts, SME questions, design rationale..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-gray-600
                             border border-gray-200 rounded-md bg-yellow-50
                             focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                             placeholder-gray-400 resize-none"
                />
              </div>

              {/* Developer Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Developer Notes
                </label>
                <textarea
                  value={developerNotes || ''}
                  onChange={(e) => updateAttributes({ developerNotes: e.target.value })}
                  placeholder="Technical instructions, asset requirements, implementation notes..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-gray-600
                             border border-gray-200 rounded-md bg-blue-50
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-400 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
