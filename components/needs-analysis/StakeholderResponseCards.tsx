'use client';

import { useState } from 'react';
import { StakeholderSubmissionDisplay } from '@/lib/types/courseAnalysis';

interface StakeholderResponseCardsProps {
  submissions: StakeholderSubmissionDisplay[];
  workspaceId: string;
}

function SubmissionCard({ submission }: { submission: StakeholderSubmissionDisplay }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <span className="font-medium text-gray-900 text-sm">
              {submission.stakeholderName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{submission.trainingType.replace(/_/g, ' ')}</span>
              {formattedDate && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
            {submission.status}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {submission.sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <div className="space-y-2">
                {section.responses.map((resp) => (
                  <div key={resp.questionId} className="bg-white rounded p-3 border border-blue-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">{resp.question}</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{resp.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StakeholderResponseCards({
  submissions,
  workspaceId,
}: StakeholderResponseCardsProps) {
  if (submissions.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">No approved stakeholder submissions yet</p>
        <a
          href={`/workspace/${workspaceId}/needs-analysis`}
          className="text-sm text-[#03428e] hover:underline"
        >
          Go to Workspace Needs Analysis to manage submissions
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Stakeholder Responses</h3>
        <span className="text-xs text-gray-500">
          {submissions.length} approved submission{submissions.length !== 1 ? 's' : ''}
        </span>
      </div>
      {submissions.map((sub) => (
        <SubmissionCard key={sub.id} submission={sub} />
      ))}
    </div>
  );
}
