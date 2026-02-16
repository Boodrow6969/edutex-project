'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLearningTasks } from '@/lib/hooks/useLearningTasks';
import TaskCard from '@/components/pages/task-analysis/TaskCard';
import TaskForm from '@/components/pages/task-analysis/TaskForm';
import TaskFilters from '@/components/pages/task-analysis/TaskFilters';
import FindingsSummary from '@/components/pages/task-analysis/FindingsSummary';
import ReferencePanel from '@/components/ui/ReferencePanel';
import NeedsAnalysisPanel from '@/components/pages/task-analysis/NeedsAnalysisPanel';
import GuidancePanel from '@/components/ui/GuidancePanel';
import {
  LearningTaskData,
  TaskFilterType,
  TaskSortField,
  TRAINING_INTERVENTIONS,
  NON_TRAINING_INTERVENTIONS,
  InterventionType,
} from '@/lib/types/taskAnalysis';

interface TaskAnalysisViewProps {
  courseId: string;
  pageId: string;
  workspaceId?: string;
}

// Sort order maps for enum-based sorting
const CRITICALITY_ORDER: Record<string, number> = { CRITICAL: 0, IMPORTANT: 1, SUPPORTIVE: 2 };
const FREQUENCY_ORDER: Record<string, number> = { DAILY: 0, WEEKLY: 1, MONTHLY: 2, QUARTERLY: 3, ANNUALLY: 4, RARELY: 5 };
const COMPLEXITY_ORDER: Record<string, number> = { COMPLEX: 0, MODERATE: 1, SIMPLE: 2 };

export default function TaskAnalysisView({ courseId, pageId, workspaceId }: TaskAnalysisViewProps) {
  const {
    tasks,
    isLoading,
    isSaving,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useLearningTasks(courseId);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilterType>('all');
  const [sort, setSort] = useState<TaskSortField>('criticality');
  const [referencePanelOpen, setReferencePanelOpen] = useState(false);

  // Job title / role description — saved to TaskAnalysis page record
  const [jobTitle, setJobTitle] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [contextLoaded, setContextLoaded] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);

  // Fetch job context on mount
  useEffect(() => {
    if (contextLoaded) return;
    fetch(`/api/pages/${pageId}/task-analysis`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setJobTitle(data.jobTitle || '');
          setRoleDescription(data.roleDescription || '');
        }
        setContextLoaded(true);
      })
      .catch(() => setContextLoaded(true));
  }, [pageId, contextLoaded]);

  // Debounced save for job context
  const saveJobContext = useCallback(
    async (jt: string, rd: string) => {
      setContextSaving(true);
      try {
        await fetch(`/api/pages/${pageId}/task-analysis`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobTitle: jt, roleDescription: rd, tasks: [] }),
        });
      } catch {
        // silently fail — not critical
      } finally {
        setContextSaving(false);
      }
    },
    [pageId]
  );

  // Filter + sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filter === 'training') {
      result = result.filter((t) => t.intervention && TRAINING_INTERVENTIONS.includes(t.intervention as InterventionType));
    } else if (filter === 'job-aid') {
      result = result.filter((t) => t.intervention === 'JOB_AID');
    } else if (filter === 'non-training') {
      result = result.filter((t) => t.intervention && NON_TRAINING_INTERVENTIONS.includes(t.intervention as InterventionType));
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'criticality':
          return (CRITICALITY_ORDER[a.criticality] ?? 99) - (CRITICALITY_ORDER[b.criticality] ?? 99);
        case 'frequency':
          return (FREQUENCY_ORDER[a.frequency] ?? 99) - (FREQUENCY_ORDER[b.frequency] ?? 99);
        case 'complexity':
          return (COMPLEXITY_ORDER[a.complexity] ?? 99) - (COMPLEXITY_ORDER[b.complexity] ?? 99);
        case 'intervention':
          return (a.intervention || 'ZZZ').localeCompare(b.intervention || 'ZZZ');
        default:
          return a.order - b.order;
      }
    });

    return result;
  }, [tasks, filter, sort]);

  // Stats
  const trainingCount = tasks.filter((t) => t.intervention && TRAINING_INTERVENTIONS.includes(t.intervention as InterventionType)).length;
  const nonTrainingCount = tasks.filter((t) => t.intervention && NON_TRAINING_INTERVENTIONS.includes(t.intervention as InterventionType)).length;
  const nonTrainingTasks = tasks.filter((t) => t.intervention && NON_TRAINING_INTERVENTIONS.includes(t.intervention as InterventionType));

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const handleAddTask = async () => {
    const created = await createTask('New Task');
    if (created) {
      setSelectedTaskId(created.id);
    }
  };

  const handleSelect = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  const handleDelete = async (taskId: string) => {
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    await deleteTask(taskId);
  };

  const handleUpdate = useCallback(
    (taskId: string, updates: Partial<LearningTaskData>) => {
      updateTask(taskId, updates);
    },
    [updateTask]
  );

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading task analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Reference Panel */}
      <ReferencePanel
        isOpen={referencePanelOpen}
        onToggle={() => setReferencePanelOpen(!referencePanelOpen)}
        title="Needs Analysis"
      >
        <NeedsAnalysisPanel courseId={courseId} workspaceId={workspaceId} />
      </ReferencePanel>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-semibold text-gray-900">Task Analysis</h1>
              <div className="flex items-center gap-2">
                {isSaving && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                )}
                {error && <span className="text-xs text-red-500">{error}</span>}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Identify what performers need to do, classify performance gaps, and recommend interventions.
            </p>

            {/* Summary stats */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-gray-600">
                <strong>{tasks.length}</strong> task{tasks.length !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600">
                <strong>{trainingCount}</strong> flagged for training
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-orange-600">
                <strong>{nonTrainingCount}</strong> non-training finding{nonTrainingCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Job/Role Context */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Job/Role Context</h3>
            <p className="text-sm text-gray-500 mb-4">Define the job role you are designing training for</p>

            <GuidancePanel>
              What job role are you designing training for? Be specific about the context.
              Include the department, level, and any relevant specializations.
            </GuidancePanel>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onBlur={() => saveJobContext(jobTitle, roleDescription)}
                  placeholder="e.g., Customer Service Representative, Sales Manager"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Description</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  onBlur={() => saveJobContext(jobTitle, roleDescription)}
                  placeholder="Describe the key responsibilities and context for this role..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
                />
              </div>
              {contextSaving && <p className="text-xs text-gray-400">Saving context...</p>}
            </div>
          </div>

          {/* Filters + Add Task */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TaskFilters filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
            <div className="flex items-center gap-3">
              {filter === 'non-training' && <FindingsSummary tasks={nonTrainingTasks} />}
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#03428e] rounded-md hover:bg-[#022d61] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                {tasks.length === 0
                  ? 'No tasks yet. Click "Add Task" to get started.'
                  : 'No tasks match the current filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    isSelected={task.id === selectedTaskId}
                    isFirst={index === 0}
                    isLast={index === filteredTasks.length - 1}
                    onSelect={handleSelect}
                    onMoveUp={(id) => moveTask(id, 'up')}
                    onMoveDown={(id) => moveTask(id, 'down')}
                    onDelete={handleDelete}
                  />
                  {/* Inline edit form when selected */}
                  {task.id === selectedTaskId && selectedTask && (
                    <div className="mt-2">
                      <TaskForm task={selectedTask} onUpdate={handleUpdate} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
