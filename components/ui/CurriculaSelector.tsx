'use client';

import { useState, useEffect, useRef } from 'react';

interface Curriculum {
  id: string;
  name: string;
  status: string;
}

interface CurriculaSelectorProps {
  courseId: string;
  workspaceId: string;
  disabled?: boolean;
  onCurriculaChange?: (curriculumIds: string[]) => void;
}

export default function CurriculaSelector({
  courseId,
  workspaceId,
  disabled = false,
  onCurriculaChange,
}: CurriculaSelectorProps) {
  const [allCurricula, setAllCurricula] = useState<Curriculum[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingCurricula, setIsLoadingCurricula] = useState(true);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available curricula in workspace
  useEffect(() => {
    const fetchCurricula = async () => {
      if (!workspaceId) return;

      try {
        setIsLoadingCurricula(true);
        const response = await fetch(`/api/curricula?workspaceId=${workspaceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch curricula');
        }
        const data = await response.json();
        setAllCurricula(data || []);
      } catch (err) {
        console.error('Failed to fetch curricula:', err);
        setError('Failed to load curricula');
      } finally {
        setIsLoadingCurricula(false);
      }
    };

    fetchCurricula();
  }, [workspaceId]);

  // Fetch current curricula memberships for this course
  useEffect(() => {
    const fetchCurrentMemberships = async () => {
      if (!courseId) return;

      try {
        setIsLoadingMemberships(true);
        const response = await fetch(`/api/courses/${courseId}/curricula`);
        if (response.ok) {
          const data = await response.json();
          // API returns array of curriculum objects directly
          const currentIds = Array.isArray(data) ? data.map((c: Curriculum) => c.id) : [];
          setSelectedIds(currentIds);
        }
      } catch (err) {
        console.error('Failed to fetch curricula memberships:', err);
        // Don't show error - just start with empty selection
      } finally {
        setIsLoadingMemberships(false);
      }
    };

    fetchCurrentMemberships();
  }, [courseId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save curriculum changes to API
  const saveCurriculaChange = async (newIds: string[]) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/curricula`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumIds: newIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update curricula');
      }

      setSelectedIds(newIds);
      if (onCurriculaChange) {
        onCurriculaChange(newIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      // Don't update state on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = (curriculumId: string) => {
    if (!selectedIds.includes(curriculumId)) {
      saveCurriculaChange([...selectedIds, curriculumId]);
    }
    setIsDropdownOpen(false);
  };

  const handleRemove = (curriculumId: string) => {
    saveCurriculaChange(selectedIds.filter(id => id !== curriculumId));
  };

  // Get selected curricula details
  const selectedCurricula = allCurricula.filter(c => selectedIds.includes(c.id));
  const availableCurricula = allCurricula.filter(c => !selectedIds.includes(c.id));

  const isLoading = isLoadingCurricula || isLoadingMemberships;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        Loading curricula...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* Selected curricula chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {selectedCurricula.map((curriculum) => (
          <span
            key={curriculum.id}
            className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            {curriculum.name}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(curriculum.id)}
                disabled={isSaving}
                className="ml-0.5 hover:bg-purple-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                title="Remove from curriculum"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Add button with dropdown */}
        {!disabled && availableCurricula.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 border border-dashed border-gray-300 hover:border-[#03428e] text-gray-500 hover:text-[#03428e] rounded-full px-3 py-1 text-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Curriculum
                </>
              )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-auto">
                {availableCurricula.map((curriculum) => (
                  <button
                    key={curriculum.id}
                    type="button"
                    onClick={() => handleAdd(curriculum.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="flex-1 truncate">{curriculum.name}</span>
                    <span className="text-xs text-gray-400 capitalize">{curriculum.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {selectedCurricula.length === 0 && !disabled && availableCurricula.length === 0 && (
          <span className="text-sm text-gray-400 italic">
            No curricula available in this workspace
          </span>
        )}

        {selectedCurricula.length === 0 && availableCurricula.length > 0 && !isDropdownOpen && (
          <span className="text-sm text-gray-400 italic">
            Not part of any curriculum
          </span>
        )}
      </div>
    </div>
  );
}
