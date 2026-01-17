'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Info, Trash2 } from 'lucide-react';

const DELIVERY_METHODS = [
  { value: 'eLearning', label: 'eLearning' },
  { value: 'vILT', label: 'vILT (Virtual Instructor-Led)' },
  { value: 'ILT', label: 'ILT (Instructor-Led)' },
  { value: 'Video', label: 'Video' },
  { value: 'Blended', label: 'Blended' },
] as const;

export default function StoryboardMetadataComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { title, audience, duration, deliveryMethod } = node.attrs;

  return (
    <NodeViewWrapper className="storyboard-metadata-wrapper">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 relative group">
        {/* Delete Button */}
        <button
          type="button"
          onClick={deleteNode}
          title="Delete block"
          className="absolute top-2 right-2 p-1.5 rounded-md
                     text-gray-400 hover:text-red-500 hover:bg-red-50
                     opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
            Course Information
          </h3>
        </div>

        {/* Fields Grid */}
        <div className="space-y-4">
          {/* Title - Full Width */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              placeholder="Enter course title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white placeholder-gray-400"
            />
          </div>

          {/* 2x2 Grid for Other Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audience */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={audience || ''}
                onChange={(e) => updateAttributes({ audience: e.target.value })}
                placeholder="e.g., New employees, Sales team..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white placeholder-gray-400"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estimated Duration
              </label>
              <input
                type="text"
                value={duration || ''}
                onChange={(e) => updateAttributes({ duration: e.target.value })}
                placeholder="e.g., 30 minutes, 2 hours..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white placeholder-gray-400"
              />
            </div>

            {/* Delivery Method */}
            <div className="md:col-span-2 md:w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Delivery Method
              </label>
              <select
                value={deliveryMethod || 'eLearning'}
                onChange={(e) => updateAttributes({ deliveryMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white cursor-pointer"
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
      </div>
    </NodeViewWrapper>
  );
}
