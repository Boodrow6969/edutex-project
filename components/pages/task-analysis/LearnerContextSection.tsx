'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataSourceEntry } from '@/lib/types/proceduralTaskAnalysis';
import { DataSourceBadge } from './TaskIdentitySection';

interface LearnerContextSectionProps {
  audienceRole: string;
  audiencePriorKnowledge: string;
  audienceTechComfort: string;
  constraints: string;
  contextNotes: string;
  dataSource: Record<string, DataSourceEntry>;
  courseId: string;
  onChange: (updates: Record<string, unknown>) => void;
}

const TECH_COMFORT_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'Novice', label: 'Novice' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

interface NAContext {
  audienceRole?: string;
  priorKnowledge?: string;
  techComfort?: string;
  constraints?: string;
}

export default function LearnerContextSection({
  audienceRole,
  audiencePriorKnowledge,
  audienceTechComfort,
  constraints,
  contextNotes,
  dataSource,
  courseId,
  onChange,
}: LearnerContextSectionProps) {
  const [naPromptState, setNaPromptState] = useState<'idle' | 'showing' | 'dismissed'>('idle');
  const [naData, setNaData] = useState<NAContext | null>(null);

  const fieldsEmpty = !audienceRole && !audiencePriorKnowledge && !audienceTechComfort && !constraints;

  const fetchNAContext = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/analysis-context`);
      if (!res.ok) return;
      const data = await res.json();

      // Extract relevant fields from NA context
      const ca = data.courseAnalysis;
      const context: NAContext = {};
      if (ca?.audiences?.length > 0) {
        const audience = ca.audiences[0];
        if (audience.role) context.audienceRole = audience.role;
        if (audience.priorKnowledge) context.priorKnowledge = audience.priorKnowledge;
        if (audience.techComfort) {
          // Normalize enum casing (e.g. "NOVICE" → "Novice") to match select options
          const raw = audience.techComfort as string;
          context.techComfort = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        }
      }
      if (ca?.constraints?.length) {
        context.constraints = ca.constraints.join('; ');
      }

      if (Object.keys(context).length > 0) {
        setNaData(context);
        setNaPromptState('showing');
      }
    } catch { /* ignore — NA data is optional */ }
  }, [courseId]);

  useEffect(() => {
    if (fieldsEmpty && naPromptState === 'idle') {
      fetchNAContext();
    }
  }, [fieldsEmpty, naPromptState, fetchNAContext]);

  const acceptPrePopulate = () => {
    if (!naData) return;
    const updates: Record<string, unknown> = {};
    const newDataSource: Record<string, DataSourceEntry> = { ...dataSource };

    if (naData.audienceRole) {
      updates.audienceRole = naData.audienceRole;
      newDataSource.audienceRole = { source: 'needs_analysis', fieldPath: 'audiences[0].role' };
    }
    if (naData.priorKnowledge) {
      updates.audiencePriorKnowledge = naData.priorKnowledge;
      newDataSource.audiencePriorKnowledge = { source: 'needs_analysis', fieldPath: 'audiences[0].priorKnowledge' };
    }
    if (naData.techComfort) {
      updates.audienceTechComfort = naData.techComfort;
      newDataSource.audienceTechComfort = { source: 'needs_analysis', fieldPath: 'audiences[0].techComfort' };
    }
    if (naData.constraints) {
      updates.constraints = naData.constraints;
      newDataSource.constraints = { source: 'needs_analysis', fieldPath: 'constraints' };
    }

    updates.dataSource = newDataSource;
    onChange(updates);
    setNaPromptState('dismissed');
  };

  const handleFieldChange = (field: string, value: string) => {
    const newDataSource = { ...dataSource, [field]: { source: 'custom' as const } };
    onChange({ [field]: value, dataSource: newDataSource });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Learner Context</h3>
      <p className="text-sm text-gray-500 mb-4">Capture audience context for this specific task.</p>

      {/* Pre-populate prompt */}
      {naPromptState === 'showing' && naData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-[#03428e] mb-2">Pre-populate from Needs Analysis?</p>
          <div className="text-sm text-gray-600 space-y-1 mb-3">
            {naData.audienceRole && <p>Role: <span className="text-gray-900">{naData.audienceRole}</span></p>}
            {naData.priorKnowledge && <p>Prior Knowledge: <span className="text-gray-900">{naData.priorKnowledge}</span></p>}
            {naData.techComfort && <p>Tech Comfort: <span className="text-gray-900">{naData.techComfort}</span></p>}
            {naData.constraints && <p>Constraints: <span className="text-gray-900">{naData.constraints}</span></p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={acceptPrePopulate}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#03428e] rounded-md hover:bg-[#022d61] transition-colors"
            >
              Use This Data
            </button>
            <button
              onClick={() => setNaPromptState('dismissed')}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Audience Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audience Role
            <DataSourceBadge field="audienceRole" dataSource={dataSource} />
          </label>
          <input
            type="text"
            value={audienceRole}
            onChange={(e) => handleFieldChange('audienceRole', e.target.value)}
            placeholder="e.g., New hire customer service agents"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
          />
        </div>

        {/* Prior Knowledge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prior Knowledge
            <DataSourceBadge field="audiencePriorKnowledge" dataSource={dataSource} />
          </label>
          <textarea
            value={audiencePriorKnowledge}
            onChange={(e) => handleFieldChange('audiencePriorKnowledge', e.target.value)}
            placeholder="What do learners already know before this task? What can you assume?"
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>

        {/* Tech Comfort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technology Comfort Level
            <DataSourceBadge field="audienceTechComfort" dataSource={dataSource} />
          </label>
          <select
            value={audienceTechComfort}
            onChange={(e) => handleFieldChange('audienceTechComfort', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none bg-white"
          >
            {TECH_COMFORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Constraints
            <DataSourceBadge field="constraints" dataSource={dataSource} />
          </label>
          <textarea
            value={constraints}
            onChange={(e) => handleFieldChange('constraints', e.target.value)}
            placeholder="Time limits, environment restrictions, equipment limitations..."
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>

        {/* Context Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Context Notes
            <DataSourceBadge field="contextNotes" dataSource={dataSource} />
          </label>
          <textarea
            value={contextNotes}
            onChange={(e) => handleFieldChange('contextNotes', e.target.value)}
            placeholder="Any other observations about learners or their environment..."
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
