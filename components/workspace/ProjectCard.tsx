'use client';

import Link from 'next/link';

interface CurriculumBadge {
  id: string;
  name: string;
}

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    clientName?: string | null;
    courseType?: string | null;
    phase: string;
    priority: string;
    status: string;
    targetGoLive?: string | null;
    workspaceId?: string | null;
    createdAt: string;
    curricula?: CurriculumBadge[];
  };
  workspaceId: string;
}

const phaseColors: Record<string, string> = {
  intake: 'bg-gray-100 text-gray-700',
  design: 'bg-blue-100 text-blue-700',
  build: 'bg-yellow-100 text-yellow-700',
  pilot: 'bg-purple-100 text-purple-700',
  live: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
};

export default function ProjectCard({ project, workspaceId }: ProjectCardProps) {
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
      href={`/workspace/${workspaceId}/project/${project.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-[#03428e]/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#03428e] transition-colors truncate">
            {project.name}
          </h3>
          {project.clientName && (
            <p className="text-sm text-gray-500 truncate">{project.clientName}</p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
            statusColors[project.status] || statusColors.draft
          }`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.courseType && (
          <span className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200">
            {project.courseType}
          </span>
        )}
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
            phaseColors[project.phase] || phaseColors.intake
          }`}
        >
          {project.phase}
        </span>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
            priorityColors[project.priority] || priorityColors.medium
          }`}
        >
          {project.priority} priority
        </span>
      </div>

      {/* Curricula badges */}
      {project.curricula && project.curricula.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.curricula.slice(0, 2).map((curriculum) => (
            <span
              key={curriculum.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded-full"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="truncate max-w-[100px]">{curriculum.name}</span>
            </span>
          ))}
          {project.curricula.length > 2 && (
            <span className="px-2 py-0.5 text-xs text-purple-600">
              +{project.curricula.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Created {formatDate(project.createdAt)}</span>
        {project.targetGoLive && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Go-live: {formatDate(project.targetGoLive)}
          </span>
        )}
      </div>
    </Link>
  );
}
