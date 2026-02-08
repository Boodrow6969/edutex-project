'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText } from 'lucide-react';

interface CourseInfoHeaderProps {
  storyboardId: string;
  courseName: string;
  initialData: {
    title: string;
    targetAudience: string;
    duration: string;
    deliveryMethod: string;
  };
}

const DELIVERY_METHODS = [
  { value: 'eLearning', label: 'eLearning' },
  { value: 'vILT', label: 'Virtual ILT' },
  { value: 'ILT', label: 'Instructor-Led' },
  { value: 'video', label: 'Video' },
  { value: 'blended', label: 'Blended' },
];

export default function CourseInfoHeader({
  storyboardId,
  courseName,
  initialData
}: CourseInfoHeaderProps) {
  const [title, setTitle] = useState(initialData.title || courseName);
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience);
  const [duration, setDuration] = useState(initialData.duration);
  const [deliveryMethod, setDeliveryMethod] = useState(initialData.deliveryMethod || 'eLearning');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Save function
  const saveToServer = useCallback(async (data: Record<string, string>) => {
    if (!storyboardId) {
      console.error('Cannot save: storyboardId is missing');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    try {
      const response = await fetch(`/api/storyboards/${storyboardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to save');
      }
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving storyboard header:', error);
      setSaveStatus('error');
    }
  }, [storyboardId]);

  // Auto-save when fields change (debounced)
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveToServer({ title, targetAudience, duration, deliveryMethod });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, targetAudience, duration, deliveryMethod, saveToServer]);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Course Information</span>
        </div>
        <span className={`text-xs ${
          saveStatus === 'saving' ? 'text-yellow-600' :
          saveStatus === 'error' ? 'text-red-600' :
          'text-gray-400'
        }`}>
          {saveStatus === 'saving' ? 'Saving...' :
           saveStatus === 'error' ? 'Error saving' :
           'Saved'}
        </span>
      </div>

      {/* Fields */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Title - Full Width */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title..."
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Target Audience
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., New hire sales representatives"
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Duration
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30 minutes"
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
          />
        </div>

        {/* Delivery Method */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Delivery Method
          </label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
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
