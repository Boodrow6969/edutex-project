'use client';

import { useState } from 'react';
import { DataSourceEntry } from '@/lib/types/proceduralTaskAnalysis';

interface ObjectiveOption {
  id: string;
  title: string;
  bloomLevel: string;
}

interface TaskIdentitySectionProps {
  taskName: string;
  taskGoal: string;
  objectiveId: string | null;
  objective: ObjectiveOption | null;
  sourceTaskId: string | null;
  dataSource: Record<string, DataSourceEntry>;
  courseId: string;
  onChange: (updates: Record<string, unknown>) => void;
}

function DataSourceBadge({ field, dataSource }: { field: string; dataSource: Record<string, DataSourceEntry> }) {
  const entry = dataSource[field];
  if (!entry) return null;

  if (entry.source === 'needs_analysis') {
    return <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-600">From NA</span>;
  }
  if (entry.source === 'objectives') {
    return <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-600">From Objectives</span>;
  }
  if (entry.source === 'custom') {
    return <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-600">Custom</span>;
  }
  return null;
}

export { DataSourceBadge };

export default function TaskIdentitySection({
  taskName,
  taskGoal,
  objectiveId,
  objective,
  sourceTaskId,
  dataSource,
  courseId,
  onChange,
}: TaskIdentitySectionProps) {
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

  return (
    <div className="space-y-4">
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
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>

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
                onClick={() => onChange({ objectiveId: null })}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Unlink
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={fetchObjectives}
                disabled={loadingObjectives}
                className="text-sm text-[#03428e] hover:underline disabled:opacity-50"
              >
                {loadingObjectives ? 'Loading...' : 'Link Objective'}
              </button>
              {showObjectiveSelector && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {objectives.length === 0 ? (
                    <p className="p-3 text-sm text-gray-400">No objectives found for this course.</p>
                  ) : (
                    objectives.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => {
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

        {/* Source Task (from Needs Analysis) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source Task (from Needs Analysis)</label>
          {sourceTaskId ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="flex-1 text-sm text-gray-900">
                {sourceTasks.find((t) => t.id === sourceTaskId)?.title || 'Linked task'}
              </p>
              <button
                onClick={() => onChange({ sourceTaskId: null })}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Unlink
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={fetchSourceTasks}
                disabled={loadingSourceTasks}
                className="text-sm text-[#03428e] hover:underline disabled:opacity-50"
              >
                {loadingSourceTasks ? 'Loading...' : 'Link Source Task'}
              </button>
              {showSourceTaskSelector && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {sourceTasks.length === 0 ? (
                    <p className="p-3 text-sm text-gray-400">No tasks found in Needs Analysis.</p>
                  ) : (
                    sourceTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
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
  );
}
