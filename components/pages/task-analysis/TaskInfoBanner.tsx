'use client';

import { useState } from 'react';
import { DataSourceEntry } from '@/lib/types/proceduralTaskAnalysis';
import { DataSourceBadge } from './TaskIdentitySection';

interface ObjectiveOption {
  id: string;
  title: string;
  bloomLevel: string;
}

interface TaskInfoBannerProps {
  taskGoal: string;
  objectiveId: string | null;
  objective: ObjectiveOption | null;
  sourceTaskId: string | null;
  dataSource: Record<string, DataSourceEntry>;
  courseId: string;
  onChange: (updates: Record<string, unknown>) => void;
}

export default function TaskInfoBanner({
  taskGoal,
  objectiveId,
  objective,
  sourceTaskId,
  dataSource,
  courseId,
  onChange,
}: TaskInfoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [showObjectiveSelector, setShowObjectiveSelector] = useState(false);
  const [objectives, setObjectives] = useState<ObjectiveOption[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);

  const [showSourceTaskSelector, setShowSourceTaskSelector] = useState(false);
  const [sourceTasks, setSourceTasks] = useState<{ id: string; title: string }[]>([]);
  const [loadingSourceTasks, setLoadingSourceTasks] = useState(false);

  const fetchObjectives = async () => {
    if (objectives.length > 0) {
      setShowObjectiveSelector(true);
      return;
    }
    setLoadingObjectives(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/objectives`);
      if (res.ok) {
        const data = await res.json();
        setObjectives(data);
      }
    } catch { /* ignore */ }
    setLoadingObjectives(false);
    setShowObjectiveSelector(true);
  };

  const fetchSourceTasks = async () => {
    if (sourceTasks.length > 0) {
      setShowSourceTaskSelector(true);
      return;
    }
    setLoadingSourceTasks(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/analysis-context`);
      if (res.ok) {
        const data = await res.json();
        const tasks = data.courseAnalysis?.tasks || [];
        setSourceTasks(tasks.map((t: { id: string; task: string }) => ({ id: t.id, title: t.task })));
      }
    } catch { /* ignore */ }
    setLoadingSourceTasks(false);
    setShowSourceTaskSelector(true);
  };

  const goalPreview = taskGoal
    ? taskGoal.length > 80 ? taskGoal.slice(0, 80) + '...' : taskGoal
    : 'No goal set';

  return (
    <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
      {/* Collapsed row — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center gap-4 text-left hover:bg-gray-100 transition-colors"
      >
        {/* Task Goal preview */}
        <span className="text-sm text-gray-600 truncate min-w-0 flex-1">
          <span className="text-xs font-medium text-gray-400 mr-1.5">Goal:</span>
          {goalPreview}
        </span>

        {/* Linked Objective badge */}
        <span className="flex-shrink-0">
          {objective ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              <span className="font-medium">{objective.bloomLevel}</span>
              <span className="max-w-[120px] truncate">{objective.title}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-400">No objective linked</span>
          )}
        </span>

        {/* Source Task badge */}
        <span className="flex-shrink-0">
          {sourceTaskId ? (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
              {sourceTasks.find((t) => t.id === sourceTaskId)?.title || 'Linked task'}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-400">No source task</span>
          )}
        </span>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded fields */}
      <div
        className={`grid transition-all duration-300 ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-4">
            {/* Task Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Goal
                <DataSourceBadge field="taskGoal" dataSource={dataSource} />
              </label>
              <textarea
                value={taskGoal}
                onChange={(e) => onChange({ taskGoal: e.target.value })}
                placeholder="What does successful task completion look like? What is the end state?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Linked Objective</label>
                {objective ? (
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{objective.title}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 border border-blue-300">
                        {objective.bloomLevel}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChange({ objectiveId: null }); }}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Unlink
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={(e) => { e.stopPropagation(); fetchObjectives(); }}
                      disabled={loadingObjectives}
                      className="text-sm text-[#03428e] hover:underline disabled:opacity-50"
                    >
                      {loadingObjectives ? 'Loading...' : 'Link Objective'}
                    </button>
                    {showObjectiveSelector && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                        {objectives.length === 0 ? (
                          <p className="p-3 text-sm text-gray-400">No objectives found for this course.</p>
                        ) : (
                          objectives.map((obj) => (
                            <button
                              key={obj.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onChange({ objectiveId: obj.id });
                                setShowObjectiveSelector(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                objectiveId === obj.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <span className="text-gray-900">{obj.title}</span>
                              <span className="ml-2 text-xs text-gray-400">{obj.bloomLevel}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Source Task */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Task (from Needs Analysis)</label>
                {sourceTaskId ? (
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
                    <p className="flex-1 text-sm text-gray-900">
                      {sourceTasks.find((t) => t.id === sourceTaskId)?.title || 'Linked task'}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChange({ sourceTaskId: null }); }}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Unlink
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={(e) => { e.stopPropagation(); fetchSourceTasks(); }}
                      disabled={loadingSourceTasks}
                      className="text-sm text-[#03428e] hover:underline disabled:opacity-50"
                    >
                      {loadingSourceTasks ? 'Loading...' : 'Link Source Task'}
                    </button>
                    {showSourceTaskSelector && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                        {sourceTasks.length === 0 ? (
                          <p className="p-3 text-sm text-gray-400">No tasks found in Needs Analysis.</p>
                        ) : (
                          sourceTasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onChange({ sourceTaskId: task.id });
                                setShowSourceTaskSelector(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              {task.title}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
