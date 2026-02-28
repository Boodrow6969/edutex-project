'use client';

import { useState } from 'react';
import { BLOOM, PRI } from '../constants';
import { newObjective } from '../constants';
import type {
  WizardObjective,
  TriageItemData,
  ViewMode,
  TheoryMode,
  AudienceMode,
} from '../types';
import ObjCard from './ObjCard';
import ContextStrip from './ContextStrip';
import ComposedBanner from './ComposedBanner';
import BloomVerbPicker from './BloomVerbPicker';
import AKPicker from './AKPicker';
import { BloomBadge } from './ObjCard';

interface Screen4Props {
  objs: WizardObjective[];
  setObjs: React.Dispatch<React.SetStateAction<WizardObjective[]>>;
  selId: string | null;
  setSelId: (id: string) => void;
  triageItems: TriageItemData[];
  gapTypes: { knowledge: boolean; skill: boolean };
  audiences: string[];
  openNA: (tab: string) => void;
  showAI: boolean;
  setShowAI: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Screen4Builder({
  objs,
  setObjs,
  selId,
  setSelId,
  triageItems,
  gapTypes,
  audiences,
  openNA,
  showAI,
  setShowAI,
}: Screen4Props) {
  const sel = objs.find((o) => o.id === selId) || null;
  const selIdx = objs.findIndex((o) => o.id === selId);
  const [viewMode, setViewMode] = useState<ViewMode>('guided');
  const [theory, setTheory] = useState<TheoryMode>('bloom');
  const [audMode, setAudMode] = useState<AudienceMode>('picklist');

  const chg = (field: string, value: unknown) => {
    setObjs((p) =>
      p.map((o) => (o.id === selId ? { ...o, [field]: value } : o))
    );
  };

  const verbSel = (v: string, bl: string, bk: string | null) => {
    setObjs((p) =>
      p.map((o) =>
        o.id === selId
          ? { ...o, verb: v, bloomLevel: bl as WizardObjective['bloomLevel'], ...(bk ? { bloomKnowledge: bk as WizardObjective['bloomKnowledge'] } : {}) }
          : o
      )
    );
  };

  const composedText = (o: WizardObjective) => {
    if (!o) return '';
    const parts: string[] = [];
    if (o.condition) parts.push(o.condition + ',');
    parts.push((o.audience || audiences[0] || '') + ' will');
    if (o.behavior) parts.push(o.behavior);
    if (o.criteria) parts.push(o.criteria);
    return parts.join(' ') || o.freeformText || '';
  };

  const addObj = () => {
    const n = newObjective();
    setObjs((p) => [...p, n]);
    setSelId(n.id);
  };

  const inputClass =
    'w-full px-2.5 py-1.5 text-[13px] text-gray-900 border border-gray-200 rounded outline-none leading-normal focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e]';

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[300px] border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="px-3 pt-2.5 pb-2 border-b border-gray-200 flex items-center justify-between">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Objectives ({objs.length})
          </label>
          <div className="flex border border-gray-200 rounded overflow-hidden">
            {[
              { k: 'guided' as const, l: 'Guided' },
              { k: 'freeform' as const, l: 'Freeform' },
            ].map((m) => (
              <button
                key={m.k}
                onClick={() => setViewMode(m.k)}
                className={`px-2 py-0.5 text-[10px] border-none cursor-pointer ${
                  viewMode === m.k
                    ? 'font-semibold bg-[#03428e] text-white'
                    : 'font-normal bg-white text-gray-500'
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3 py-2">
          {/* Parent Tasks */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Parent Tasks
              </label>
              <button
                onClick={() => openNA('system')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer hover:bg-[#dbe4f3]"
              >
                <span className="text-[13px]">📋</span> Needs Analysis Data
              </button>
            </div>
            {triageItems
              .filter((t) => t.column !== 'nice')
              .map((t) => {
                const linked = objs.some((o) => o.linkedTaskId === t.id);
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-1.5 px-2 py-1 mb-0.5 border rounded text-[11px] ${
                      linked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-bold text-white ${
                        linked ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      {linked ? '✓' : ''}
                    </span>
                    <span className="flex-1 leading-tight text-gray-900">{t.text}</span>
                  </div>
                );
              })}
            <div className="text-[10px] text-gray-500 mt-0.5 italic">
              {triageItems.filter(
                (t) => t.column !== 'nice' && !objs.some((o) => o.linkedTaskId === t.id)
              ).length}{' '}
              tasks without objectives
            </div>
          </div>

          <div className="border-t border-gray-200 my-1" />

          {/* Objective Cards */}
          {objs.map((o) => (
            <ObjCard
              key={o.id}
              obj={o}
              isSel={selId === o.id}
              onClick={() => setSelId(o.id)}
              triageItems={triageItems}
            />
          ))}
          <button
            onClick={addObj}
            className="w-full mt-1.5 py-1.5 text-[11px] font-medium text-[#03428e] bg-transparent border border-dashed border-[#03428e]/40 rounded-md cursor-pointer hover:bg-[#e8eef7]/50"
          >
            + Add Objective
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {sel ? (
          <div className="flex-1 overflow-auto">
            {viewMode === 'freeform' ? (
              /* ─── Freeform Mode ─── */
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-900">Freeform Objective</div>
                  <button
                    onClick={() => openNA('project')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer"
                  >
                    <span className="text-[13px]">📋</span> Needs Analysis Data
                  </button>
                </div>

                {/* Reference strip: show ABCD data when switching to freeform */}
                {(sel.behavior || sel.condition || sel.criteria) && !sel.freeformText && (
                  <div className="mb-3 px-3.5 py-2.5 bg-sky-50 border border-sky-200 rounded-md">
                    <div className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide mb-1">
                      📝 Reference — your structured ABCD data
                    </div>
                    <div className="text-xs text-gray-900 leading-normal">
                      {composedText(sel)}
                    </div>
                    <div className="text-[10px] text-gray-500 italic mt-1">
                      This data is preserved. Switch back to Guided view anytime.
                    </div>
                  </div>
                )}

                <textarea
                  rows={5}
                  value={sel.freeformText || composedText(sel)}
                  onChange={(e) => chg('freeformText', e.target.value)}
                  placeholder="Write your complete objective here."
                  className={`${inputClass} resize-y text-sm leading-relaxed min-h-[120px]`}
                />

                <div className="flex gap-3 mt-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Bloom&apos;s Level (optional)
                    </label>
                    <select
                      value={sel.bloomLevel || ''}
                      onChange={(e) => chg('bloomLevel', e.target.value)}
                      className={`${inputClass} text-xs`}
                    >
                      <option value="">— Select —</option>
                      {BLOOM.map((b) => (
                        <option key={b.level} value={b.level}>{b.level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Priority (optional)
                    </label>
                    <select
                      value={sel.priority || ''}
                      onChange={(e) => chg('priority', e.target.value)}
                      className={`${inputClass} text-xs`}
                    >
                      <option value="">— Select —</option>
                      {PRI.map((p) => (
                        <option key={p.label} value={p.label}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Assessment
                    </label>
                    <div className="flex gap-1">
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          onClick={() => chg('requiresAssessment', v)}
                          className={`flex-1 px-1.5 py-1.5 text-[11px] rounded border cursor-pointer ${
                            sel.requiresAssessment === v
                              ? v
                                ? 'font-semibold text-green-600 bg-green-50 border-green-200'
                                : 'font-semibold text-red-600 bg-red-50 border-red-200'
                              : 'font-normal text-gray-500 bg-transparent border-gray-200'
                          }`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Link to Parent Task
                  </label>
                  <select
                    value={sel.linkedTaskId || ''}
                    onChange={(e) => chg('linkedTaskId', e.target.value || null)}
                    className={`${inputClass} text-xs`}
                  >
                    <option value="">— None —</option>
                    {triageItems
                      .filter((t) => t.column !== 'nice')
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.text}</option>
                      ))}
                  </select>
                  <div className="text-[11px] text-gray-500 italic mt-1">
                    Links this objective to a parent task for traceability.
                  </div>
                </div>
              </div>
            ) : (
              /* ─── Guided Mode ─── */
              <div>
                <div className="px-5 pt-3">
                  <ContextStrip obj={sel} triageItems={triageItems} gapTypes={gapTypes} />
                </div>
                <div className="px-5 pt-2.5">
                  <ComposedBanner
                    obj={sel}
                    idx={selIdx}
                    defaultAudience={audiences[0] || ''}
                    showAI={showAI}
                    onToggleAI={() => setShowAI(!showAI)}
                  />
                </div>

                {/* Freeform reference strip */}
                {sel.freeformText && (
                  <div className="mx-5 mt-2.5 px-3.5 py-2.5 bg-sky-50 border border-sky-200 rounded-md">
                    <div className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide mb-1">
                      📝 Reference — your freeform text
                    </div>
                    <div className="text-xs text-gray-900 leading-normal">{sel.freeformText}</div>
                    <div className="text-[10px] text-gray-500 italic mt-1">
                      Use this to populate ABCD fields. Your freeform text is preserved.
                    </div>
                  </div>
                )}

                <div className="px-5 pt-4">
                  {/* A — Audience */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white inline-flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        A
                      </span>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Audience
                      </label>
                      <button
                        onClick={() => openNA('audience')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer"
                      >
                        Audience Data
                      </button>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          audMode === 'custom'
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-[#03428e] bg-[#e8eef7]'
                        }`}
                      >
                        {audMode === 'custom' ? 'Custom' : 'From NA'}
                      </span>
                    </div>
                    <select
                      value={audMode === 'custom' ? '__custom__' : sel.audience || audiences[0] || ''}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setAudMode('custom');
                          chg('audience', '');
                        } else {
                          setAudMode('picklist');
                          chg('audience', e.target.value);
                        }
                      }}
                      className={`${inputClass} text-xs`}
                    >
                      {audiences.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                      <option value="__custom__">Other — type custom</option>
                    </select>
                    {audMode === 'custom' && (
                      <input
                        type="text"
                        value={sel.audience}
                        onChange={(e) => chg('audience', e.target.value)}
                        placeholder="Describe audience…"
                        className={`${inputClass} mt-1.5`}
                      />
                    )}
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      Auto-populated from Needs Analysis.
                    </div>
                  </div>

                  {/* B — Behavior */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        B
                      </span>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Behavior
                      </label>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[
                        { k: 'bloom' as const, l: "Bloom's Revised", s: 'Standard 6-level' },
                        { k: 'anderson' as const, l: 'Anderson-Krathwohl 2D', s: 'Process × Knowledge' },
                      ].map((t) => (
                        <button
                          key={t.k}
                          onClick={() => setTheory(t.k)}
                          className={`flex-1 px-2.5 py-2 text-left rounded-md cursor-pointer border-2 ${
                            theory === t.k
                              ? 'border-[#03428e] bg-[#e8eef7]'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div
                            className={`text-xs font-semibold ${
                              theory === t.k ? 'text-[#03428e]' : 'text-gray-900'
                            }`}
                          >
                            {t.l}
                          </div>
                          <div className="text-[10px] text-gray-500">{t.s}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mb-2">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Action Verb
                      </label>
                      {theory === 'bloom' ? (
                        <BloomVerbPicker onSelect={verbSel} selectedVerb={sel.verb} />
                      ) : (
                        <AKPicker
                          onSelect={verbSel}
                          selectedVerb={sel.verb}
                          selectedProcess={sel.bloomLevel}
                          selectedKnowledge={sel.bloomKnowledge}
                        />
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={sel.behavior}
                      onChange={(e) => chg('behavior', e.target.value)}
                      className={`${inputClass} resize-y`}
                    />
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-gray-500">Bloom:</span>
                      <BloomBadge level={sel.bloomLevel} />
                      {theory === 'anderson' && sel.bloomKnowledge && (
                        <>
                          <span className="text-[11px] text-gray-500">×</span>
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                            {sel.bloomKnowledge}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      Start with an observable action verb.
                    </div>
                  </div>

                  {/* C — Condition */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white inline-flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        C
                      </span>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Condition
                      </label>
                      <button
                        onClick={() => openNA('system')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer"
                      >
                        System Info
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={sel.condition}
                      onChange={(e) => chg('condition', e.target.value)}
                      placeholder="Under what circumstances will the learner perform this?"
                      className={`${inputClass} resize-y`}
                    />
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      Describe situation, tools, or constraints.
                    </div>
                  </div>

                  {/* D — Degree/Criteria */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white inline-flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        D
                      </span>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Degree / Criteria
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={sel.criteria}
                      onChange={(e) => chg('criteria', e.target.value)}
                      placeholder="How well must they perform?"
                      className={`${inputClass} resize-y`}
                    />
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      Time limits, accuracy, benchmarks.
                    </div>
                  </div>

                  {/* Priority + Assessment */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Priority
                      </label>
                      <div className="flex gap-1">
                        {PRI.map((p) => (
                          <button
                            key={p.label}
                            onClick={() => chg('priority', p.label)}
                            className={`flex-1 px-1.5 py-1 text-[11px] rounded border cursor-pointer whitespace-nowrap ${
                              sel.priority === p.label
                                ? 'font-semibold'
                                : 'font-normal text-gray-500 bg-transparent border-gray-200'
                            }`}
                            style={
                              sel.priority === p.label
                                ? {
                                    color: p.color,
                                    backgroundColor: p.bg,
                                    borderColor: p.color + '44',
                                  }
                                : undefined
                            }
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Requires Assessment
                      </label>
                      <div className="flex gap-1">
                        {[true, false].map((v) => (
                          <button
                            key={String(v)}
                            onClick={() => chg('requiresAssessment', v)}
                            className={`flex-1 px-2 py-1 text-[11px] rounded border cursor-pointer ${
                              sel.requiresAssessment === v
                                ? v
                                  ? 'font-semibold text-green-600 bg-green-50 border-green-200'
                                  : 'font-semibold text-red-600 bg-red-50 border-red-200'
                                : 'font-normal text-gray-500 bg-transparent border-gray-200'
                            }`}
                          >
                            {v ? 'Yes' : 'No'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Link to Parent Task */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Link to Parent Task
                    </label>
                    <select
                      value={sel.linkedTaskId || ''}
                      onChange={(e) => chg('linkedTaskId', e.target.value || null)}
                      className={`${inputClass} text-xs`}
                    >
                      <option value="">— None —</option>
                      {triageItems
                        .filter((t) => t.column !== 'nice')
                        .map((t) => (
                          <option key={t.id} value={t.id}>{t.text}</option>
                        ))}
                    </select>
                  </div>

                  {/* WIIFM */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        WIIFM
                      </label>
                      <span className="text-[10px] text-gray-500 italic">
                        (why this matters to the learner)
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={sel.wiifm || ''}
                      onChange={(e) => chg('wiifm', e.target.value)}
                      placeholder="Why should the learner care?"
                      className={`${inputClass} resize-y`}
                    />
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      Carries to storyboard and learner-facing materials.
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Rationale (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={sel.rationale}
                      onChange={(e) => chg('rationale', e.target.value)}
                      placeholder="Business justification…"
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select an objective or add one to begin
          </div>
        )}
      </div>
    </div>
  );
}
