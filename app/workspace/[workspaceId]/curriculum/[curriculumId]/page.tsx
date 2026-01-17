'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageType } from '@prisma/client';
import EditCurriculumModal from '@/components/modals/EditCurriculumModal';
import AddCourseToCurriculumModal from '@/components/modals/AddCourseToCurriculumModal';
import CreateProjectModal from '@/components/modals/CreateProjectModal';

interface CurriculumPage {
  id: string;
  title: string;
  type: PageType;
  order: number;
  createdAt: string;
}

interface LinkedCourse {
  linkId: string;
  order: number;
  linkedAt: string;
  id: string;
  name: string;
  description: string | null;
  status: string;
  phase: string;
}

interface CurriculumData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  programDuration: string | null;
  totalHours: number | null;
  certificationName: string | null;
  audienceProgression: string | null;
  workspaceId: string;
  pages: CurriculumPage[];
  courses: LinkedCourse[];
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
  PROGRAM_NEEDS_ANALYSIS: 'Program Needs Analysis',
  PROGRAM_MAP: 'Program Map',
  PROGRAM_ASSESSMENT_STRATEGY: 'Program Assessment Strategy',
  PROGRAM_EVALUATION: 'Program Evaluation',
};

const PAGE_TYPE_COLORS: Record<string, string> = {
  PROGRAM_NEEDS_ANALYSIS: 'bg-purple-100 text-purple-700',
  PROGRAM_MAP: 'bg-teal-100 text-teal-700',
  PROGRAM_ASSESSMENT_STRATEGY: 'bg-orange-100 text-orange-700',
  PROGRAM_EVALUATION: 'bg-cyan-100 text-cyan-700',
  CUSTOM: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

const courseStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
};

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.curriculumId as string;
  const workspaceId = params.workspaceId as string;

  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  // Page creation state
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageType, setNewPageType] = useState<PageType>('CUSTOM');
  const [creatingPage, setCreatingPage] = useState(false);

  // Course reordering state
  const [reordering, setReordering] = useState(false);

  const fetchCurriculum = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/curricula/${curriculumId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Curriculum not found');
          return;
        }
        throw new Error('Failed to fetch curriculum');
      }
      const data = await response.json();
      setCurriculum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load curriculum');
    } finally {
      setIsLoading(false);
    }
  }, [curriculumId]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || creatingPage) return;

    setCreatingPage(true);
    try {
      const response = await fetch(`/api/curricula/${curriculumId}/pages`, {
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

      setShowCreatePage(false);
      setNewPageTitle('');
      setNewPageType('CUSTOM');
      fetchCurriculum();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create page');
    } finally {
      setCreatingPage(false);
    }
  };

  const handleUnlinkCourse = async (projectId: string) => {
    if (!confirm('Remove this course from the curriculum?')) return;

    try {
      const response = await fetch(`/api/curricula/${curriculumId}/courses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlink course');
      }

      fetchCurriculum();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unlink course');
    }
  };

  const handleMoveCourse = async (projectId: string, direction: 'up' | 'down') => {
    if (!curriculum || reordering) return;

    const currentIndex = curriculum.courses.findIndex((c) => c.id === projectId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= curriculum.courses.length) return;

    // Create new order array
    const newCourses = [...curriculum.courses];
    const [moved] = newCourses.splice(currentIndex, 1);
    newCourses.splice(newIndex, 0, moved);

    const orderedProjectIds = newCourses.map((c) => c.id);

    setReordering(true);
    try {
      const response = await fetch(`/api/curricula/${curriculumId}/courses/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedProjectIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder courses');
      }

      fetchCurriculum();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reorder courses');
    } finally {
      setReordering(false);
    }
  };

  const handleCourseCreated = async (project: { id: string }) => {
    // Link the newly created course to this curriculum
    try {
      await fetch(`/api/curricula/${curriculumId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      fetchCurriculum();
    } catch (err) {
      console.error('Failed to link new course:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#03428e] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading curriculum...</span>
        </div>
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="min-h-full p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Curriculum not found'}</p>
          <Link
            href="/workspace/curriculum"
            className="inline-block mt-4 text-[#03428e] hover:underline"
          >
            Back to Curriculum List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-[#03428e]">
            Workspace
          </Link>
          <span>/</span>
          <Link href="/workspace/curriculum" className="hover:text-[#03428e]">
            Curriculum
          </Link>
          <span>/</span>
          <span className="text-gray-900">{curriculum.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{curriculum.name}</h1>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  statusColors[curriculum.status] || statusColors.draft
                }`}
              >
                {curriculum.status.replace('_', ' ')}
              </span>
            </div>
            {curriculum.description && (
              <p className="text-gray-600 max-w-2xl">{curriculum.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{curriculum.pages.length} pages</span>
              <span>{curriculum.courses.length} courses</span>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {curriculum.programDuration && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
              <p className="font-semibold text-gray-900">{curriculum.programDuration}</p>
            </div>
          )}
          {curriculum.totalHours && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Hours</p>
              <p className="font-semibold text-gray-900">{curriculum.totalHours} hours</p>
            </div>
          )}
          {curriculum.certificationName && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Certification</p>
              <p className="font-semibold text-gray-900">{curriculum.certificationName}</p>
            </div>
          )}
          {curriculum.audienceProgression && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Audience Progression</p>
              <p className="font-semibold text-gray-900">{curriculum.audienceProgression}</p>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pages Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Program Pages</h2>
              <button
                onClick={() => setShowCreatePage(true)}
                className="text-sm text-[#03428e] hover:text-[#022d61] font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Page
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {curriculum.pages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No pages yet</p>
                </div>
              ) : (
                curriculum.pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/workspace/${workspaceId}/curriculum/${curriculumId}/page/${page.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-[#03428e]"
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
                      <span className="text-gray-900 group-hover:text-[#03428e]">{page.title}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        PAGE_TYPE_COLORS[page.type] || PAGE_TYPE_COLORS.CUSTOM
                      }`}
                    >
                      {PAGE_TYPE_LABELS[page.type] || page.type}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Courses Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Courses in Curriculum</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="text-sm text-[#03428e] hover:text-[#022d61] font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Course
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Create New
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {curriculum.courses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">No courses linked yet</p>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="text-sm text-[#03428e] hover:underline"
                  >
                    Add an existing course
                  </button>
                </div>
              ) : (
                curriculum.courses.map((course, index) => (
                  <div
                    key={course.linkId}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 group"
                  >
                    <Link
                      href={`/workspace/${workspaceId}/project/${course.id}`}
                      className="flex-1 flex items-center gap-3"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-500 text-xs rounded">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-gray-900 group-hover:text-[#03428e]">{course.name}</p>
                        <p className="text-xs text-gray-500">{course.phase}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          courseStatusColors[course.status] || courseStatusColors.draft
                        }`}
                      >
                        {course.status.replace('_', ' ')}
                      </span>
                      {/* Reorder buttons */}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveCourse(course.id, 'up')}
                          disabled={index === 0 || reordering}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveCourse(course.id, 'down')}
                          disabled={index === curriculum.courses.length - 1 || reordering}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {/* Unlink button */}
                      <button
                        onClick={() => handleUnlinkCourse(course.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from curriculum"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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
                <div>
                  <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title
                  </label>
                  <input
                    id="pageTitle"
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="Enter page title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                    autoFocus
                    disabled={creatingPage}
                  />
                </div>
                <div>
                  <label htmlFor="pageType" className="block text-sm font-medium text-gray-700 mb-1">
                    Page Type
                  </label>
                  <select
                    id="pageType"
                    value={newPageType}
                    onChange={(e) => setNewPageType(e.target.value as PageType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                    disabled={creatingPage}
                  >
                    <option value="CUSTOM">Custom</option>
                    <option value="PROGRAM_NEEDS_ANALYSIS">Program Needs Analysis</option>
                    <option value="PROGRAM_MAP">Program Map</option>
                    <option value="PROGRAM_ASSESSMENT_STRATEGY">Program Assessment Strategy</option>
                    <option value="PROGRAM_EVALUATION">Program Evaluation</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePage(false);
                    setNewPageTitle('');
                    setNewPageType('CUSTOM');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={creatingPage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPageTitle.trim() || creatingPage}
                  className="px-4 py-2 text-sm bg-[#03428e] text-white rounded-lg hover:bg-[#022d61] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingPage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Edit Curriculum Modal */}
      <EditCurriculumModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        curriculum={curriculum}
        onSuccess={fetchCurriculum}
      />

      {/* Add Course Modal */}
      <AddCourseToCurriculumModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        curriculumId={curriculumId}
        workspaceId={workspaceId}
        linkedCourseIds={curriculum.courses.map((c) => c.id)}
        onSuccess={fetchCurriculum}
      />

      {/* Create Course Modal */}
      <CreateProjectModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        workspaceId={workspaceId}
        onSuccess={handleCourseCreated}
      />
    </div>
  );
}
