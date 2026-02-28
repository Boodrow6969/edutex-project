'use client';

import { useState } from 'react';
import { BLOOM } from '../constants';

interface BloomVerbPickerProps {
  onSelect: (verb: string, bloomLevel: string, bloomKnowledge: string | null) => void;
  selectedVerb: string;
}

export default function BloomVerbPicker({ onSelect, selectedVerb }: BloomVerbPickerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-1">
      {BLOOM.map((b) => (
        <div key={b.level} className="relative">
          <button
            onClick={() => setExpanded(expanded === b.level ? null : b.level)}
            className="px-2 py-0.5 text-[11px] font-medium rounded border cursor-pointer"
            style={{
              color: b.color,
              backgroundColor: expanded === b.level ? b.bg : 'transparent',
              borderColor: b.border,
            }}
          >
            {b.level} ▾
          </button>
          {expanded === b.level && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-1.5 z-20 flex flex-wrap gap-1 min-w-[180px]"
            >
              {b.verbs.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    onSelect(v, b.level, null);
                    setExpanded(null);
                  }}
                  className="px-2 py-0.5 text-[11px] rounded border cursor-pointer"
                  style={{
                    fontWeight: selectedVerb === v ? 700 : 400,
                    color: selectedVerb === v ? '#fff' : b.color,
                    backgroundColor: selectedVerb === v ? b.color : b.bg,
                    borderColor: b.border,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
