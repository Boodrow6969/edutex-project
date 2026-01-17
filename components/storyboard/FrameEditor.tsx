'use client';

import { useCallback } from 'react';
import GuidancePanel from '@/components/ui/GuidancePanel';
import {
  StoryboardFrame,
  StoryboardFrameContent,
  TransitionType,
  transitionOptions,
} from '@/lib/types/storyboard';

interface FrameEditorProps {
  frame: StoryboardFrame;
  frameNumber: number;
  onUpdateFrame: (frameId: string, updates: Partial<StoryboardFrameContent>) => void;
}

export default function FrameEditor({
  frame,
  frameNumber,
  onUpdateFrame,
}: FrameEditorProps) {
  const handleChange = useCallback(
    (field: keyof StoryboardFrameContent, value: string | number) => {
      onUpdateFrame(frame.id, { [field]: value });
    },
    [frame.id, onUpdateFrame]
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Frame Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#03428e] text-white flex items-center justify-center text-lg font-semibold">
          {frameNumber}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {frame.sceneTitle || 'Untitled Scene'}
          </h2>
          <p className="text-sm text-gray-500">Frame {frameNumber}</p>
        </div>
      </div>

      {/* Scene Title & Duration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Scene Details</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scene Title
            </label>
            <input
              type="text"
              value={frame.sceneTitle}
              onChange={(e) => handleChange('sceneTitle', e.target.value)}
              placeholder="e.g., Introduction, Product Demo, Call to Action"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={frame.durationSeconds}
              onChange={(e) =>
                handleChange('durationSeconds', parseInt(e.target.value) || 0)
              }
              min={0}
              max={600}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Script */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Script / Narration</h3>

        <GuidancePanel>
          Write the voiceover narration for this scene. Keep it conversational and
          time it to match your estimated duration. Aim for approximately 150 words
          per minute of narration.
        </GuidancePanel>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Script
          </label>
          <textarea
            value={frame.script}
            onChange={(e) => handleChange('script', e.target.value)}
            placeholder="Write the voiceover narration for this scene..."
            rows={5}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {frame.script.split(/\s+/).filter(Boolean).length} words
            {frame.script.length > 0 && (
              <> (~{Math.round(frame.script.split(/\s+/).filter(Boolean).length / 2.5)}s at normal pace)</>
            )}
          </p>
        </div>
      </div>

      {/* Visual Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Visual Content</h3>

        <GuidancePanel>
          Describe what appears on screen during this scene. Include any graphics,
          animations, screen recordings, or B-roll footage. Be specific enough for
          the video team to understand your vision.
        </GuidancePanel>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visual Description
          </label>
          <textarea
            value={frame.visualDescription}
            onChange={(e) => handleChange('visualDescription', e.target.value)}
            placeholder="Describe what appears on screen: graphics, animations, footage, screen recordings..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            On-Screen Text
          </label>
          <textarea
            value={frame.onScreenText}
            onChange={(e) => handleChange('onScreenText', e.target.value)}
            placeholder="Titles, captions, callouts, labels to display on screen..."
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>
      </div>

      {/* Audio & Transition */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Audio & Transition</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio Notes
            </label>
            <input
              type="text"
              value={frame.audioNotes}
              onChange={(e) => handleChange('audioNotes', e.target.value)}
              placeholder="Background music, sound effects..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transition to Next
            </label>
            <select
              value={frame.transition}
              onChange={(e) =>
                handleChange('transition', e.target.value as TransitionType)
              }
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none bg-white"
            >
              {transitionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Internal Notes</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes for Team
          </label>
          <textarea
            value={frame.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Internal notes, references, questions for SMEs..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
