'use client';

import { ReactNode, useEffect } from 'react';

interface ReferencePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
}

export default function ReferencePanel({
  isOpen,
  onToggle,
  title,
  children,
  position = 'left',
}: ReferencePanelProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onToggle();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Floating toggle button — always visible, offset to avoid sidebar */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? `Close ${title}` : `Open ${title}`}
        className={`fixed z-30 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md shadow-lg transition-all ${
          isOpen
            ? 'bg-[#03428e] text-white'
            : 'bg-white text-[#03428e] border border-[#03428e] hover:bg-blue-50'
        } ${position === 'left' ? 'left-[236px] bottom-4' : 'right-4 bottom-4'}`}
        title={isOpen ? `Close ${title}` : `Open ${title}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">{title}</span>
      </button>

      {/* Desktop: side panel (>= 1024px) */}
      <div
        className={`hidden lg:block relative flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-[40%] min-w-[320px] max-w-[500px]' : 'w-0'
        }`}
      >
        <div className="absolute inset-0 flex flex-col border-r border-gray-200 bg-white">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
            <button
              onClick={onToggle}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Panel content — scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: overlay drawer (< 1024px) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={onToggle}
          />
          {/* Drawer */}
          <div
            className={`absolute top-0 bottom-0 w-[85%] max-w-[400px] bg-white shadow-xl flex flex-col transition-transform duration-300 ${
              position === 'left' ? 'left-0' : 'right-0'
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
              <button
                onClick={onToggle}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
