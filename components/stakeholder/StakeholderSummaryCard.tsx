'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StakeholderSummary {
  activeTokenCount: number;
  totalTokenCount: number;
  latestSubmission: {
    id: string;
    stakeholderName: string;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REVISION_REQUESTED';
    submittedAt: string;
  } | null;
  submissionCounts: {
    pending: number;
    approved: number;
    revisionRequested: number;
  };
}

const statusConfig = {
  NOT_STARTED: { label: 'Not Started', bg: 'bg-gray-100', text: 'text-gray-700' },
  PENDING_REVIEW: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  REVISION_REQUESTED: { label: 'Revision Requested', bg: 'bg-orange-100', text: 'text-orange-700' },
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
} as const;

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export default function StakeholderSummaryCard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [data, setData] = useState<StakeholderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(
          `/api/stakeholder/summary?workspaceId=${workspaceId}`
        );
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Silently fail — card will just not render detail
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [workspaceId]);

  const statusKey = data?.latestSubmission
    ? data.latestSubmission.status
    : 'NOT_STARTED';
  const status = statusConfig[statusKey];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="text-base font-semibold text-gray-900">
            Needs Analysis
          </h3>
        </div>
        {!isLoading && (
          <span
            className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.totalTokenCount === 0 ? (
        <p className="text-sm text-gray-500 mb-4">
          Send a needs analysis form to your stakeholders
        </p>
      ) : (
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>{data.activeTokenCount} active link{data.activeTokenCount !== 1 ? 's' : ''}</span>
          {data.latestSubmission && (
            <>
              <span className="text-gray-300">|</span>
              <span>
                Last submitted {formatRelativeDate(data.latestSubmission.submittedAt)}
              </span>
            </>
          )}
        </div>
      )}

      {/* Footer link */}
      <Link
        href={`/workspace/${workspaceId}/needs-analysis`}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Manage &rarr;
      </Link>
    </div>
  );
}
