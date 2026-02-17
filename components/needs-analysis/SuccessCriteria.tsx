'use client';

import { useState } from 'react';
import type { CourseAnalysisFormData, StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';
import StakeholderReference from './StakeholderReference';

interface SuccessCriteriaProps {
  data: CourseAnalysisFormData;
  onChange: (updates: Partial<CourseAnalysisFormData>) => void;
  submissions: StakeholderSubmissionDisplay[];
}

const LEVELS = [
  {
    key: 'level1Reaction' as const,
    level: 'Level 1: Reaction',
    desc: 'How will you measure learner satisfaction and engagement?',
    color: '#dbeafe',
    borderColor: '#93c5fd',
  },
  {
    key: 'level2Learning' as const,
    level: 'Level 2: Learning',
    desc: 'How will you verify knowledge/skill acquisition?',
    color: '#dcfce7',
    borderColor: '#86efac',
  },
  {
    key: 'level3Behavior' as const,
    level: 'Level 3: Behavior',
    desc: 'How will you confirm on-the-job application?',
    color: '#fef3c7',
    borderColor: '#fde047',
  },
  {
    key: 'level4Results' as const,
    level: 'Level 4: Results',
    desc: 'What business metrics should move?',
    color: '#fce7f3',
    borderColor: '#f9a8d4',
  },
];

export default function SuccessCriteria({ data, onChange, submissions }: SuccessCriteriaProps) {
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  const stakeholderSuccessData = extractSuccessData(submissions);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#03428e]">
            5
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Success Criteria</h2>
            <p className="text-xs text-gray-500">
              Map stakeholder success measures to Kirkpatrick evaluation levels
            </p>
          </div>
        </div>
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
      </div>

      {showStakeholderRef && stakeholderSuccessData && (
        <div className="mx-5 mb-4">
          <StakeholderReference
            label="Stakeholder Data — Success Measures"
            onClose={() => setShowStakeholderRef(false)}
          >
            {stakeholderSuccessData.map((item, i) => (
              <div key={i}>
                <span className="font-medium text-gray-700 text-xs">{item.label}:</span>
                <p className="text-xs text-gray-600 mt-0.5">{item.value}</p>
              </div>
            ))}
          </StakeholderReference>
        </div>
      )}

      <div className="px-5 pb-5 space-y-4">
        {LEVELS.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border p-4"
            style={{ backgroundColor: item.color, borderColor: item.borderColor }}
          >
            <label className="block text-sm font-semibold text-gray-900 mb-0.5">
              {item.level}
            </label>
            <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
            <textarea
              value={data[item.key]}
              onChange={(e) => onChange({ [item.key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Question IDs relevant to success criteria
const SUCCESS_QUESTION_IDS = new Set([
  'SYS_08',               // Success Metrics (new system)
  'SHARED_LEGACY_SUCCESS', // Success Measures (other types)
  'SHARED_26',            // Success Definition (qualitative)
]);

function extractSuccessData(submissions: StakeholderSubmissionDisplay[]) {
  const items: { label: string; value: string }[] = [];
  for (const sub of submissions) {
    for (const section of sub.sections) {
      for (const resp of section.responses) {
        if (SUCCESS_QUESTION_IDS.has(resp.questionId)) {
          items.push({ label: resp.question, value: resp.value });
        }
      }
    }
  }
  return items.length > 0 ? items : null;
}
