'use client';

import { useState, useCallback } from 'react';
import {
  ProceduralStepData,
  InstructionalEvent,
  INSTRUCTIONAL_EVENT_LABELS,
  INSTRUCTIONAL_EVENT_COLORS,
} from '@/lib/types/proceduralTaskAnalysis';

interface ProceduralStepBuilderProps {
  steps: ProceduralStepData[];
  onChange: (steps: ProceduralStepData[]) => void;
}

function createEmptyStep(stepNumber: number): ProceduralStepData {
  return {
    stepNumber,
    description: '',
    isDecisionPoint: false,
    branchCondition: null,
    commonErrors: null,
    cues: null,
    toolsRequired: null,
    instructionalEvent: null,
    notes: null,
  };
}

const IE_OPTIONS: (InstructionalEvent | '')[] = [
  '',
  'DEMONSTRATION',
  'PRACTICE',
  'DECISION_BRANCH',
  'INFORMATION',
  'EXAMPLE',
  'CAUTION',
];

export default function ProceduralStepBuilder({ steps, onChange }: ProceduralStepBuilderProps) {
  const [expandedExtras, setExpandedExtras] = useState<Record<number, boolean>>({});

  const renumber = (list: ProceduralStepData[]) =>
    list.map((s, i) => ({ ...s, stepNumber: i + 1 }));

  const handleAdd = () => {
    onChange(renumber([...steps, createEmptyStep(steps.length + 1)]));
  };

  const handleDelete = (index: number) => {
    const step = steps[index];
    if (step.description.trim() && !confirm(`Delete step ${step.stepNumber}? This cannot be undone.`)) return;
    const updated = [...steps];
    updated.splice(index, 1);
    onChange(renumber(updated));
  };

  const handleDuplicate = (index: number) => {
    const copy = { ...steps[index], id: undefined };
    const updated = [...steps];
    updated.splice(index + 1, 0, copy);
    onChange(renumber(updated));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(renumber(updated));
  };

  const updateStep = useCallback(
    (index: number, field: keyof ProceduralStepData, value: unknown) => {
      const updated = steps.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      onChange(updated);
    },
    [steps, onChange]
  );

  const toggleExtras = (index: number) => {
    setExpandedExtras((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Procedural Steps</h3>
        <span className="text-xs text-gray-400">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">Break the task into sequential steps. Mark decision points and assign instructional events.</p>

      {steps.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-3">No steps yet. Add the first step to begin.</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#03428e] rounded-md hover:bg-[#022d61] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Step
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id ?? `new-${index}`} className="border border-gray-200 rounded-lg">
              {/* Main row */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Step number + reorder */}
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-xs font-bold text-gray-400 w-6 text-center">{step.stepNumber}</span>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="Describe what the performer does in this step..."
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                    />

                    {/* Inline controls row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Decision point toggle */}
                      <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.isDecisionPoint}
                          onChange={(e) => updateStep(index, 'isDecisionPoint', e.target.checked)}
                          className="rounded border-gray-300 text-[#03428e] focus:ring-[#03428e]"
                        />
                        Decision Point
                      </label>

                      {/* Instructional Event */}
                      <select
                        value={step.instructionalEvent ?? ''}
                        onChange={(e) =>
                          updateStep(index, 'instructionalEvent', e.target.value || null)
                        }
                        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                      >
                        {IE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt ? INSTRUCTIONAL_EVENT_LABELS[opt as InstructionalEvent] : 'Event...'}
                          </option>
                        ))}
                      </select>

                      {step.instructionalEvent && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${INSTRUCTIONAL_EVENT_COLORS[step.instructionalEvent]}`}>
                          {INSTRUCTIONAL_EVENT_LABELS[step.instructionalEvent]}
                        </span>
                      )}

                      {/* Extras toggle */}
                      <button
                        onClick={() => toggleExtras(index)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        {expandedExtras[index] ? 'Hide details' : 'More details'}
                      </button>
                    </div>
                  </div>

                  {/* Row actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(index)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Duplicate"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Decision Point expansion */}
                {step.isDecisionPoint && (
                  <div className="ml-10 mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-2">
                    <p className="text-xs font-medium text-yellow-700">Decision Branch</p>
                    <input
                      type="text"
                      value={step.branchCondition ?? ''}
                      onChange={(e) => updateStep(index, 'branchCondition', e.target.value || null)}
                      placeholder='Condition: "If X, then..."'
                      className="w-full border border-yellow-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    />
                  </div>
                )}

                {/* Extra fields (collapsible) */}
                {expandedExtras[index] && (
                  <div className="ml-10 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Common Errors</label>
                      <input
                        type="text"
                        value={step.commonErrors ?? ''}
                        onChange={(e) => updateStep(index, 'commonErrors', e.target.value || null)}
                        placeholder="Mistakes learners make..."
                        className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Cues</label>
                      <input
                        type="text"
                        value={step.cues ?? ''}
                        onChange={(e) => updateStep(index, 'cues', e.target.value || null)}
                        placeholder="Signals to look for..."
                        className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Tools Required</label>
                      <input
                        type="text"
                        value={step.toolsRequired ?? ''}
                        onChange={(e) => updateStep(index, 'toolsRequired', e.target.value || null)}
                        placeholder="Software, equipment..."
                        className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Step button */}
          <button
            onClick={handleAdd}
            className="w-full border border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Step
          </button>
        </div>
      )}
    </div>
  );
}
