'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StakeholderSummaryCard from '@/components/stakeholder/StakeholderSummaryCard';
import StakeholderContactsCard from '@/components/stakeholder/StakeholderContactsCard';

interface Course {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Curriculum {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceDetails {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  role: string | null;
  memberCount: number;
  courseCount: number;
  curriculumCount: number;
  courses: Course[];
  curricula: Curriculum[];
}

/**
 * Workspace detail page showing workspace overview with courses and curricula.
 */
export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course creation state
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Curriculum creation state
  const [showCreateCurriculum, setShowCreateCurriculum] = useState(false);
  const [newCurriculumName, setNewCurriculumName] = useState('');
  const [newCurriculumDescription, setNewCurriculumDescription] = useState('');
  const [creatingCurriculum, setCreatingCurriculum] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/workspaces/${workspaceId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch workspace');
      }

      const data = await response.json();
      setWorkspace(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspace';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || creatingCourse) return;

    setCreatingCourse(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: newCourseName.trim(),
          description: newCourseDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create course');
      }

      setNewCourseName('');
      setNewCourseDescription('');
      setShowCreateCourse(false);
      fetchWorkspace();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create course';
      setError(message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleCreateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurriculumName.trim() || creatingCurriculum) return;

    setCreatingCurriculum(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/curricula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCurriculumName.trim(),
          description: newCurriculumDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create curriculum');
      }

      setNewCurriculumName('');
      setNewCurriculumDescription('');
      setShowCreateCurriculum(false);
      fetchWorkspace();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create curriculum';
      setError(message);
    } finally {
      setCreatingCurriculum(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
            Workspace not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">
            Workspaces
          </Link>
          <span>/</span>
          <span className="text-gray-900">{workspace.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-gray-600">{workspace.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{workspace.courseCount}</div>
            <div className="text-sm text-gray-500">Courses</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{workspace.curriculumCount}</div>
            <div className="text-sm text-gray-500">Curricula</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{workspace.memberCount}</div>
            <div className="text-sm text-gray-500">Members</div>
          </div>
        </div>

        {/* Needs Analysis & Stakeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StakeholderSummaryCard workspaceId={workspaceId} />
          <StakeholderContactsCard workspaceId={workspaceId} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowCreateCourse(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </button>
          <button
            onClick={() => setShowCreateCurriculum(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Curriculum
          </button>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses</h2>
          {workspace.courses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500 mb-4">No courses yet</p>
              <button
                onClick={() => setShowCreateCourse(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first course
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspace.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/workspace/${workspaceId}/course/${course.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{course.name}</h3>
                      {course.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Curricula Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Curricula</h2>
          {workspace.curricula.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 mb-4">No curricula yet</p>
              <button
                onClick={() => setShowCreateCurriculum(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Create your first curriculum
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspace.curricula.map((curriculum) => (
                <Link
                  key={curriculum.id}
                  href={`/workspace/${workspaceId}/curriculum/${curriculum.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{curriculum.name}</h3>
                      {curriculum.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{curriculum.description}</p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                        curriculum.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : curriculum.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {curriculum.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Course</h2>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    id="courseName"
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Enter course name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    disabled={creatingCourse}
                  />
                </div>

                <div>
                  <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="courseDescription"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    placeholder="Enter course description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={creatingCourse}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCourse(false);
                    setNewCourseName('');
                    setNewCourseDescription('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  disabled={creatingCourse}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCourseName.trim() || creatingCourse}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingCourse ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Curriculum Modal */}
      {showCreateCurriculum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Curriculum</h2>
            </div>

            <form onSubmit={handleCreateCurriculum}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="curriculumName" className="block text-sm font-medium text-gray-700 mb-1">
                    Curriculum Name
                  </label>
                  <input
                    id="curriculumName"
                    type="text"
                    value={newCurriculumName}
                    onChange={(e) => setNewCurriculumName(e.target.value)}
                    placeholder="Enter curriculum name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    autoFocus
                    disabled={creatingCurriculum}
                  />
                </div>

                <div>
                  <label htmlFor="curriculumDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="curriculumDescription"
                    value={newCurriculumDescription}
                    onChange={(e) => setNewCurriculumDescription(e.target.value)}
                    placeholder="Enter curriculum description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={creatingCurriculum}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCurriculum(false);
                    setNewCurriculumName('');
                    setNewCurriculumDescription('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  disabled={creatingCurriculum}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCurriculumName.trim() || creatingCurriculum}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingCurriculum ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Curriculum'
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
