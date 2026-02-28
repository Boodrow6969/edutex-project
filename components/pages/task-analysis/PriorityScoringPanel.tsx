'use client';

export interface PriorityScores {
  criticalityScore: number | null;
  frequencyScore: number | null;
  difficultyScore: number | null;
  universalityScore: number | null;
  feasibilityScore: number | null;
}

interface PriorityScoringPanelProps extends PriorityScores {
  onChange: (updates: Record<string, unknown>) => void;
}

const CRITERIA: {
  field: string;
  label: string;
  helpText: string;
}[] = [
  {
    field: 'criticalityScore',
    label: 'Criticality',
    helpText: 'How severe are the consequences of doing this task wrong?',
  },
  {
    field: 'frequencyScore',
    label: 'Frequency',
    helpText: 'How often do performers execute this task?',
  },
  {
    field: 'difficultyScore',
    label: 'Difficulty',
    helpText: 'How hard is this task to learn or perform correctly?',
  },
  {
    field: 'universalityScore',
    label: 'Universality',
    helpText: 'How many people in the target audience need this task?',
  },
  {
    field: 'feasibilityScore',
    label: 'Feasibility',
    helpText: 'How realistic is it to train this task given current constraints?',
  },
];

const LEVELS = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Med' },
  { value: 3, label: 'High' },
];

export function getComposite(props: PriorityScores): number | null {
  const scores = [
    props.criticalityScore,
    props.frequencyScore,
    props.difficultyScore,
    props.universalityScore,
    props.feasibilityScore,
  ];
  if (scores.every((s) => s === null)) return null;
  return scores.reduce((sum, s) => (sum ?? 0) + (s ?? 0), 0);
}

export function priorityBadge(score: number | null) {
  if (score === null) return { label: 'Not Scored', color: 'bg-gray-100 text-gray-500' };
  if (score <= 8) return { label: 'Low Priority', color: 'bg-gray-100 text-gray-600' };
  if (score <= 11) return { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'High Priority', color: 'bg-green-100 text-green-700' };
}

export default function PriorityScoringPanel(props: PriorityScoringPanelProps) {
  const { onChange } = props;
  const composite = getComposite(props);
  const priority = priorityBadge(composite);

  const getScore = (field: string): number | null => {
    return props[field as keyof PriorityScoringPanelProps] as number | null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Score task priority across 5 criteria to determine training investment.</p>

        {CRITERIA.map((criterion) => {
          const currentValue = getScore(criterion.field);
          return (
            <div key={criterion.field}>
              <div className="flex items-baseline justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">{criterion.label}</label>
                <span className="text-xs text-gray-400">{criterion.helpText}</span>
              </div>
              <div className="flex gap-1" role="radiogroup" aria-label={criterion.label}>
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    role="radio"
                    aria-checked={currentValue === level.value}
                    onClick={() => onChange({ [criterion.field]: level.value })}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                      currentValue === level.value
                        ? 'bg-[#03428e] text-white border-[#03428e]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Low feasibility warning */}
        {props.feasibilityScore === 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <span className="text-yellow-600 text-lg leading-none">&#9888;</span>
            <p className="text-sm text-yellow-700">
              Low feasibility flagged. Consider whether this task is practical to train given current constraints.
              Document constraints in the learner context section.
            </p>
          </div>
        )}
    </div>
  );
}
