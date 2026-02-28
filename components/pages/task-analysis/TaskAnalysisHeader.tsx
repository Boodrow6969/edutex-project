'use client';

import { useState, useRef, useEffect } from 'react';
import { TaskAnalysisType } from '@/lib/types/proceduralTaskAnalysis';

interface TaskAnalysisHeaderProps {
  taskName: string;
  analysisType: TaskAnalysisType;
  priorityLabel: string;
  priorityColor: string;
  compositeScore: number | null;
  isSaving: boolean;
  lastSaved: string | null;
  error: string | null;
  isPanelOpen: boolean;
  onTaskNameChange: (name: string) => void;
  onTogglePanel: () => void;
  onPriorityClick: () => void;
}

export default function TaskAnalysisHeader({
  taskName,
  analysisType,
  priorityLabel,
  priorityColor,
  compositeScore,
  isSaving,
  lastSaved,
  error,
  isPanelOpen,
  onTaskNameChange,
  onTogglePanel,
  onPriorityClick,
}: TaskAnalysisHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(taskName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setEditValue(taskName);
  }, [taskName, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitEdit = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== taskName) {
      onTaskNameChange(trimmed);
    } else {
      setEditValue(taskName);
    }
  };

  const modeLabel =
    analysisType === 'PROCEDURAL'
      ? 'Procedural'
      : analysisType === 'HIERARCHICAL'
        ? 'HTA'
        : 'CTA';

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
      {/* Task Name — inline editable */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') {
                setEditValue(taskName);
                setIsEditing(false);
              }
            }}
            className="w-full text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-[#03428e] outline-none py-0.5"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left text-lg font-semibold text-gray-900 truncate hover:text-[#03428e] transition-colors cursor-text"
            title="Click to edit task name"
          >
            {taskName || 'Untitled Task Analysis'}
          </button>
        )}
      </div>

      {/* Mode Badge */}
      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
        {modeLabel}
      </span>

      {/* Priority Badge */}
      <button
        onClick={onPriorityClick}
        className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${priorityColor} hover:opacity-80 transition-opacity`}
        title="View priority scoring"
      >
        {compositeScore !== null ? `${compositeScore}/15 — ` : ''}{priorityLabel}
      </button>

      {/* Save Status */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {isSaving && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        )}
        {!isSaving && lastSaved && (
          <span className="text-xs text-gray-400">Saved {lastSaved}</span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onTogglePanel}
        className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title={isPanelOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {isPanelOpen ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}
