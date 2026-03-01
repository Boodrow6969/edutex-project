'use client';

import { useState } from 'react';
import type { TriageItemData, TriageColumn } from '../types';

interface Screen2Props {
  triageItems: TriageItemData[];
  setTriageItems: React.Dispatch<React.SetStateAction<TriageItemData[]>>;
  courseId: string;
}

interface ColDef {
  label: string;
  what: string;
  why: string;
  question: string;
  color: string;
  bg: string;
  border: string;
}

const COLS: Record<TriageColumn, ColDef> = {
  must: {
    label: 'Must Have',
    what: 'Failure of these tasks have business consequences, including errors, safety risks, compliance violations, or inability to perform the core job.',
    why: 'Every Must Have Task should have a learning objective and an assessment.',
    question: '"Would someone get in trouble or cause harm if they couldn\u2019t do this on Day 1?"',
    color: '#dc2626',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  should: {
    label: 'Should Have',
    what: 'Important for full proficiency but survivable short-term. People could get by using workarounds, job aids, or asking a colleague.',
    why: 'Should Have Tasks require objectives but may use lighter assessment or practice.',
    question: '"Could they muddle through the first week without this, even if it\u2019s not ideal?"',
    color: '#ca8a04',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  nice: {
    label: 'Nice to Have',
    what: 'Strictly optional, these become job aids, reference materials, or Phase 2 training.',
    why: 'Tasks that don\'t require objectives. Use this classification to protect training scope by being honest about priorities.',
    question: '"If we cut this from training entirely, would anyone notice in the first 30 days? Rememeber, If everything is a Must Have, nothing is."',  
    color: '#6b7280',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
};

const COL_KEYS: TriageColumn[] = ['must', 'should', 'nice'];

function getMoveTargets(current: TriageColumn): { key: TriageColumn; arrow: string }[] {
  const idx = COL_KEYS.indexOf(current);
  const targets: { key: TriageColumn; arrow: string }[] = [];
  // Left targets get left arrow, right targets get right arrow
  for (let i = 0; i < COL_KEYS.length; i++) {
    if (i === idx) continue;
    targets.push({
      key: COL_KEYS[i],
      arrow: i < idx ? '\u2190' : '\u2192',
    });
  }
  return targets;
}

export default function Screen2Priority({ triageItems, setTriageItems, courseId }: Screen2Props) {
  const [newItem, setNewItem] = useState('');

  const move = (id: string, to: TriageColumn) => {
    setTriageItems((p) => p.map((i) => (i.id === id ? { ...i, column: to } : i)));
  };

  const add = () => {
    if (!newItem.trim()) return;
    const item: TriageItemData = {
      id: `tri-${Date.now()}`,
      courseId,
      text: newItem.trim(),
      column: 'should',
      source: 'Custom',
      sortOrder: triageItems.length,
    };
    setTriageItems((p) => [...p, item]);
    setNewItem('');
  };

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Content Priority Training Tasks</h2>
      <p className="text-[13px] text-gray-500 mb-4">
        Classify tasks by business impact. Only &ldquo;Must Have&rdquo; and &ldquo;Should Have&rdquo; tasks become learning objectives.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3.5">
        {COL_KEYS.map((key) => {
          const c = COLS[key];
          const items = triageItems.filter((i) => i.column === key);
          return (
            <div
              key={key}
              className={`${c.bg} ${c.border} border rounded-lg p-3 min-h-[220px]`}
            >
              {/* Column header with coaching */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[15px] font-bold" style={{ color: c.color }}>
                  {c.label}
                </span>
                <span className="text-[11px]" style={{ color: c.color }}>
                  {items.length}
                </span>
              </div>
              <div className="text-[12px] text-gray-700 font-semibold leading-snug mb-1.5">
                {c.why}
              </div>              
              <div className="text-[11px] text-gray-600 leading-snug mb-1.5">
                {c.what}
              </div>
              <div className="text-[11px] text-gray-500 italic leading-snug mb-3">
                {c.question}
              </div>

              {/* Divider */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 mb-2" />
              )}

              {/* Items */}
              {items.map((it) => {
                const targets = getMoveTargets(key);
                return (
                  <div
                    key={it.id}
                    className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 mb-1.5 text-xs text-gray-900"
                  >
                    <div className="leading-snug">{it.text}</div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{
                        color: it.source === 'Custom' ? '#03428e' : '#64748b',
                      }}
                    >
                      {it.source === 'NA' ? 'From NA' : it.source === 'TaskAnalysis' ? 'From Task Analysis' : 'Custom'}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {targets.map((t) => {
                        const tc = COLS[t.key];
                        return (
                          <button
                            key={t.key}
                            onClick={() => move(it.id, t.key)}
                            className="px-2 py-0.5 text-[10px] font-medium border rounded bg-white cursor-pointer hover:opacity-80"
                            style={{
                              color: tc.color,
                              borderColor: tc.color + '44',
                            }}
                          >
                            {t.arrow} {tc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a custom task or skill..."
          className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e]"
        />
        <button
          onClick={add}
          className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded cursor-pointer text-xs text-gray-900 hover:bg-gray-100"
        >
          + Add
        </button>
      </div>

      {/* Theory citation footer */}
      <div className="mt-4 border-l-2 border-gray-300 pl-3 py-1">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Content triage separates what training must accomplish from what&apos;s merely nice to cover.
          Prioritize by business consequence, not topic familiarity.
        </p>
        <p className="text-[11px] text-gray-400 italic leading-relaxed mt-1">
          Mager (1997): if the consequence of not performing is trivial, it&apos;s not a training priority.
          Moore (2017): Action Mapping prioritizes tasks by business impact, not topic coverage.
        </p>
      </div>
    </div>
  );
}
