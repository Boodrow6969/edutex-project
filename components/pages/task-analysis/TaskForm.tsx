'use client';

import { useCallback, useState } from 'react';
import {
  LearningTaskData,
  GapType,
  InterventionType,
  TaskFrequency,
  TaskCriticality,
  TaskComplexity,
  KnowledgeType,
  GAP_TYPE_LABELS,
  FREQUENCY_LABELS,
  CRITICALITY_LABELS,
  COMPLEXITY_LABELS,
  KNOWLEDGE_TYPE_LABELS,
  TRAINING_INTERVENTIONS,
} from '@/lib/types/taskAnalysis';

interface TaskFormProps {
  task: LearningTaskData;
  onUpdate: (taskId: string, updates: Partial<LearningTaskData>) => void;
}

// ─── Reusable ToggleGroup (used in Task Details accordion) ───

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (val: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              value === opt
                ? 'bg-[#03428e] text-white border-[#03428e]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Gap Type Card Definitions ───

const GAP_CARDS: {
  type: GapType;
  icon: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  headline: string;
  description: string;
}[] = [
  {
    type: 'KNOWLEDGE',
    icon: '🔵',
    colorBg: 'bg-blue-50',
    colorBorder: 'border-blue-300',
    colorText: 'text-blue-800',
    headline: "They don't know how",
    description: 'They lack the info or awareness to do this.',
  },
  {
    type: 'SKILL',
    icon: '🟡',
    colorBg: 'bg-yellow-50',
    colorBorder: 'border-yellow-300',
    colorText: 'text-yellow-800',
    headline: "They know but can't do it well enough",
    description: 'They understand it but need practice/reps.',
  },
  {
    type: 'MOTIVATION',
    icon: '🔴',
    colorBg: 'bg-red-50',
    colorBorder: 'border-red-300',
    colorText: 'text-red-800',
    headline: "They can but won't",
    description: "No consequences, no incentive, or don't see why it matters.",
  },
  {
    type: 'ENVIRONMENT',
    icon: '🟠',
    colorBg: 'bg-orange-50',
    colorBorder: 'border-orange-300',
    colorText: 'text-orange-800',
    headline: 'Something prevents them',
    description: 'Tools, process, or resources block correct performance.',
  },
  {
    type: 'MIXED',
    icon: '⚪',
    colorBg: 'bg-gray-50',
    colorBorder: 'border-gray-300',
    colorText: 'text-gray-700',
    headline: 'Multiple factors',
    description: 'A combination of the above.',
  },
];

// ─── Intervention definitions per gap type ───

interface InterventionOption {
  type: InterventionType;
  label: string;
  description: string;
  warning?: string;
}

const INTERVENTION_CONFIG: Record<GapType, {
  heading: string;
  primary: InterventionOption[];
  secondary: InterventionOption[];
}> = {
  KNOWLEDGE: {
    heading: "They don't know how. What's the best fix?",
    primary: [
      { type: 'TRAINING', label: 'Train them', description: 'Build formal instruction. This task will flow into Learning Objectives.' },
      { type: 'JOB_AID', label: 'Give them a reference', description: 'Create a job aid or quick reference. No formal training needed.' },
    ],
    secondary: [
      { type: 'COACHING', label: 'Coaching', description: 'One-on-one support and mentoring.' },
      { type: 'NONE', label: 'Not worth addressing', description: 'Low priority — skip for now.' },
    ],
  },
  SKILL: {
    heading: "They know how but can't execute well enough. What's the best fix?",
    primary: [
      { type: 'PRACTICE', label: 'Give them practice', description: 'They need reps and feedback. Design practice activities.' },
      { type: 'TRAINING', label: 'Train them', description: 'They need more structured instruction beyond just practice.' },
    ],
    secondary: [
      { type: 'COACHING', label: 'Coaching', description: 'One-on-one support and mentoring.' },
      { type: 'JOB_AID', label: 'Job aid', description: 'Quick reference to support performance.' },
      { type: 'NONE', label: 'Not worth addressing', description: 'Low priority — skip for now.' },
    ],
  },
  MOTIVATION: {
    heading: "They can do it but choose not to. Training probably won't fix this.",
    primary: [
      { type: 'PROCESS_CHANGE', label: 'Fix the incentive/process', description: "Address why they're not motivated. This is a management/org issue." },
      { type: 'COACHING', label: 'Coaching', description: 'One-on-one support to address individual motivation.' },
    ],
    secondary: [
      { type: 'TRAINING', label: 'Train them anyway', description: 'Build formal instruction for this task.', warning: 'Training rarely fixes motivation problems. Consider whether this will actually change behavior.' },
      { type: 'NONE', label: 'Not worth addressing', description: 'Low priority — skip for now.' },
    ],
  },
  ENVIRONMENT: {
    heading: "The system/tools/process is the problem. Training won't fix the tools.",
    primary: [
      { type: 'TOOL_IMPROVEMENT', label: 'Fix the tool or system', description: "Recommend changes to the tool/system that's blocking performance." },
      { type: 'PROCESS_CHANGE', label: 'Fix the process', description: 'Recommend process changes to remove the barrier.' },
      { type: 'JOB_AID', label: 'Work around it with a reference', description: "If the tool can't be fixed, create a job aid to help them navigate it." },
    ],
    secondary: [
      { type: 'TRAINING', label: 'Train them anyway', description: 'Build formal instruction for this task.', warning: "Training won't change a broken tool. Document this as a finding for stakeholders." },
      { type: 'NONE', label: 'Not worth addressing', description: 'Low priority — skip for now.' },
    ],
  },
  MIXED: {
    heading: "Multiple factors are at play. What's the primary intervention?",
    primary: [
      { type: 'TRAINING', label: 'Training', description: 'Build formal instruction. This task will flow into Learning Objectives.' },
      { type: 'PRACTICE', label: 'Practice', description: 'They need reps and feedback. Design practice activities.' },
      { type: 'JOB_AID', label: 'Job Aid', description: 'Create a job aid or quick reference.' },
      { type: 'PROCESS_CHANGE', label: 'Process Change', description: 'Recommend process or organizational changes.' },
      { type: 'TOOL_IMPROVEMENT', label: 'Tool Improvement', description: "Fix the tool/system that's blocking performance." },
      { type: 'COACHING', label: 'Coaching', description: 'One-on-one support and mentoring.' },
      { type: 'NONE', label: 'None', description: 'Not worth addressing right now.' },
    ],
    secondary: [],
  },
};

// ─── Constants ───

const FREQUENCY_OPTIONS: TaskFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];
const CRITICALITY_OPTIONS: TaskCriticality[] = ['CRITICAL', 'IMPORTANT', 'SUPPORTIVE'];
const COMPLEXITY_OPTIONS: TaskComplexity[] = ['SIMPLE', 'MODERATE', 'COMPLEX'];
const KNOWLEDGE_OPTIONS: KnowledgeType[] = ['DECLARATIVE', 'PROCEDURAL', 'CONDITIONAL', 'METACOGNITIVE'];

// ─── Main Component ───

export default function TaskForm({ task, onUpdate }: TaskFormProps) {
  // Accordion state — expanded if any non-default values are set
  const hasNonDefaultDetails =
    task.criticality !== 'IMPORTANT' ||
    task.frequency !== 'WEEKLY' ||
    task.complexity !== 'MODERATE' ||
    task.knowledgeType !== 'PROCEDURAL';
  const [detailsOpen, setDetailsOpen] = useState(hasNonDefaultDetails);
  const [showSecondary, setShowSecondary] = useState(false);

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      const updates: Partial<LearningTaskData> = { [field]: value };

      // Bug 1 fix: When gap type changes, reset intervention and impactNote
      if (field === 'gapType') {
        updates.intervention = null;
        updates.impactNote = null;
        updates.interventionNotes = null;
      }

      // When intervention changes to training type, clear impactNote
      if (field === 'intervention') {
        const intervention = value as InterventionType | null;
        if (intervention && TRAINING_INTERVENTIONS.includes(intervention)) {
          updates.impactNote = null;
        }
      }

      onUpdate(task.id, updates);
    },
    [task.id, onUpdate]
  );

  // Progressive reveal conditions
  const showSection2 = task.title.length >= 3;
  const showSection3 = task.gapType !== null;

  // Intervention display
  const isTrainingIntervention =
    task.intervention !== null && TRAINING_INTERVENTIONS.includes(task.intervention as InterventionType);
  const showImpactNote =
    task.intervention !== null && !TRAINING_INTERVENTIONS.includes(task.intervention as InterventionType);
  const interventionConfig = task.gapType ? INTERVENTION_CONFIG[task.gapType] : null;
  const selectedInterventionWarning =
    interventionConfig?.secondary.find((o) => o.type === task.intervention)?.warning ||
    interventionConfig?.primary.find((o) => o.type === task.intervention)?.warning;

  // Details summary for collapsed accordion
  const detailsSummary = [
    CRITICALITY_LABELS[task.criticality],
    FREQUENCY_LABELS[task.frequency],
    COMPLEXITY_LABELS[task.complexity],
    KNOWLEDGE_TYPE_LABELS[task.knowledgeType],
  ].join(' · ');

  return (
    <div className="border border-[#03428e] rounded-lg bg-blue-50/30 p-5 space-y-0">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: What's the Task?
          ═══════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <label htmlFor={`title-${task.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id={`title-${task.id}`}
            type="text"
            value={task.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={(e) => handleFieldChange('title', e.target.value)}
            placeholder="What does the performer need to do?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor={`desc-${task.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id={`desc-${task.id}`}
            value={task.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={(e) => handleFieldChange('description', e.target.value)}
            rows={2}
            placeholder="Optional details about this task..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
          />
        </div>

        {/* Task Details Accordion */}
        <div className="border border-gray-200 rounded-md bg-white">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            aria-expanded={detailsOpen}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${detailsOpen ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Task Details</span>
            </div>
            {!detailsOpen && (
              <span className="text-xs text-gray-400">{detailsSummary}</span>
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              detailsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
              <ToggleGroup
                label="Criticality"
                value={task.criticality}
                options={CRITICALITY_OPTIONS}
                labels={CRITICALITY_LABELS}
                onChange={(v) => handleFieldChange('criticality', v)}
              />
              <ToggleGroup
                label="Frequency"
                value={task.frequency}
                options={FREQUENCY_OPTIONS}
                labels={FREQUENCY_LABELS}
                onChange={(v) => handleFieldChange('frequency', v)}
              />
              <ToggleGroup
                label="Complexity"
                value={task.complexity}
                options={COMPLEXITY_OPTIONS}
                labels={COMPLEXITY_LABELS}
                onChange={(v) => handleFieldChange('complexity', v)}
              />
              <ToggleGroup
                label="Knowledge Type"
                value={task.knowledgeType}
                options={KNOWLEDGE_OPTIONS}
                labels={KNOWLEDGE_TYPE_LABELS}
                onChange={(v) => handleFieldChange('knowledgeType', v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: What's the Problem?
          ═══════════════════════════════════════════════════════ */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showSection2 ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="border-t border-gray-200 pt-5">
          <p className="text-base font-semibold text-gray-800 mb-1">
            What&apos;s the problem?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Why aren&apos;t they doing this correctly?
          </p>

          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Gap type">
            {GAP_CARDS.map((card) => {
              const isSelected = task.gapType === card.type;
              return (
                <button
                  key={card.type}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${GAP_TYPE_LABELS[card.type]}: ${card.headline}`}
                  onClick={() => handleFieldChange('gapType', card.type)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${card.colorBg} ${card.colorBorder} shadow-sm`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${card.type === 'MIXED' ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none mt-0.5" aria-hidden="true">{card.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? card.colorText : 'text-gray-800'}`}>
                        {card.headline}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Gap: {GAP_TYPE_LABELS[card.type]}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{card.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 flex justify-end">
                      <svg className={`w-5 h-5 ${card.colorText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: What Should We Do About It?
          ═══════════════════════════════════════════════════════ */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showSection3 ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        {interventionConfig && (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <p className="text-base font-semibold text-gray-800">
              What should we do about it?
            </p>
            <p className="text-sm text-gray-500 -mt-2">
              {interventionConfig.heading}
            </p>

            {/* Primary intervention options */}
            <div
              className={`grid gap-3 ${
                interventionConfig.primary.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'
              }`}
              role="radiogroup"
              aria-label="Recommended intervention"
            >
              {interventionConfig.primary.map((opt) => {
                const isSelected = task.intervention === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${opt.label}: ${opt.description}`}
                    onClick={() => handleFieldChange('intervention', opt.type)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-[#03428e] shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isSelected ? 'text-[#03428e]' : 'text-gray-800'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                    {isSelected && (
                      <div className="mt-2 flex justify-end">
                        <svg className="w-5 h-5 text-[#03428e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {opt.warning && isSelected && (
                      <p className="mt-2 text-xs text-amber-600 flex items-start gap-1">
                        <span aria-hidden="true">⚠</span> {opt.warning}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary options (collapsed) — only for non-MIXED */}
            {interventionConfig.secondary.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSecondary(!showSecondary)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${showSecondary ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Other options
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    showSecondary ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {interventionConfig.secondary.map((opt) => {
                      const isSelected = task.intervention === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${opt.label}: ${opt.description}`}
                          onClick={() => handleFieldChange('intervention', opt.type)}
                          className={`text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-[#03428e] shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className={`text-sm font-medium ${isSelected ? 'text-[#03428e]' : 'text-gray-700'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                          {opt.warning && isSelected && (
                            <p className="mt-2 text-xs text-amber-600 flex items-start gap-1">
                              <span aria-hidden="true">⚠</span> {opt.warning}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Post-intervention fields ─── */}
            {task.intervention && (
              <div className="space-y-4 pt-2">
                {/* Training success indicator */}
                {isTrainingIntervention && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    This task will feed into Learning Objectives.
                  </p>
                )}

                {/* Warning for mismatched intervention */}
                {selectedInterventionWarning && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-start gap-1.5">
                    <span className="mt-0.5" aria-hidden="true">⚠</span>
                    {selectedInterventionWarning}
                  </p>
                )}

                {/* Intervention Notes */}
                <div>
                  <label htmlFor={`inotes-${task.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {isTrainingIntervention
                      ? 'Any notes about the training approach?'
                      : 'Describe the recommended action.'}
                  </label>
                  <textarea
                    id={`inotes-${task.id}`}
                    value={task.interventionNotes || ''}
                    onChange={(e) => handleFieldChange('interventionNotes', e.target.value)}
                    onBlur={(e) => handleFieldChange('interventionNotes', e.target.value)}
                    rows={2}
                    placeholder={
                      isTrainingIntervention
                        ? 'Optional notes about the training approach...'
                        : 'What action do you recommend?'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
                  />
                </div>

                {/* Impact Note — only for non-training interventions */}
                {showImpactNote && (
                  <div>
                    <label htmlFor={`impact-${task.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                      What happens if this isn&apos;t addressed correctly?
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      This builds your case for the stakeholder conversation. Document the cost: time wasted, errors, compliance risk, customer impact.
                    </p>
                    <textarea
                      id={`impact-${task.id}`}
                      value={task.impactNote || ''}
                      onChange={(e) => handleFieldChange('impactNote', e.target.value)}
                      onBlur={(e) => handleFieldChange('impactNote', e.target.value)}
                      rows={3}
                      placeholder="What's the cost if this isn't addressed through the right intervention?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
