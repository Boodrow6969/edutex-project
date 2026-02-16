'use client';

import { TaskFilterType, TaskSortField } from '@/lib/types/taskAnalysis';

interface TaskFiltersProps {
  filter: TaskFilterType;
  sort: TaskSortField;
  onFilterChange: (filter: TaskFilterType) => void;
  onSortChange: (sort: TaskSortField) => void;
}

const FILTER_OPTIONS: { value: TaskFilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'training', label: 'Training Only' },
  { value: 'job-aid', label: 'Job Aid Only' },
  { value: 'non-training', label: 'Non-Training Findings' },
];

const SORT_OPTIONS: { value: TaskSortField; label: string }[] = [
  { value: 'criticality', label: 'Criticality' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'complexity', label: 'Complexity' },
  { value: 'intervention', label: 'Intervention' },
];

export default function TaskFilters({ filter, sort, onFilterChange, onSortChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500 mr-1">Filter:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === opt.value
                ? 'bg-[#03428e] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as TaskSortField)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
