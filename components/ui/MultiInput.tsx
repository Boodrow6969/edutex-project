'use client';

import { useState, KeyboardEvent } from 'react';

interface MultiInputProps {
  label: string;
  placeholder?: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  required?: boolean;
}

export default function MultiInput({
  label,
  placeholder = 'Type and press Enter or click + to add',
  items,
  onAdd,
  onRemove,
  required = false,
}: MultiInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          aria-label="Add item"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 mb-2">Press Enter or click + to add</p>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-gray-700 flex-1">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
