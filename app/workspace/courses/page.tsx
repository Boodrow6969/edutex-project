'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/workspace/CourseCard';
import CreateCourseModal from '@/components/modals/CreateCourseModal';

interface CurriculumBadge {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  courseType: string | null;
  phase: string;
  priority: string;
  status: string;
  targetGoLive: string | null;
  workspaceId: string | null;
  createdAt: string;
  curricula?: CurriculumBadge[];
}

interface Workspace {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch workspaces first
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          if (response.status === 401) {
            setWorkspaces([]);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch workspaces');
        }
        const data = await response.json();
        setWorkspaces(data);

        // Auto-select first workspace if available
        if (data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workspaces');
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [selectedWorkspaceId]);

  // Fetch projects when workspace is selected
  useEffect(() => {
    if (!selectedWorkspaceId) {
      setIsLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/courses?workspaceId=${selectedWorkspaceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedWorkspaceId]);

  const handleCourseCreated = () => {
    // Refetch courses
    if (selectedWorkspaceId) {
      fetch(`/api/courses?workspaceId=${selectedWorkspaceId}`)
        .then((res) => res.json())
        .then((data) => setCourses(data.courses || []))
        .catch(console.error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your learning design courses
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedWorkspaceId}
            className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Course
          </button>
        </div>

        {/* Workspace Selector */}
        {workspaces.length > 1 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Workspace
            </label>
            <select
              value={selectedWorkspaceId || ''}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e] min-w-[200px]"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {workspaces.length === 0 && !isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No workspace yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a workspace first to start managing your courses.
            </p>
            <p className="text-sm text-gray-500">
              Use the sidebar to create a new workspace.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#03428e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#03428e]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first course to start designing learning experiences.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#03428e] hover:bg-[#022d61] text-white font-medium px-5 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create your first course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                workspaceId={selectedWorkspaceId!}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {selectedWorkspaceId && (
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceId={selectedWorkspaceId}
          onSuccess={handleCourseCreated}
        />
      )}
    </div>
  );
}
