'use client';

import { useState } from 'react';
import type { AnalysisTaskData, AudienceProfileData, StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';
import StakeholderReference from './StakeholderReference';

const INTERVENTION_TYPES = [
  { value: 'training', label: 'Training', color: '#dbeafe', textColor: '#1e40af' },
  { value: 'job-aid', label: 'Job Aid', color: '#fef3c7', textColor: '#92400e' },
  { value: 'awareness', label: 'Awareness', color: '#f3e8ff', textColor: '#6b21a8' },
  { value: 'not-training', label: 'Not Training', color: '#fee2e2', textColor: '#991b1b' },
  { value: 'existing', label: 'Already Known', color: '#f3f4f6', textColor: '#374151' },
];

const COMPLEXITY = [
  { value: 'Low', label: 'Low', color: '#86efac' },
  { value: 'Medium', label: 'Med', color: '#fde047' },
  { value: 'High', label: 'High', color: '#fca5a5' },
];

interface TasksCompetenciesProps {
  tasks: AnalysisTaskData[];
  onChange: (tasks: AnalysisTaskData[]) => void;
  audiences: AudienceProfileData[];
  submissions: StakeholderSubmissionDisplay[];
}

export default function TasksCompetencies({ tasks, onChange, audiences, submissions }: TasksCompetenciesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);
  const [filterIntervention, setFilterIntervention] = useState<string | null>(null);

  const addTask = () => {
    const newTask: AnalysisTaskData = {
      task: '',
      audience: '',
      source: 'ID-added',
      complexity: 'Medium',
      intervention: 'training',
      priority: 'Medium',
      notes: '',
      order: tasks.length,
    };
    onChange([...tasks, newTask]);
    setEditingIndex(tasks.length);
  };

  const updateTask = (index: number, updates: Partial<AnalysisTaskData>) => {
    onChange(tasks.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  };

  const removeTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  // Track original indices so editing/update/remove work correctly after filtering
  const indexedTasks = tasks.map((t, i) => ({ ...t, _index: i }));
  const filteredTasks = filterIntervention
    ? indexedTasks.filter((t) => t.intervention === filterIntervention)
    : indexedTasks;

  const trainingCount = tasks.filter((t) => t.intervention === 'training').length;
  const jobAidCount = tasks.filter((t) => t.intervention === 'job-aid').length;
  const awarenessCount = tasks.filter((t) => t.intervention === 'awareness').length;

  const audienceNames = audiences.map((a) => a.role).filter(Boolean);

  // Extract task-related data from stakeholder submissions
  const stakeholderTaskData = extractTaskData(submissions);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#03428e]">
              3
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Tasks & Competencies</h2>
              <p className="text-xs text-gray-500">
                {tasks.length} items — Tag each task with audience, intervention type, and complexity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {submissions.length > 0 && (
              <button
                onClick={() => setShowStakeholderRef(!showStakeholderRef)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Stakeholder Data
              </button>
            )}
            <button
              onClick={addTask}
              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors flex items-center gap-1 bg-[#03428e] hover:bg-[#022d61]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setFilterIntervention(null)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${!filterIntervention ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === 'training' ? null : 'training')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === 'training' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
          >
            Training ({trainingCount})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === 'job-aid' ? null : 'job-aid')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === 'job-aid' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
          >
            Job Aid ({jobAidCount})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === 'awareness' ? null : 'awareness')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === 'awareness' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
          >
            Awareness ({awarenessCount})
          </button>
        </div>
      </div>

      {showStakeholderRef && stakeholderTaskData && (
        <div className="mx-5 mb-4">
          <StakeholderReference
            label="Stakeholder Data — Tasks Listed"
            onClose={() => setShowStakeholderRef(false)}
          >
            {stakeholderTaskData.map((item, i) => (
              <div key={i}>
                <span className="font-medium text-gray-700 text-xs">{item.label}:</span>
                <p className="text-xs text-gray-600 mt-0.5">{item.value}</p>
              </div>
            ))}
          </StakeholderReference>
        </div>
      )}

      {/* Task list */}
      <div className="px-5 pb-5 space-y-2">
        {filteredTasks.map((task) => (
          <TaskRow
            key={task.id || `idx-${task._index}`}
            task={task}
            isEditing={editingIndex === task._index}
            onEdit={() => setEditingIndex(editingIndex === task._index ? null : task._index)}
            onUpdate={(updates) => updateTask(task._index, updates)}
            onRemove={() => removeTask(task._index)}
            audienceNames={audienceNames}
          />
        ))}
        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No tasks match the current filter.
          </div>
        )}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No tasks defined yet. Click &quot;Add Task&quot; or import from stakeholder data.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  audienceNames,
}: {
  task: AnalysisTaskData;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<AnalysisTaskData>) => void;
  onRemove: () => void;
  audienceNames: string[];
}) {
  const intervention = INTERVENTION_TYPES.find((i) => i.value === task.intervention);
  const complexity = COMPLEXITY.find((c) => c.value === task.complexity);
  const isPriority = task.priority === 'Critical' || task.priority === 'High';

  const taskAudiences = task.audience ? task.audience.split(', ').filter(Boolean) : [];

  const toggleAudience = (name: string) => {
    const newAuds = taskAudiences.includes(name)
      ? taskAudiences.filter((a) => a !== name)
      : [...taskAudiences, name];
    onUpdate({ audience: newAuds.join(', ') });
  };

  return (
    <div className={`border rounded-lg transition-all ${isEditing ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}>
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onEdit}
      >
        {/* Priority indicator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ priority: isPriority ? 'Medium' : 'High' });
          }}
          className={`flex-shrink-0 ${isPriority ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
          title={isPriority ? 'High priority' : 'Mark as priority'}
        >
          <svg className="w-4 h-4" fill={isPriority ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
          {task.task || 'Untitled task'}
        </span>

        {task.source === 'ID-added' && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 flex-shrink-0 font-medium">
            ID
          </span>
        )}

        {complexity && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: complexity.color }}
            title={`Complexity: ${complexity.label}`}
          />
        )}

        {intervention && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ backgroundColor: intervention.color, color: intervention.textColor }}
          >
            {intervention.label}
          </span>
        )}

        <span className="text-xs text-gray-400 flex-shrink-0">
          {taskAudiences.length} aud.
        </span>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isEditing ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isEditing && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task Description *</label>
            <textarea
              value={task.task}
              onChange={(e) => onUpdate({ task: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="What does the learner need to be able to do?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Intervention Type</label>
              <div className="flex flex-wrap gap-1.5">
                {INTERVENTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onUpdate({ intervention: type.value })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      task.intervention === type.value ? 'border-gray-400 font-medium' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={task.intervention === type.value ? { backgroundColor: type.color, color: type.textColor } : {}}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Complexity</label>
              <div className="flex gap-1.5">
                {COMPLEXITY.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onUpdate({ complexity: c.value })}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                      task.complexity === c.value ? 'border-gray-400 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={task.complexity === c.value ? { backgroundColor: c.color } : {}}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Applies To (Audiences)</label>
            <div className="flex flex-wrap gap-1.5">
              {audienceNames.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleAudience(name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    taskAudiences.includes(name)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {name}
                </button>
              ))}
              {audienceNames.length === 0 && (
                <span className="text-xs text-gray-400">Define audiences in Section 2 first</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ID Notes</label>
            <textarea
              value={task.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="Design rationale, stakeholder context, risk notes..."
            />
          </div>

          <div className="flex justify-end">
            <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 transition-colors">
              Remove task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Question IDs relevant to tasks and competencies
const TASK_QUESTION_IDS = new Set([
  'SYS_02',  // System Capabilities
  'SYS_09',  // Critical Tasks
  'SYS_10',  // High-Stakes Situations
  'SYS_11',  // Acceptable Performance at Launch
  'SYS_12',  // Proficient Performance at 30 Days
]);

function extractTaskData(submissions: StakeholderSubmissionDisplay[]) {
  const items: { label: string; value: string }[] = [];
  for (const sub of submissions) {
    for (const section of sub.sections) {
      for (const resp of section.responses) {
        if (TASK_QUESTION_IDS.has(resp.questionId)) {
          items.push({ label: resp.question, value: resp.value });
        }
      }
    }
  }
  return items.length > 0 ? items : null;
}
