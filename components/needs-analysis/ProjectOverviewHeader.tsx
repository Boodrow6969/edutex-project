'use client';

import { useState } from 'react';
import type { StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';

interface ProjectOverviewHeaderProps {
  submissions: StakeholderSubmissionDisplay[];
}

function findResponse(submissions: StakeholderSubmissionDisplay[], questionId: string): string {
  for (const sub of submissions) {
    for (const section of sub.sections) {
      for (const resp of section.responses) {
        if (resp.questionId === questionId) return resp.value;
      }
    }
  }
  return '';
}

export default function ProjectOverviewHeader({ submissions }: ProjectOverviewHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  if (submissions.length === 0) return null;

  const sub = submissions[0];
  const projectName = findResponse(submissions, 'SHARED_01') || 'Untitled Project';
  const sponsor = findResponse(submissions, 'SHARED_02');
  const trainingType = sub.trainingType || '';
  const targetDate = findResponse(submissions, 'SHARED_05');
  const systemName = findResponse(submissions, 'SYS_01');
  const replaces = findResponse(submissions, 'SYS_03');
  const connectedSystems = findResponse(submissions, 'SYS_04');
  const businessProblem = findResponse(submissions, 'SYS_05');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#03428e]">
            1
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-gray-900">Project Overview</h2>
            <p className="text-xs text-gray-500">{projectName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {trainingType && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {trainingType}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InfoField label="Project Name" value={projectName} />
            {sponsor && <InfoField label="Sponsor" value={sponsor} />}
            {targetDate && <InfoField label="Target Date" value={targetDate} />}
            {systemName && <InfoField label="System" value={systemName} />}
            {replaces && <InfoField label="Replaces" value={replaces} />}
            {connectedSystems && <InfoField label="Connected Systems" value={connectedSystems} />}
            <InfoField label="Submitted By" value={`${sub.stakeholderName} on ${new Date(sub.submittedAt).toLocaleDateString()}`} />
          </div>
          {businessProblem && (
            <div className="mt-4">
              <InfoField label="Business Problem" value={businessProblem} />
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data from stakeholder submission by {sub.stakeholderName}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}
