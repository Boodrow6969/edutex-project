'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Info } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export interface CourseInfoData {
  title: string;
  targetAudience: string;
  duration: string;
  deliveryMethod: string;
}

interface CourseInfoHeaderProps {
  storyboardId: string;
  projectName: string;
  initialData: CourseInfoData;
}

const DELIVERY_METHODS = [
  { value: 'eLearning', label: 'eLearning' },
  { value: 'vILT', label: 'Virtual ILT' },
  { value: 'ILT', label: 'Instructor-Led' },
  { value: 'Video', label: 'Video' },
  { value: 'Blended', label: 'Blended' },
];

// =============================================================================
// Component
// =============================================================================

export default function CourseInfoHeader({
  storyboardId,
  projectName,
  initialData,
}: CourseInfoHeaderProps) {
  const [formData, setFormData] = useState<CourseInfoData>(() => ({
    title: initialData.title || projectName,
    targetAudience: initialData.targetAudience || '',
    duration: initialData.duration || '',
    deliveryMethod: initialData.deliveryMethod || 'eLearning',
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>(JSON.stringify(formData));

  // Auto-save with debounce
  const saveChanges = useCallback(async (data: CourseInfoData) => {
    const dataStr = JSON.stringify(data);
    if (dataStr === lastSavedDataRef.current) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/storyboards/${storyboardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      lastSavedDataRef.current = dataStr;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveError(message);
      console.error('Error saving course info:', err);
    } finally {
      setIsSaving(false);
    }
  }, [storyboardId]);

  // Handle field changes with debounced save
  const handleChange = useCallback((field: keyof CourseInfoData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedule save after 500ms
      debounceTimerRef.current = setTimeout(() => {
        saveChanges(updated);
      }, 500);

      return updated;
    });
  }, [saveChanges]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      {/* Header Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Course Information</span>
        </div>
        {isSaving && (
          <span className="text-xs text-gray-500">Saving...</span>
        )}
        {saveError && (
          <span className="text-xs text-red-600">{saveError}</span>
        )}
      </div>

      {/* Form Fields */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            id="course-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter course title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none text-sm"
          />
        </div>

        {/* Two-column layout for smaller fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <input
              id="target-audience"
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              placeholder="e.g., New hires, Sales team"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none text-sm"
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              id="duration"
              type="text"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="e.g., 30 minutes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none text-sm"
            />
          </div>
        </div>

        {/* Delivery Method */}
        <div>
          <label htmlFor="delivery-method" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Method
          </label>
          <select
            id="delivery-method"
            value={formData.deliveryMethod}
            onChange={(e) => handleChange('deliveryMethod', e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none text-sm bg-white"
          >
            {DELIVERY_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
