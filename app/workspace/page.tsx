'use client';

import { useState } from 'react';
import { useWorkspacesTree } from '@/lib/hooks/useWorkspacesTree';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateCurriculumModal from '@/components/modals/CreateCurriculumModal';

export default function WorkspacePage() {
  const { workspaces, isLoading, createWorkspace } = useWorkspacesTree();
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateCurriculumModal, setShowCreateCurriculumModal] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  // Use the first workspace if available
  const defaultWorkspace = workspaces[0];

  const handleCreateClick = async (modalType: 'course' | 'curriculum') => {
    // If no workspace exists, create a default one first
    if (!defaultWorkspace) {
      setIsCreatingWorkspace(true);
      const newWorkspace = await createWorkspace('My Workspace');
      setIsCreatingWorkspace(false);

      if (!newWorkspace) {
        return; // Failed to create workspace
      }
    }

    // Open the appropriate modal
    if (modalType === 'course') {
      setShowCreateCourseModal(true);
    } else {
      setShowCreateCurriculumModal(true);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to EduTex
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your instructional design workspace is ready. Get started by creating
          a course or curriculum.
        </p>

        {/* Quick Actions Section */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Course Card */}
            <button
              onClick={() => handleCreateClick('course')}
              disabled={isLoading || isCreatingWorkspace}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-[#03428e]/30 transition-all text-left group disabled:opacity-50 disabled:cursor-wait"
            >
              <div className="w-12 h-12 bg-[#03428e]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#03428e]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#03428e]"
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
                New Course
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a training course with pages for needs analysis,
                objectives, and content design.
              </p>
              <span className="text-sm text-[#03428e] font-medium group-hover:underline">
                {isCreatingWorkspace ? 'Setting up...' : 'Get Started'}
              </span>
            </button>

            {/* Create Curriculum Card */}
            <button
              onClick={() => handleCreateClick('curriculum')}
              disabled={isLoading || isCreatingWorkspace}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-[#03428e]/30 transition-all text-left group disabled:opacity-50 disabled:cursor-wait"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                New Curriculum
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Build a learning program with multiple courses, sequenced
                learning paths, and certifications.
              </p>
              <span className="text-sm text-green-600 font-medium group-hover:underline">
                {isCreatingWorkspace ? 'Setting up...' : 'Get Started'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Start Guide
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#03428e] font-bold">1.</span>
              <span>Create a course or curriculum to get started</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#03428e] font-bold">2.</span>
              <span>Add pages for needs analysis, objectives, and content design</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#03428e] font-bold">3.</span>
              <span>
                Use AI assistance to generate learning objectives and analyze training needs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#03428e] font-bold">4.</span>
              <span>
                Build curricula to organize multiple courses into learning programs
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      {defaultWorkspace && (
        <>
          <CreateProjectModal
            isOpen={showCreateCourseModal}
            onClose={() => setShowCreateCourseModal(false)}
            workspaceId={defaultWorkspace.id}
          />
          <CreateCurriculumModal
            isOpen={showCreateCurriculumModal}
            onClose={() => setShowCreateCurriculumModal(false)}
            workspaceId={defaultWorkspace.id}
          />
        </>
      )}
    </div>
  );
}
