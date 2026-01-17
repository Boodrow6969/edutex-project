'use client';

import Link from 'next/link';

interface CurriculumCardProps {
  curriculum: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    programDuration?: string | null;
    totalHours?: number | null;
    certificationName?: string | null;
    courseCount: number;
    createdAt: string;
  };
  workspaceId: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

export default function CurriculumCard({ curriculum, workspaceId }: CurriculumCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/workspace/${workspaceId}/curriculum/${curriculum.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-[#03428e]/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#03428e] transition-colors truncate">
            {curriculum.name}
          </h3>
          {curriculum.certificationName && (
            <p className="text-sm text-gray-500 truncate">{curriculum.certificationName}</p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
            statusColors[curriculum.status] || statusColors.draft
          }`}
        >
          {curriculum.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      {curriculum.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{curriculum.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Course count badge */}
        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded font-medium">
          {curriculum.courseCount} {curriculum.courseCount === 1 ? 'course' : 'courses'}
        </span>

        {/* Program duration */}
        {curriculum.programDuration && (
          <span className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200">
            {curriculum.programDuration}
          </span>
        )}

        {/* Total hours */}
        {curriculum.totalHours && (
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200">
            {curriculum.totalHours} hours
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Created {formatDate(curriculum.createdAt)}</span>
        {curriculum.certificationName && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Certified
          </span>
        )}
      </div>
    </Link>
  );
}
