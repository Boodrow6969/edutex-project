'use client';

import { TRAINING_TYPE_LABELS, TrainingType } from '@/lib/types/stakeholderAnalysis';

interface Submission {
  id: string;
  trainingType: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  stakeholderName: string | null;
  createdAt: string;
}

interface SubmissionsListProps {
  submissions: Submission[];
  onSelect: (submissionId: string) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  SUBMITTED: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  UNDER_REVIEW: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  REVISION_REQUESTED: { label: 'Revision Requested', bg: 'bg-orange-100', text: 'text-orange-700' },
  DRAFT: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SubmissionsList({
  submissions,
  onSelect,
}: SubmissionsListProps) {
  // Filter out DRAFT submissions — they haven't been submitted yet
  const visible = submissions.filter((s) => s.status !== 'DRAFT');

  if (visible.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          No submissions yet. Generate a link and share it with your
          stakeholders.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Stakeholder Name
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Training Type
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Submitted
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visible.map((sub) => {
            const status = statusConfig[sub.status] ?? statusConfig.DRAFT;
            return (
              <tr
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-gray-900">
                  {sub.stakeholderName || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {TRAINING_TYPE_LABELS[sub.trainingType as TrainingType] ??
                    sub.trainingType}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {sub.submittedAt ? formatDate(sub.submittedAt) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {sub.reviewedAt
                    ? formatDate(sub.reviewedAt)
                    : sub.submittedAt
                    ? formatDate(sub.submittedAt)
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
