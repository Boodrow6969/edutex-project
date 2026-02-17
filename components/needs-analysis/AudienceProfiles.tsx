'use client';

import { useState } from 'react';
import type { AudienceProfileData, StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';
import StakeholderReference from './StakeholderReference';

const DELIVERY_OPTIONS = ['eLearning', 'vILT', 'ILT', 'Job Aid', 'Video', 'OJT/Coaching'];
const TECH_COMFORT = ['Low', 'Moderate', 'High'];

interface AudienceProfilesProps {
  audiences: AudienceProfileData[];
  onChange: (audiences: AudienceProfileData[]) => void;
  submissions: StakeholderSubmissionDisplay[];
}

export default function AudienceProfiles({ audiences, onChange, submissions }: AudienceProfilesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  const addAudience = () => {
    const newAud: AudienceProfileData = {
      role: '',
      headcount: '',
      frequency: 'Daily',
      techComfort: 'Moderate',
      trainingFormat: '',
      notes: '',
      order: audiences.length,
    };
    onChange([...audiences, newAud]);
    setEditingIndex(audiences.length);
  };

  const updateAudience = (index: number, updates: Partial<AudienceProfileData>) => {
    onChange(audiences.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  };

  const removeAudience = (index: number) => {
    onChange(audiences.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const toggleDelivery = (index: number, format: string) => {
    const aud = audiences[index];
    if (!aud) return;
    const current = aud.trainingFormat ? aud.trainingFormat.split(', ').filter(Boolean) : [];
    const newFormats = current.includes(format)
      ? current.filter((f) => f !== format)
      : [...current, format];
    updateAudience(index, { trainingFormat: newFormats.join(', ') });
  };

  // Extract audience-related data from stakeholder submissions
  const stakeholderAudienceData = extractAudienceData(submissions);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#03428e]">
            2
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Audience Profiles</h2>
            <p className="text-xs text-gray-500">
              {audiences.length} audience{audiences.length !== 1 ? 's' : ''} defined
              — who needs training and what&apos;s different for each group
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
            onClick={addAudience}
            className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors flex items-center gap-1 bg-[#03428e] hover:bg-[#022d61]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Audience
          </button>
        </div>
      </div>

      {showStakeholderRef && stakeholderAudienceData && (
        <div className="mx-5 mb-4">
          <StakeholderReference
            label="Stakeholder Data — Audience Info"
            onClose={() => setShowStakeholderRef(false)}
          >
            {stakeholderAudienceData.map((item, i) => (
              <div key={i}>
                <span className="font-medium text-gray-700">{item.label}:</span>
                <p className="text-xs text-gray-600 mt-0.5">{item.value}</p>
              </div>
            ))}
          </StakeholderReference>
        </div>
      )}

      <div className="px-5 pb-5 space-y-3">
        {audiences.map((aud, index) => (
          <AudienceCard
            key={aud.id || `idx-${index}`}
            audience={aud}
            isEditing={editingIndex === index}
            onEdit={() => setEditingIndex(editingIndex === index ? null : index)}
            onUpdate={(updates) => updateAudience(index, updates)}
            onRemove={() => removeAudience(index)}
            onToggleDelivery={(format) => toggleDelivery(index, format)}
          />
        ))}
        {audiences.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No audiences defined yet. Click &quot;Add Audience&quot; to start.
          </div>
        )}
      </div>
    </div>
  );
}

function AudienceCard({
  audience,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  onToggleDelivery,
}: {
  audience: AudienceProfileData;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<AudienceProfileData>) => void;
  onRemove: () => void;
  onToggleDelivery: (format: string) => void;
}) {
  const formats = audience.trainingFormat ? audience.trainingFormat.split(', ').filter(Boolean) : [];

  return (
    <div className={`border rounded-lg transition-all ${isEditing ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onEdit}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {audience.role || 'Untitled Audience'}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {audience.headcount && <span>{audience.headcount} people</span>}
              {audience.frequency && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{audience.frequency}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mr-3">
          {formats.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: f === 'vILT' || f === 'ILT' ? '#dcfce7' : f === 'Job Aid' ? '#fef3c7' : f === 'eLearning' ? '#dbeafe' : '#f3e8ff',
                color: f === 'vILT' || f === 'ILT' ? '#166534' : f === 'Job Aid' ? '#92400e' : f === 'eLearning' ? '#1e40af' : '#6b21a8',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isEditing ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isEditing && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role / Group Name *</label>
              <input
                type="text"
                value={audience.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., CS Lease Support (BPO)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Headcount</label>
              <input
                type="text"
                value={audience.headcount}
                onChange={(e) => onUpdate({ headcount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., ~65"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Frequency of Use</label>
              <input
                type="text"
                value={audience.frequency}
                onChange={(e) => onUpdate({ frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Daily"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tech Comfort</label>
            <div className="flex gap-2">
              {TECH_COMFORT.map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdate({ techComfort: level })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    audience.techComfort === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery Format</label>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_OPTIONS.map((format) => (
                <button
                  key={format}
                  onClick={() => onToggleDelivery(format)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    formats.includes(format)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={audience.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="Additional context about this audience..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 transition-colors">
              Remove audience
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Question IDs relevant to audience profiling
const AUDIENCE_QUESTION_IDS = new Set([
  'SHARED_06',    // Audience by Role (table) — NEW_SYSTEM
  'SHARED_07',    // Role-Based Differences — NEW_SYSTEM
  'SHARED_07B',   // Role-Based Differences (detail) — NEW_SYSTEM
  'SHARED_08',    // Technology Comfort Level — NEW_SYSTEM
  'SHARED_09',    // Prior System Experience — NEW_SYSTEM
  'SHARED_09B',   // Prior System Duration — NEW_SYSTEM
  'SHARED_15',    // Delivery Format Preference
  'LP_PERF_01',   // Learner Roles and Headcount — PERFORMANCE_PROBLEM
  'LP_PERF_02',   // Learner Differences — PERFORMANCE_PROBLEM
  'LP_PERF_02B',  // Learner Differences (detail) — PERFORMANCE_PROBLEM
  'LP_PERF_03',   // Current Skill Level — PERFORMANCE_PROBLEM
  'LP_PERF_04',   // Learner Motivation — PERFORMANCE_PROBLEM
  'LP_PERF_05',   // Nature of the Fix — PERFORMANCE_PROBLEM
  'LP_PERF_06',   // Change Champions — PERFORMANCE_PROBLEM
  'LP_PERF_06B',  // Change Champions (detail) — PERFORMANCE_PROBLEM
  'LP_COMP_01',   // Learner Roles and Headcount — COMPLIANCE
  'LP_COMP_02',   // Role-Based Compliance Differences — COMPLIANCE
  'LP_COMP_02B',  // Role-Based Compliance Differences (detail) — COMPLIANCE
  'LP_COMP_03',   // Compliance Attitude — COMPLIANCE
  'LP_ROLE_01',   // Learner Roles and Headcount — ROLE_CHANGE
  'LP_ROLE_02',   // Voluntary vs. Imposed — ROLE_CHANGE
  'LP_ROLE_03',   // Readiness and Confidence — ROLE_CHANGE
]);

function extractAudienceData(submissions: StakeholderSubmissionDisplay[]) {
  const items: { label: string; value: string }[] = [];
  for (const sub of submissions) {
    for (const section of sub.sections) {
      for (const resp of section.responses) {
        if (AUDIENCE_QUESTION_IDS.has(resp.questionId)) {
          items.push({ label: resp.question, value: resp.value });
        }
      }
    }
  }
  return items.length > 0 ? items : null;
}
