'use client';

import { ReactNode } from 'react';

interface StakeholderReferenceProps {
  label?: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function StakeholderReference({
  label = 'From stakeholder submission',
  children,
  onClose,
}: StakeholderReferenceProps) {
  return (
    <div
      className="p-4 rounded-lg border border-blue-200"
      style={{ backgroundColor: '#f0f5fb' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
          {label}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}
