'use client';

import { ReactNode } from 'react';

interface GuidancePanelProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function GuidancePanel({ children, defaultOpen = false }: GuidancePanelProps) {
  return (
    <details
      className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 group"
      open={defaultOpen}
    >
      <summary className="text-sm font-medium text-[#03428e] cursor-pointer list-none flex items-center gap-2">
        <svg
          className="w-4 h-4 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Guidance
      </summary>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{children}</p>
    </details>
  );
}
