'use client';

import Link from 'next/link';
import { PageType } from '@prisma/client';

interface PageSummary {
  id: string;
  title: string;
  type: PageType;
  order: number;
  createdAt: string;
}

interface PagesListProps {
  pages: PageSummary[];
  workspaceId: string;
  projectId: string;
  onCreatePage: () => void;
}

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  CUSTOM: 'Custom',
  NEEDS_ANALYSIS: 'Needs Analysis',
  TASK_ANALYSIS: 'Task Analysis',
  AUDIENCE_PROFILE: 'Audience Profile',
  LEARNING_OBJECTIVES: 'Learning Objectives',
  ASSESSMENT_PLAN: 'Assessment Plan',
  STORYBOARD: 'Storyboard',
  CURRICULUM_MAP: 'Curriculum Map',
};

const PAGE_TYPE_COLORS: Record<PageType, string> = {
  CUSTOM: 'bg-gray-100 text-gray-700',
  NEEDS_ANALYSIS: 'bg-purple-100 text-purple-700',
  TASK_ANALYSIS: 'bg-indigo-100 text-indigo-700',
  AUDIENCE_PROFILE: 'bg-pink-100 text-pink-700',
  LEARNING_OBJECTIVES: 'bg-blue-100 text-blue-700',
  ASSESSMENT_PLAN: 'bg-orange-100 text-orange-700',
  STORYBOARD: 'bg-green-100 text-green-700',
  CURRICULUM_MAP: 'bg-teal-100 text-teal-700',
};

/**
 * Displays a list of pages in a project with links to each page.
 */
export default function PagesList({
  pages,
  workspaceId,
  projectId,
  onCreatePage,
}: PagesListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Pages</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreatePage}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Page
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {pages.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-500">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm mb-2">No pages yet</p>
            <button
              onClick={onCreatePage}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Create your first page
            </button>
          </div>
        ) : (
          pages.map((page) => (
            <Link
              key={page.id}
              href={`/workspace/${workspaceId}/project/${projectId}/page/${page.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                    {page.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${PAGE_TYPE_COLORS[page.type]}`}
                >
                  {PAGE_TYPE_LABELS[page.type]}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
