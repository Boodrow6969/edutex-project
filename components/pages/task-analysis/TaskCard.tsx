'use client';

import {
  LearningTaskData,
  CRITICALITY_LABELS,
  CRITICALITY_COLORS,
  FREQUENCY_LABELS,
  COMPLEXITY_LABELS,
  GAP_TYPE_LABELS,
  GAP_TYPE_COLORS,
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_COLORS,
} from '@/lib/types/taskAnalysis';

interface TaskCardProps {
  task: LearningTaskData;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (taskId: string) => void;
  onMoveUp: (taskId: string) => void;
  onMoveDown: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({
  task,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: TaskCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected
          ? 'border-[#03428e] bg-blue-50/50 ring-1 ring-[#03428e]'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onSelect(task.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Reorder + delete controls */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMoveUp(task.id)}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(task.id)}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 ml-1"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${CRITICALITY_COLORS[task.criticality]}`}>
          {CRITICALITY_LABELS[task.criticality]}
        </span>
        <span className="text-xs text-gray-500">
          {FREQUENCY_LABELS[task.frequency]}
        </span>
        <span className="text-xs text-gray-400">|</span>
        <span className="text-xs text-gray-500">
          {COMPLEXITY_LABELS[task.complexity]}
        </span>

        {task._count?.objectives ? (
          <>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">
              {task._count.objectives} objective{task._count.objectives !== 1 ? 's' : ''}
            </span>
          </>
        ) : null}
      </div>

      {/* Gap → Intervention row */}
      {(task.gapType || task.intervention) && (
        <div className="flex items-center gap-2 mt-2">
          {task.gapType && (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${GAP_TYPE_COLORS[task.gapType]}`}>
              {GAP_TYPE_LABELS[task.gapType]}
            </span>
          )}
          {task.gapType && task.intervention && (
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
          {task.intervention && (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${INTERVENTION_COLORS[task.intervention]}`}>
              {INTERVENTION_TYPE_LABELS[task.intervention]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
