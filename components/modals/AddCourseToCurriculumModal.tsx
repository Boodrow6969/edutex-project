'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  name: string;
  description: string | null;
  status: string;
  phase: string;
}

interface AddCourseToCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  workspaceId: string;
  linkedCourseIds: string[];
  onSuccess?: () => void;
}

export default function AddCourseToCurriculumModal({
  isOpen,
  onClose,
  curriculumId,
  workspaceId,
  linkedCourseIds,
  onSuccess,
}: AddCourseToCurriculumModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects?workspaceId=${workspaceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        const allCourses = data.projects || [];
        // Filter out already linked courses
        const availableCourses = allCourses.filter(
          (c: Course) => !linkedCourseIds.includes(c.id)
        );
        setCourses(availableCourses);
        setFilteredCourses(availableCourses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [isOpen, workspaceId, linkedCourseIds]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, courses]);

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCourseId(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/curricula/${curriculumId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add course');
      }

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    complete: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add Course to Curriculum</h2>
            <p className="text-sm text-gray-500">Select an existing course to link</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
          />
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="px-6 py-3 bg-red-50 text-sm text-red-600">{error}</div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {courses.length === 0 ? (
                <p>No available courses to add. All courses are already linked.</p>
              ) : (
                <p>No courses match your search.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedCourseId === course.id ? 'bg-[#03428e]/5 border-l-4 border-[#03428e]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.name}</p>
                    {course.description && (
                      <p className="text-sm text-gray-500 truncate">{course.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded capitalize ${
                        statusColors[course.status] || statusColors.draft
                      }`}
                    >
                      {course.status.replace('_', ' ')}
                    </span>
                    {selectedCourseId === course.id && (
                      <svg className="w-5 h-5 text-[#03428e]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCourseId || isSubmitting}
            className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              'Add Selected Course'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
