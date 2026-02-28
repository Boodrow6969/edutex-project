'use client';

import { useMemo } from 'react';
import type { NASummary } from '../types';

interface Screen1Props {
  gapTypes: { knowledge: boolean; skill: boolean };
  setGapTypes: React.Dispatch<React.SetStateAction<{ knowledge: boolean; skill: boolean }>>;
  naSummary: NASummary | null;
}

export default function Screen1Context({ gapTypes, setGapTypes, naSummary }: Screen1Props) {
  const coaching = useMemo(() => {
    if (gapTypes.knowledge && gapTypes.skill)
      return 'Knowledge + Skill gaps produce a mix of Understand and Apply levels. Both information delivery and hands-on practice needed.';
    if (gapTypes.knowledge)
      return 'Knowledge gaps produce objectives at Remember and Understand levels. Expect information-delivery focused design.';
    if (gapTypes.skill)
      return 'Skill gaps require practice-based objectives at Apply and Analyze levels. Slides alone won\'t close this gap.';
    return null;
  }, [gapTypes]);

  const summaryRows = naSummary
    ? [
        { l: 'Training Type', v: naSummary.trainingType },
        { l: naSummary.labels.businessGoal, v: naSummary.businessGoal },
        { l: 'Target Audience', v: naSummary.audience },
        { l: naSummary.labels.currentState, v: naSummary.currentState },
        { l: naSummary.labels.desiredState, v: naSummary.desiredState },
      ]
    : [];

  return (
    <div className="p-6 max-w-[920px] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Context & Gap Check</h2>
      <p className="text-[13px] text-gray-500 mb-5">
        Review Needs Analysis data and classify the performance gap.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NA Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-1 h-5 bg-[#03428e] rounded-sm" />
            <span className="text-sm font-bold text-gray-900">Needs Analysis Summary</span>
          </div>
          {naSummary ? (
            <>
              {summaryRows.map((r) => (
                <div key={r.l} className="mb-3.5 pb-3 border-b border-gray-200">
                  <div className="text-[11px] font-bold text-[#03428e] uppercase tracking-wide mb-1">
                    {r.l}
                  </div>
                  <div className="text-[13px] text-gray-900 leading-relaxed">{r.v}</div>
                </div>
              ))}
              {naSummary.painPoints.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-[#03428e] uppercase tracking-wide mb-1.5">
                    Stakeholder Pain Points
                  </div>
                  {naSummary.painPoints.map((p, i) => (
                    <div key={i} className="text-[13px] text-gray-900 py-0.5 leading-normal">
                      &bull; {p}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 italic py-4">
              No Needs Analysis data available. Complete the Needs Analysis to populate this summary.
            </div>
          )}
        </div>

        {/* Gap Classification Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-1 h-5 bg-amber-500 rounded-sm" />
            <span className="text-sm font-bold text-gray-900">Gap Classification</span>
          </div>
          <p className="text-[13px] text-gray-900 mb-3.5">
            What type of gap are you addressing?
          </p>

          <div className="flex flex-col gap-2.5 mb-4">
            {[
              {
                key: 'knowledge' as const,
                label: 'Knowledge',
                desc: "They don't know the information",
                icon: '📖',
              },
              {
                key: 'skill' as const,
                label: 'Skill',
                desc: "They can't perform the task (even if they understand it)",
                icon: '🔧',
              },
            ].map((g) => (
              <label
                key={g.key}
                className={`flex gap-2.5 p-3.5 rounded-lg cursor-pointer border-2 transition-colors ${
                  gapTypes[g.key]
                    ? 'border-[#03428e] bg-[#e8eef7]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={gapTypes[g.key]}
                  onChange={() =>
                    setGapTypes((p) => ({ ...p, [g.key]: !p[g.key] }))
                  }
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-[13px] text-gray-900">
                    {g.icon} {g.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{g.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {coaching && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
              <div className="text-[10px] font-semibold text-gray-500 uppercase mb-0.5">
                💡 Coaching
              </div>
              <p className="text-xs text-gray-900 leading-normal">{coaching}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">
              💡 Not a training problem?
            </div>
            <p className="text-[11px] text-gray-900 leading-normal">
              If the gap is motivation or environment, training won&apos;t solve it.
              Consider job aids, process changes, or incentive redesign.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
