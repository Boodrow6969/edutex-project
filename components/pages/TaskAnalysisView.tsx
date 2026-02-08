'use client';

import { useState, useCallback } from 'react';
import GuidancePanel from '@/components/ui/GuidancePanel';
import MultiInput from '@/components/ui/MultiInput';
import {
  TaskAnalysisFormData,
  TaskAnalysisProps,
  TaskItem,
  TaskStep,
  defaultTaskAnalysisFormData,
  createEmptyTask,
  createEmptyStep,
  aggregateKnowledgeAndSkills,
} from '@/lib/types/taskAnalysis';

const criticalityOptions = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
  { value: 'important', label: 'Important', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'nice-to-have', label: 'Nice-to-have', color: 'bg-gray-100 text-gray-600' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'rarely', label: 'Rarely' },
];

export default function TaskAnalysisView({
  courseId,
  pageId,
  initialData,
  onSave,
}: TaskAnalysisProps) {
  const [formData, setFormData] = useState<TaskAnalysisFormData>({
    ...defaultTaskAnalysisFormData,
    ...initialData,
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedTask = formData.tasks.find((t) => t.id === selectedTaskId);

  const handleFormChange = useCallback((updates: Partial<TaskAnalysisFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveMessage(null);
  }, []);

  const handleSave = async () => {
    if (!onSave) {
      setSaveMessage({ text: 'Save functionality not configured', type: 'error' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await onSave(formData);
      setSaveMessage({ text: 'Progress saved successfully', type: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveMessage({ text: message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Task management
  const handleAddTask = () => {
    const newTask = createEmptyTask();
    handleFormChange({ tasks: [...formData.tasks, newTask] });
    setSelectedTaskId(newTask.id);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<TaskItem>) => {
    handleFormChange({
      tasks: formData.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    });
  };

  const handleRemoveTask = (taskId: string) => {
    handleFormChange({ tasks: formData.tasks.filter((t) => t.id !== taskId) });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // Step management
  const handleAddStep = (taskId: string) => {
    const task = formData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStep = createEmptyStep(task.steps.length);
    handleUpdateTask(taskId, { steps: [...task.steps, newStep] });
  };

  const handleUpdateStep = (taskId: string, stepId: string, updates: Partial<TaskStep>) => {
    const task = formData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    handleUpdateTask(taskId, {
      steps: task.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    });
  };

  const handleRemoveStep = (taskId: string, stepId: string) => {
    const task = formData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newSteps = task.steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, order: i }));
    handleUpdateTask(taskId, { steps: newSteps });
  };

  const handleMoveStep = (taskId: string, stepId: string, direction: 'up' | 'down') => {
    const task = formData.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const stepIndex = task.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (newIndex < 0 || newIndex >= task.steps.length) return;

    const newSteps = [...task.steps];
    [newSteps[stepIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[stepIndex]];
    newSteps.forEach((s, i) => (s.order = i));
    handleUpdateTask(taskId, { steps: newSteps });
  };

  // Multi-input handlers for selected task
  const handleAddPrerequisite = (item: string) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, { prerequisites: [...selectedTask.prerequisites, item] });
  };

  const handleRemovePrerequisite = (index: number) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, {
      prerequisites: selectedTask.prerequisites.filter((_, i) => i !== index),
    });
  };

  const handleAddTool = (item: string) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, { toolsRequired: [...selectedTask.toolsRequired, item] });
  };

  const handleRemoveTool = (index: number) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, {
      toolsRequired: selectedTask.toolsRequired.filter((_, i) => i !== index),
    });
  };

  const handleAddError = (item: string) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, { commonErrors: [...selectedTask.commonErrors, item] });
  };

  const handleRemoveError = (index: number) => {
    if (!selectedTask) return;
    handleUpdateTask(selectedTask.id, {
      commonErrors: selectedTask.commonErrors.filter((_, i) => i !== index),
    });
  };

  const { knowledge, skills } = aggregateKnowledgeAndSkills(formData.tasks);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Task Analysis</h1>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !onSave}
              className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Progress
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Break down complex tasks into teachable components to identify required knowledge, skills, and conditions.
          </p>
          {saveMessage && (
            <div
              className={`mt-3 text-sm ${
                saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Section 1: Job/Role Context */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Job/Role Context</h3>
          <p className="text-sm text-gray-500 mb-4">Define the job role you are designing training for</p>

          <GuidancePanel>
            What job role are you designing training for? Be specific about the context.
            Include the department, level, and any relevant specializations.
          </GuidancePanel>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleFormChange({ jobTitle: e.target.value })}
                placeholder="e.g., Customer Service Representative, Sales Manager"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Description
              </label>
              <textarea
                value={formData.roleDescription}
                onChange={(e) => handleFormChange({ roleDescription: e.target.value })}
                placeholder="Describe the key responsibilities and context for this role..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Task Inventory */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Task Inventory</h3>
          <p className="text-sm text-gray-500 mb-4">List the main tasks this role performs</p>

          <GuidancePanel>
            List the main tasks this role performs. Focus on tasks that relate to the training
            need identified in your Needs Analysis. Rate each by criticality and frequency to
            help prioritize training content.
          </GuidancePanel>

          {/* Task List */}
          <div className="space-y-3 mb-4">
            {formData.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTaskId === task.id
                    ? 'border-[#03428e] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateTask(task.id, { name: e.target.value });
                      }}
                      placeholder="Task name..."
                      className="w-full font-medium text-gray-900 bg-transparent border-0 p-0 focus:ring-0 outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <select
                        value={task.criticality}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateTask(task.id, {
                            criticality: e.target.value as TaskItem['criticality'],
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        {criticalityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={task.frequency}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateTask(task.id, {
                            frequency: e.target.value as TaskItem['frequency'],
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        {frequencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-400">
                        {task.steps.length} step{task.steps.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTask(task.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTask}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#03428e] hover:text-[#03428e] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Section 3: Task Breakdown (for selected task) */}
        {selectedTask && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-gray-900">Task Breakdown</h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  criticalityOptions.find((o) => o.value === selectedTask.criticality)?.color
                }`}
              >
                {criticalityOptions.find((o) => o.value === selectedTask.criticality)?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Breaking down: <strong>{selectedTask.name || 'Untitled task'}</strong>
            </p>

            <GuidancePanel>
              Break the task into sequential steps. For each step, identify what knowledge
              and skills are needed. This becomes the basis for learning content and objectives.
            </GuidancePanel>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Steps/Subtasks
              </label>
              {selectedTask.steps.map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(selectedTask.id, step.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-xs font-medium text-gray-500 text-center">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(selectedTask.id, step.id, 'down')}
                        disabled={index === selectedTask.steps.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) =>
                          handleUpdateStep(selectedTask.id, step.id, { description: e.target.value })
                        }
                        placeholder="Step description..."
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Required Knowledge</label>
                          <input
                            type="text"
                            value={step.requiredKnowledge}
                            onChange={(e) =>
                              handleUpdateStep(selectedTask.id, step.id, { requiredKnowledge: e.target.value })
                            }
                            placeholder="What must they know?"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Required Skill</label>
                          <input
                            type="text"
                            value={step.requiredSkill}
                            onChange={(e) =>
                              handleUpdateStep(selectedTask.id, step.id, { requiredSkill: e.target.value })
                            }
                            placeholder="What must they do?"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(selectedTask.id, step.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddStep(selectedTask.id)}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#03428e] hover:text-[#03428e] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </button>
            </div>

            {/* Prerequisites, Tools, Errors */}
            <div className="space-y-6">
              <MultiInput
                label="Prerequisites"
                placeholder="Add a prerequisite and press Enter..."
                items={selectedTask.prerequisites}
                onAdd={handleAddPrerequisite}
                onRemove={handleRemovePrerequisite}
              />

              <MultiInput
                label="Tools/Systems Required"
                placeholder="Add a tool or system and press Enter..."
                items={selectedTask.toolsRequired}
                onAdd={handleAddTool}
                onRemove={handleRemoveTool}
              />

              <MultiInput
                label="Common Errors"
                placeholder="Add a common error and press Enter..."
                items={selectedTask.commonErrors}
                onAdd={handleAddError}
                onRemove={handleRemoveError}
              />
            </div>
          </div>
        )}

        {/* Section 4: Knowledge & Skills Summary */}
        {(knowledge.length > 0 || skills.length > 0) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Knowledge & Skills Summary</h3>
            <p className="text-sm text-gray-500 mb-4">
              Auto-aggregated from your task breakdowns. This feeds into Learning Objectives.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Knowledge ({knowledge.length})
                </h4>
                {knowledge.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No knowledge items yet</p>
                ) : (
                  <ul className="space-y-1">
                    {knowledge.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-blue-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Skills ({skills.length})
                </h4>
                {skills.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No skills items yet</p>
                ) : (
                  <ul className="space-y-1">
                    {skills.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-green-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
