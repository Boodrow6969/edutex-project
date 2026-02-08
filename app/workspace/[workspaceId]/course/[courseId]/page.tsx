'use client';

import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PageType } from '@prisma/client';
import CourseOverview from '@/components/course/CourseOverview';

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  CUSTOM: 'Custom',
  NEEDS_ANALYSIS: 'Needs Analysis',
  TASK_ANALYSIS: 'Task Analysis',
  AUDIENCE_PROFILE: 'Audience Profile',
  LEARNING_OBJECTIVES: 'Learning Objectives',
  ASSESSMENT_PLAN: 'Assessment Plan',
  STORYBOARD: 'Storyboard',
  CURRICULUM_MAP: 'Curriculum Map',
  PROGRAM_NEEDS_ANALYSIS: 'Program Needs Analysis',
  PROGRAM_MAP: 'Program Map',
  PROGRAM_ASSESSMENT_STRATEGY: 'Program Assessment Strategy',
  PROGRAM_EVALUATION: 'Program Evaluation',
};

/**
 * Course detail page showing course overview with pages, objectives, and tasks.
 */
export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;

  // Page creation state
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageType, setNewPageType] = useState<PageType>('CUSTOM');
  const [creatingPage, setCreatingPage] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Key to trigger overview refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenCreatePage = useCallback(() => {
    setShowCreatePage(true);
    setCreateError(null);
  }, []);

  const handleCloseCreatePage = useCallback(() => {
    setShowCreatePage(false);
    setNewPageTitle('');
    setNewPageType('CUSTOM');
    setCreateError(null);
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || creatingPage) return;

    setCreatingPage(true);
    setCreateError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPageTitle.trim(),
          type: newPageType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create page');
      }

      // Success - close modal and refresh overview
      handleCloseCreatePage();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create page';
      setCreateError(message);
    } finally {
      setCreatingPage(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">
            Workspaces
          </Link>
          <span>/</span>
          <span className="text-gray-900">Course</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="p-6 max-w-6xl mx-auto">
        <CourseOverview
          key={refreshKey}
          courseId={courseId}
          workspaceId={workspaceId}
          onCreatePage={handleOpenCreatePage}
        />
      </div>

      {/* Create Page Modal */}
      {showCreatePage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Page</h2>
            </div>

            <form onSubmit={handleCreatePage}>
              <div className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {createError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="pageTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Title
                  </label>
                  <input
                    id="pageTitle"
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="Enter page title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    disabled={creatingPage}
                  />
                </div>

                <div>
                  <label
                    htmlFor="pageType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Type
                  </label>
                  <select
                    id="pageType"
                    value={newPageType}
                    onChange={(e) => setNewPageType(e.target.value as PageType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={creatingPage}
                  >
                    {Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {newPageType === 'NEEDS_ANALYSIS' &&
                      'Analyze training needs with AI assistance'}
                    {newPageType === 'LEARNING_OBJECTIVES' &&
                      'Generate and manage learning objectives'}
                    {newPageType === 'CUSTOM' && 'A blank page for custom content'}
                    {newPageType === 'TASK_ANALYSIS' && 'Break down tasks and job steps'}
                    {newPageType === 'AUDIENCE_PROFILE' && 'Define your target learners'}
                    {newPageType === 'ASSESSMENT_PLAN' && 'Plan assessments and evaluations'}
                    {newPageType === 'STORYBOARD' && 'Create visual storyboards'}
                    {newPageType === 'CURRICULUM_MAP' && 'Map out curriculum structure'}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreatePage}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  disabled={creatingPage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPageTitle.trim() || creatingPage}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingPage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Page'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
