'use client';

import { useState, useEffect } from 'react';
import SlideOver from '@/components/ui/SlideOver';
import type { NASection } from '../types';

interface NASlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab: string;
  sections: NASection[];
  submissionMeta?: {
    status: string;
    stakeholderName: string;
    date: string;
  };
}

export default function NASlideOver({
  isOpen,
  onClose,
  defaultTab,
  sections,
  submissionMeta,
}: NASlideOverProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || sections[0]?.key || '');

  useEffect(() => {
    if (defaultTab && isOpen) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  const activeSec = sections.find((s) => s.key === activeTab);

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Needs Analysis Data" width="max-w-xl">
      {/* Submission meta */}
      {submissionMeta && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
            {submissionMeta.status}
          </span>
          <span className="text-xs text-gray-500">
            {submissionMeta.stakeholderName} &bull; {submissionMeta.date}
          </span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 mb-4 -mx-4 px-4">
        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveTab(sec.key)}
            className={`px-3.5 py-2 text-[11px] whitespace-nowrap border-b-2 bg-transparent cursor-pointer ${
              activeTab === sec.key
                ? 'font-semibold'
                : 'font-normal text-gray-500'
            }`}
            style={{
              color: activeTab === sec.key ? sec.color : undefined,
              borderBottomColor: activeTab === sec.key ? sec.color : 'transparent',
            }}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSec && (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-1 h-6 rounded-sm"
              style={{ backgroundColor: activeSec.color }}
            />
            <span className="text-base font-bold text-gray-900">{activeSec.title}</span>
          </div>
          {activeSec.items.map((it, i) => (
            <div
              key={i}
              className={`mb-4 pb-4 ${
                i < activeSec.items.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: activeSec.color }}
              >
                {it.q}
              </div>
              <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                {it.a}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-2.5 border-t border-gray-200 bg-gray-50 -mx-4 px-4 py-2.5">
        <div className="text-[10px] text-gray-500 italic">
          From approved stakeholder submission — read only
        </div>
      </div>
    </SlideOver>
  );
}
