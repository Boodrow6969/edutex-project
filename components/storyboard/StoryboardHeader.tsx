'use client';

import {
  StoryboardFrame,
  StoryboardMetadata,
  StoryboardStatus,
  calculateTotalDuration,
  formatDuration,
  statusConfig,
} from '@/lib/types/storyboard';

interface StoryboardHeaderProps {
  pageTitle: string;
  metadata: StoryboardMetadata;
  frames: StoryboardFrame[];
  isSaving: boolean;
  saveMessage: { text: string; type: 'success' | 'error' } | null;
  onMetadataChange: (updates: Partial<StoryboardMetadata>) => void;
  onSave: () => void;
}

export default function StoryboardHeader({
  pageTitle,
  metadata,
  frames,
  isSaving,
  saveMessage,
  onMetadataChange,
  onSave,
}: StoryboardHeaderProps) {
  const totalDuration = calculateTotalDuration(frames);
  const currentStatus = statusConfig[metadata.status];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title and Info */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
              <div className="flex items-center gap-3 mt-1">
                {/* Status Badge */}
                <select
                  value={metadata.status}
                  onChange={(e) =>
                    onMetadataChange({ status: e.target.value as StoryboardStatus })
                  }
                  className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${currentStatus.bgColor} ${currentStatus.color}`}
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="approved">Approved</option>
                </select>

                {/* Frame Count */}
                <span className="text-sm text-gray-500">
                  {frames.length} frame{frames.length !== 1 ? 's' : ''}
                </span>

                {/* Total Duration */}
                <span className="text-sm text-gray-500 flex items-center gap-1">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDuration(totalDuration)}
                </span>

                {/* Version */}
                <span className="text-xs text-gray-400">v{metadata.version}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {saveMessage.text}
              </span>
            )}

            {/* Export Button (Placeholder) */}
            <button
              type="button"
              className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={() => alert('Export feature coming soon!')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Target Audience (collapsible or secondary row) */}
        <div className="mt-3 flex items-center gap-2">
          <label className="text-sm text-gray-500">Target Audience:</label>
          <input
            type="text"
            value={metadata.targetAudience}
            onChange={(e) => onMetadataChange({ targetAudience: e.target.value })}
            placeholder="e.g., New hires, Sales team, All employees"
            className="flex-1 max-w-md border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
