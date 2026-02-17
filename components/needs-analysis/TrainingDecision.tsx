'use client';

import { useState } from 'react';
import type { CourseAnalysisFormData, StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';
import StakeholderReference from './StakeholderReference';
import MultiInput from '@/components/ui/MultiInput';

interface TrainingDecisionProps {
  data: CourseAnalysisFormData;
  onChange: (updates: Partial<CourseAnalysisFormData>) => void;
  submissions: StakeholderSubmissionDisplay[];
}

const DECISION_OPTIONS = [
  { value: 'yes', label: 'Yes', desc: 'Training is appropriate' },
  { value: 'partial', label: 'Partially', desc: 'Training is part of the solution' },
  { value: 'no', label: 'No', desc: 'Not a training problem' },
] as const;

export default function TrainingDecision({ data, onChange, submissions }: TrainingDecisionProps) {
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  // Map boolean/null to three-way string
  const getSelected = (): 'yes' | 'partial' | 'no' | undefined => {
    if (data.isTrainingSolution === true) return 'yes';
    if (data.isTrainingSolution === false) return 'no';
    if (data.isTrainingSolution === null && (data.nonTrainingFactors || data.solutionRationale)) return 'partial';
    return undefined;
  };

  const selected = getSelected();

  const handleSelect = (value: 'yes' | 'partial' | 'no') => {
    if (value === 'yes') {
      onChange({ isTrainingSolution: true });
    } else if (value === 'no') {
      onChange({ isTrainingSolution: false });
    } else {
      onChange({ isTrainingSolution: null });
    }
  };

  const stakeholderContextData = extractContextData(submissions);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#03428e]">
            4
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Training Decision & Constraints</h2>
            <p className="text-xs text-gray-500">Is training the right solution? What shapes the design?</p>
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

      {showStakeholderRef && stakeholderContextData && (
        <div className="mx-5 mb-4">
          <StakeholderReference
            label="Stakeholder Data — Context"
            onClose={() => setShowStakeholderRef(false)}
          >
            {stakeholderContextData.map((item, i) => (
              <div key={i}>
                <span className="font-medium text-gray-700 text-xs">{item.label}:</span>
                <p className="text-xs text-gray-600 mt-0.5">{item.value}</p>
              </div>
            ))}
          </StakeholderReference>
        </div>
      )}

      <div className="px-5 pb-5 space-y-6">
        {/* Training decision toggle */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Is training the right solution?
          </label>
          <div className="flex gap-2">
            {DECISION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex-1 text-left px-4 py-3 rounded-lg border transition-colors ${
                  selected === opt.value
                    ? opt.value === 'yes'
                      ? 'border-green-500 bg-green-50'
                      : opt.value === 'partial'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Solution rationale */}
        {selected !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Solution Rationale</label>
            <textarea
              value={data.solutionRationale}
              onChange={(e) => onChange({ solutionRationale: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Why is training appropriate (or not)?"
            />
          </div>
        )}

        {/* Non-training factors */}
        {(selected === 'partial' || selected === 'no') && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Non-Training Factors</label>
            <textarea
              value={data.nonTrainingFactors}
              onChange={(e) => onChange({ nonTrainingFactors: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="What factors outside of training need to be addressed?"
            />
          </div>
        )}

        {/* Delivery recommendation */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Recommendation</label>
          <textarea
            value={data.deliveryNotes}
            onChange={(e) => onChange({ deliveryNotes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            rows={2}
            placeholder="Recommended delivery approach based on audience needs, timeline, and constraints..."
          />
        </div>

        {/* Existing materials */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Existing Materials</label>
          <textarea
            value={data.existingMaterials}
            onChange={(e) => onChange({ existingMaterials: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            rows={2}
            placeholder="What existing documentation, training, or materials can be reused or updated?"
          />
        </div>

        {/* Constraints */}
        <MultiInput
          label="Constraints"
          placeholder="Add a constraint..."
          items={data.constraints}
          onAdd={(item) => onChange({ constraints: [...data.constraints, item] })}
          onRemove={(index) => onChange({ constraints: data.constraints.filter((_, i) => i !== index) })}
        />

        {/* Assumptions */}
        <MultiInput
          label="Assumptions"
          placeholder="Add an assumption..."
          items={data.assumptions}
          onAdd={(item) => onChange({ assumptions: [...data.assumptions, item] })}
          onRemove={(index) => onChange({ assumptions: data.assumptions.filter((_, i) => i !== index) })}
        />
      </div>
    </div>
  );
}

// Question IDs relevant to training decision context
const CONTEXT_QUESTION_IDS = new Set([
  'SYS_05',   // Business Problem
  'SYS_06',   // Consequences (Employee)
  'SYS_07',   // Consequences (Customer)
  'SHARED_16', // Sandbox Access
  'SHARED_17', // Realistic Data
  'SHARED_18', // Existing Documentation
  'SHARED_19', // Vendor Training
  'SHARED_20', // Scheduling Constraints
  'SHARED_21', // Training Budget
  'SHARED_22', // Other Constraints
  'SHARED_25', // Concerns
]);

function extractContextData(submissions: StakeholderSubmissionDisplay[]) {
  const items: { label: string; value: string }[] = [];
  for (const sub of submissions) {
    for (const section of sub.sections) {
      for (const resp of section.responses) {
        if (CONTEXT_QUESTION_IDS.has(resp.questionId)) {
          items.push({ label: resp.question, value: resp.value });
        }
      }
    }
  }
  return items.length > 0 ? items : null;
}
