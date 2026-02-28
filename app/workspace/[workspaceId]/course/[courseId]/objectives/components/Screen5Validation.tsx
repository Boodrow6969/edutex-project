'use client';

import { BLOOM, PRI } from '../constants';
import { BloomBadge } from './ObjCard';
import type { WizardObjective, TriageItemData, NASummary } from '../types';

interface Screen5Props {
  objs: WizardObjective[];
  triageItems: TriageItemData[];
  naSummary: NASummary | null;
}

export default function Screen5Validation({ objs, triageItems, naSummary }: Screen5Props) {
  const activeTasks = triageItems.filter((t) => t.column !== 'nice');
  const linked = objs.filter((o) => o.linkedTaskId);
  const unlT = activeTasks.filter((t) => !objs.some((o) => o.linkedTaskId === t.id));
  const unlO = objs.filter((o) => !o.linkedTaskId);

  // Bloom distribution
  const bd: Record<string, number> = {};
  objs.forEach((o) => {
    if (o.bloomLevel) bd[o.bloomLevel] = (bd[o.bloomLevel] || 0) + 1;
  });
  const maxB = Math.max(...Object.values(bd), 1);

  // Priority counts
  const pc: Record<string, number> = { 'Must Have': 0, 'Should Have': 0, 'Nice to Have': 0 };
  objs.forEach((o) => {
    if (o.priority && pc[o.priority] !== undefined) pc[o.priority]++;
  });

  // Assessment alignment
  const needA = objs.filter((o) => o.requiresAssessment);
  const highNA = objs.filter(
    (o) => ['Analyze', 'Evaluate', 'Create'].includes(o.bloomLevel) && !o.requiresAssessment
  );
  const unclass = objs.filter((o) => !o.bloomLevel).length;
  const noPri = objs.filter((o) => !o.priority).length;

  const topB = Object.entries(bd).sort((a, b) => b[1] - a[1])[0];
  const bInterp: Record<string, string> = {
    Remember: 'Heavy Remember suggests content better served by a job aid.',
    Understand: 'Needs clear examples and non-examples, not just definitions.',
    Apply: "Requires hands-on practice — slides alone won't close this gap.",
    Analyze: 'Requires scenario-based practice with varied conditions.',
    Evaluate: 'Common in leadership or QA training, not typical for system rollouts.',
    Create: 'Common in design or strategy training.',
  };

  return (
    <div className="p-5 max-w-[820px] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-1">📊 Validation Dashboard</h2>
      <p className="text-[13px] text-gray-500 mb-5">All advisory. Nothing blocks export.</p>

      {/* Traceability */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-3.5">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🔗</span>
          <span className="text-[15px] font-bold text-gray-900">Traceability</span>
        </div>

        {naSummary && (
          <>
            <div className="text-xs font-bold text-[#03428e] uppercase tracking-wide mb-1.5">
              {naSummary.labels?.businessGoal || 'Business Goal'}
            </div>
            <div className="text-[13px] text-gray-900 leading-normal px-3.5 py-2.5 bg-gray-50 rounded-md mb-3.5 border border-gray-200">
              {naSummary.businessGoal}
            </div>
          </>
        )}

        <div className="text-xs font-bold text-[#03428e] uppercase tracking-wide mb-1.5">
          Parent Tasks → Objectives
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden mb-2.5">
          <div className="grid grid-cols-[1fr_100px_80px] px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>Parent Task</span>
            <span className="text-center">Objectives</span>
            <span className="text-center">Status</span>
          </div>
          {activeTasks.map((t) => {
            const ct = objs.filter((o) => o.linkedTaskId === t.id).length;
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_100px_80px] px-3 py-2 border-b border-gray-200 text-xs items-center"
              >
                <span className="text-gray-900">{t.text}</span>
                <span className="text-center text-gray-900">{ct}</span>
                <span className="text-center">{ct > 0 ? '✅' : '⚠️'}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 text-[13px]">
          <div>
            {linked.length === objs.length ? '✅' : '⚠️'} {linked.length}/{objs.length} objectives
            linked to parent tasks
          </div>
          <div>
            {unlT.length === 0 ? '✅' : '⚠️'} {activeTasks.length - unlT.length}/{activeTasks.length}{' '}
            parent tasks have objectives
          </div>
        </div>

        {unlO.length > 0 && (
          <div className="mt-2.5 bg-[#e8eef7] border border-[#03428e]/15 rounded-md p-2.5">
            <div className="text-[11px] font-semibold text-[#03428e] mb-1">
              ⚠️ {unlO.length} orphan objective{unlO.length !== 1 ? 's' : ''}:
            </div>
            {unlO.map((o) => (
              <div key={o.id} className="text-xs text-[#03428e] py-px">
                &bull; {o.behavior || o.freeformText || 'Untitled'}
              </div>
            ))}
          </div>
        )}
        <div className="text-[11px] text-gray-500 italic mt-1">
          💡 If an objective can&apos;t trace to the business goal through a parent task, it may not
          belong. Orphans are the #1 cause of scope creep.
        </div>
      </div>

      {/* Bloom's Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-3.5">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">📈</span>
          <span className="text-[15px] font-bold text-gray-900">Bloom&apos;s Distribution</span>
        </div>
        <div className="flex flex-col gap-1.5 mb-3">
          {BLOOM.map((bl) => {
            const c = bd[bl.level] || 0;
            return (
              <div key={bl.level} className="flex items-center gap-2.5">
                <span
                  className="text-[11px] w-[75px] text-right font-semibold"
                  style={{ color: bl.color }}
                >
                  {bl.level}
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded flex items-center justify-center"
                    style={{
                      width: `${(c / maxB) * 100}%`,
                      background: bl.fill,
                      minWidth: c > 0 ? 28 : 0,
                    }}
                  >
                    {c > 0 && (
                      <span className="text-[10px] font-bold text-white">{c}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-5 text-right">{c}</span>
              </div>
            );
          })}
        </div>
        {topB && (
          <div className="text-xs text-gray-500 italic mb-2.5">
            💡 Weighted toward {topB[0]}.{' '}
            {topB[0] === 'Apply'
              ? 'Appropriate for new system deployment.'
              : 'Review whether this matches training goals.'}
          </div>
        )}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="grid grid-cols-[90px_40px_1fr] px-2.5 py-1.5 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase">
            <span>Level</span>
            <span className="text-center">#</span>
            <span>Design Implication</span>
          </div>
          {BLOOM.map((bl, i) => (
            <div
              key={bl.level}
              className={`grid grid-cols-[90px_40px_1fr] px-2.5 py-1.5 text-xs items-start ${
                i < 5 ? 'border-b border-gray-200' : ''
              }`}
            >
              <BloomBadge level={bl.level} />
              <span className="text-center text-gray-900 font-semibold">
                {bd[bl.level] || 0}
              </span>
              <span className="text-gray-500 leading-snug">{bInterp[bl.level]}</span>
            </div>
          ))}
        </div>
        {unclass > 0 && (
          <div className="mt-2 text-xs text-gray-500">ℹ️ {unclass} unclassified.</div>
        )}
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-3.5">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🎯</span>
          <span className="text-[15px] font-bold text-gray-900">Priority Breakdown</span>
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {PRI.map((p, i) => {
            const desc: Record<string, string> = {
              'Must Have': 'Directly impacts business goal. Majority of seat time and assessment.',
              'Should Have': 'Important but survivable at go-live. Day 30 refresher candidate.',
              'Nice to Have': 'Low impact if omitted. Cut first. Consider job aid.',
            };
            return (
              <div
                key={p.label}
                className={`grid grid-cols-[140px_1fr] px-3.5 py-2.5 items-start ${
                  i < 2 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{p.dot}</span>
                  <span className="font-bold text-[13px]" style={{ color: p.color }}>
                    {p.label}: {pc[p.label]}
                  </span>
                </div>
                <span className="text-xs text-gray-500 leading-snug">{desc[p.label]}</span>
              </div>
            );
          })}
        </div>
        {noPri > 0 && (
          <div className="mt-2 text-xs text-gray-500">ℹ️ {noPri} without priority.</div>
        )}
      </div>

      {/* Assessment Alignment */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-3.5">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">📋</span>
          <span className="text-[15px] font-bold text-gray-900">Assessment Alignment</span>
        </div>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div>
            {needA.length} objective{needA.length !== 1 ? 's' : ''} flagged for formal assessment
          </div>
          {highNA.length > 0 && (
            <>
              <div>⚠️ {highNA.length} high-Bloom without assessment:</div>
              {highNA.map((o) => (
                <div key={o.id} className="text-xs text-amber-800 pl-5">
                  &bull; {o.bloomLevel}: {(o.behavior || o.freeformText || '').substring(0, 60)}…
                </div>
              ))}
            </>
          )}
          <div>— {objs.length - needA.length} without formal assessment requirement</div>
        </div>
        <div className="text-[11px] text-gray-500 italic mt-1">
          💡 Assessment type assigned in Assessment Builder. Apply+ requires performance observation,
          not multiple-choice.
        </div>
      </div>

      {/* Task Analysis Sync */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🔗</span>
          <span className="text-[15px] font-bold text-gray-900">Task Analysis Sync</span>
        </div>
        <div className="flex items-start gap-2 text-[13px] text-gray-900">
          <span>⚠️</span>
          <div>
            Task Analysis not yet completed. Objectives based on Needs Analysis data and manual
            breakdown.
            <div className="mt-2">
              <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#03428e] border-none rounded cursor-pointer hover:bg-[#022d61]">
                Start Task Analysis →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
