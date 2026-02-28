'use client';

import { useState } from 'react';
import { BLOOM, BLOOM_KNOWLEDGE, B2V } from '../constants';
import { BloomBadge } from './ObjCard';

interface AKPickerProps {
  onSelect: (verb: string, bloomLevel: string, bloomKnowledge: string) => void;
  selectedVerb: string;
  selectedProcess: string;
  selectedKnowledge: string;
}

export default function AKPicker({
  onSelect,
  selectedVerb,
  selectedProcess,
  selectedKnowledge,
}: AKPickerProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse w-full text-[11px]">
          <thead>
            <tr>
              <th className="px-1.5 py-1 bg-gray-50 border border-gray-200 font-semibold text-gray-500 text-[10px] text-left min-w-[75px]">
                Process ↓
              </th>
              {BLOOM_KNOWLEDGE.map((k) => (
                <th
                  key={k}
                  className="px-1.5 py-1 bg-gray-50 border border-gray-200 font-semibold text-gray-500 text-[10px] text-center min-w-[80px]"
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOM.map((bl) => (
              <tr key={bl.level}>
                <td
                  className="px-1.5 py-1 border border-gray-200 font-semibold text-[11px]"
                  style={{ background: bl.bg, color: bl.color }}
                >
                  {bl.level}
                </td>
                {BLOOM_KNOWLEDGE.map((k) => {
                  const cellKey = `${bl.level}-${k}`;
                  const isSel = selectedProcess === bl.level && selectedKnowledge === k;
                  const isExp = expandedCell === cellKey;
                  const verbs = B2V[cellKey] || [];

                  return (
                    <td
                      key={k}
                      onClick={() => setExpandedCell(isExp ? null : cellKey)}
                      className="p-0 cursor-pointer relative align-top"
                      style={{
                        border: `2px solid ${isSel ? bl.color : '#e2e8f0'}`,
                        background: isSel ? bl.bg : '#fff',
                      }}
                    >
                      <div className="px-1.5 py-1 min-h-[28px] flex items-center justify-center">
                        {isSel && selectedVerb ? (
                          <span className="font-semibold text-[11px]" style={{ color: bl.color }}>
                            {selectedVerb}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">·</span>
                        )}
                      </div>
                      {isExp && (
                        <div
                          className="absolute top-full left-[-1px] z-50 bg-white border rounded-md shadow-lg p-1.5 min-w-[140px]"
                          style={{ borderColor: bl.border }}
                        >
                          <div className="text-[10px] text-gray-500 px-1.5 mb-0.5">
                            Select verb:
                          </div>
                          {verbs.map((v) => (
                            <button
                              key={v}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(v, bl.level, k);
                                setExpandedCell(null);
                              }}
                              className="block w-full text-left px-2 py-1 border-none rounded cursor-pointer text-[11px]"
                              style={{
                                background: v === selectedVerb ? bl.bg : 'transparent',
                                color: v === selectedVerb ? bl.color : '#1e293b',
                                fontWeight: v === selectedVerb ? 600 : 400,
                              }}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedProcess && selectedKnowledge && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-gray-500">Classification:</span>
          <BloomBadge level={selectedProcess} />
          <span className="text-[11px] text-gray-500">×</span>
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {selectedKnowledge}
          </span>
        </div>
      )}
    </div>
  );
}
