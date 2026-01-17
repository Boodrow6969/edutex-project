'use client';

import { StoryboardFrame, formatDuration } from '@/lib/types/storyboard';

interface FrameThumbnailProps {
  frame: StoryboardFrame;
  frameNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function FrameThumbnail({
  frame,
  frameNumber,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: FrameThumbnailProps) {
  return (
    <div
      onClick={onSelect}
      className={`group border rounded-lg p-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#03428e] bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Frame Number */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isSelected
              ? 'bg-[#03428e] text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {frameNumber}
        </div>

        {/* Frame Info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isSelected ? 'text-[#03428e]' : 'text-gray-900'
            }`}
          >
            {frame.sceneTitle || 'Untitled Scene'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDuration(frame.durationSeconds)}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`flex items-center gap-1 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 text-gray-400 hover:text-[#03428e] transition-colors"
            title="Duplicate frame"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete frame"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview of script (truncated) */}
      {frame.script && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 pl-11">
          {frame.script}
        </p>
      )}
    </div>
  );
}
