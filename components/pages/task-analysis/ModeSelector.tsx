'use client';

import { TaskAnalysisType } from '@/lib/types/proceduralTaskAnalysis';

interface ModeSelectorProps {
  analysisType: TaskAnalysisType;
  onChange: (updates: Record<string, unknown>) => void;
}

const MODES: {
  type: TaskAnalysisType;
  label: string;
  description: string;
  enabled: boolean;
}[] = [
  {
    type: 'PROCEDURAL',
    label: 'Procedural',
    description: 'Steps in order. Use when the task has a defined sequence.',
    enabled: true,
  },
  {
    type: 'HIERARCHICAL',
    label: 'Hierarchical (HTA)',
    description: 'Big task with subtasks. Use when the task breaks into parts.',
    enabled: false,
  },
  {
    type: 'COGNITIVE',
    label: 'Cognitive (CTA)',
    description: 'Judgment and decision-making. Use when expertise matters more than steps.',
    enabled: false,
  },
];

export default function ModeSelector({ analysisType, onChange }: ModeSelectorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Analysis Mode</h3>
      <p className="text-sm text-gray-500 mb-4">Choose how to break down this task.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map((mode) => {
          const isSelected = analysisType === mode.type;
          return (
            <button
              key={mode.type}
              type="button"
              disabled={!mode.enabled}
              onClick={() => mode.enabled && onChange({ analysisType: mode.type })}
              className={`relative text-left rounded-lg border-2 p-4 transition-colors ${
                !mode.enabled
                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  : isSelected
                    ? 'border-[#03428e] bg-blue-50/50 ring-1 ring-[#03428e]'
                    : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
              }`}
            >
              {!mode.enabled && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-200 text-gray-500">
                  Coming Soon
                </span>
              )}
              <h4 className={`text-sm font-semibold ${isSelected ? 'text-[#03428e]' : 'text-gray-900'}`}>
                {mode.label}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mode.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
