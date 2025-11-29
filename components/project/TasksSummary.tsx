'use client';

import { TaskStatus } from '@prisma/client';

interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

interface TasksSummaryProps {
  stats: TaskStats;
}

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: 'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-yellow-500',
  DONE: 'bg-green-500',
};

const STATUS_TEXT_COLORS: Record<TaskStatus, string> = {
  TODO: 'text-gray-600',
  IN_PROGRESS: 'text-blue-600',
  REVIEW: 'text-yellow-600',
  DONE: 'text-green-600',
};

/**
 * Displays a summary of tasks with status breakdown and progress bar.
 */
export default function TasksSummary({ stats }: TasksSummaryProps) {
  const hasTasks = stats.total > 0;
  const doneCount = stats.byStatus.DONE;
  const progressPercentage = hasTasks ? Math.round((doneCount / stats.total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stats.total} task{stats.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-5">
        {!hasTasks ? (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No tasks created yet</p>
            <p className="text-xs mt-1">Run a Needs Analysis to generate tasks</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{progressPercentage}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                {/* Segmented progress bar showing all statuses */}
                <div className="h-full flex">
                  {STATUS_ORDER.map((status) => {
                    const count = stats.byStatus[status];
                    const width = hasTasks ? (count / stats.total) * 100 : 0;
                    if (width === 0) return null;
                    return (
                      <div
                        key={status}
                        className={`h-full ${STATUS_COLORS[status]} transition-all`}
                        style={{ width: `${width}%` }}
                        title={`${STATUS_LABELS[status]}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Status Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {STATUS_ORDER.map((status) => {
                  const count = stats.byStatus[status];
                  return (
                    <div
                      key={status}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"
                    >
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                      <span className="text-xs text-gray-600">{STATUS_LABELS[status]}</span>
                      <span className={`text-sm font-semibold ml-auto ${STATUS_TEXT_COLORS[status]}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Summary */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                By Priority
              </h3>
              <div className="flex gap-2">
                {stats.byPriority.URGENT > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                    {stats.byPriority.URGENT} Urgent
                  </span>
                )}
                {stats.byPriority.HIGH > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                    {stats.byPriority.HIGH} High
                  </span>
                )}
                {stats.byPriority.MEDIUM > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                    {stats.byPriority.MEDIUM} Medium
                  </span>
                )}
                {stats.byPriority.LOW > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    {stats.byPriority.LOW} Low
                  </span>
                )}
                {stats.byPriority.URGENT === 0 &&
                  stats.byPriority.HIGH === 0 &&
                  stats.byPriority.MEDIUM === 0 &&
                  stats.byPriority.LOW === 0 && (
                    <span className="text-xs text-gray-500">No priority data</span>
                  )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
