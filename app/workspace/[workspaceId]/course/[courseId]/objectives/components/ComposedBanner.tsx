'use client';

import type { WizardObjective } from '../types';

interface ComposedBannerProps {
  obj: WizardObjective;
  idx: number;
  defaultAudience: string;
  showAI: boolean;
  onToggleAI: () => void;
}

function AIReview({ obj, onClose }: { obj: WizardObjective; onClose: () => void }) {
  const nonObservable = ['understand', 'know', 'learn', 'appreciate'];
  const verbOk =
    obj.verb && !nonObservable.some((v) => obj.verb.toLowerCase().includes(v));
  const highBloom = ['Apply', 'Analyze', 'Evaluate', 'Create'].includes(obj.bloomLevel);

  const items: { t: 'success' | 'warning' | 'suggestion'; x: string }[] = [];

  if (verbOk)
    items.push({ t: 'success', x: `Observable action verb '${obj.verb}' — good. This is measurable.` });
  else if (obj.verb)
    items.push({
      t: 'warning',
      x: `'${obj.verb}' may not be directly observable. Consider demonstrate, execute, or perform (Mager, 1997).`,
    });
  else items.push({ t: 'warning', x: 'No verb selected yet.' });

  if (obj.condition)
    items.push({
      t: 'warning',
      x: 'Condition is well-stated but consider adding what resources are NOT available — can they use a job aid? (Dirksen, 2016)',
    });
  else items.push({ t: 'warning', x: 'No condition specified.' });

  if (obj.criteria)
    items.push({
      t: 'suggestion',
      x: 'Criterion is specific and measurable. Consider whether realistic for new vs. tenured agents.',
    });
  else items.push({ t: 'warning', x: 'No criteria specified.' });

  if (highBloom && !obj.requiresAssessment)
    items.push({
      t: 'warning',
      x: `${obj.bloomLevel}-level needs performance-based assessment (Merrill, 2013).`,
    });

  if (!obj.linkedTaskId)
    items.push({
      t: 'suggestion',
      x: 'Not linked to a parent task. Connecting strengthens traceability (Dick, Carey & Carey, 2015).',
    });

  const icons = { success: '✓', warning: '⚠', suggestion: '💡' };
  const colors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    suggestion: 'bg-[#e8eef7] border-[#03428e]/20',
  };

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-[#03428e] uppercase tracking-wide">
          🎓 AI Review
        </div>
        <button onClick={onClose} className="border-none bg-none cursor-pointer text-sm text-gray-500 p-0.5">
          ✕
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className={`flex gap-2 px-2.5 py-2 ${colors[it.t]} border rounded-md text-xs text-gray-900 leading-normal`}
          >
            <span className="flex-shrink-0 text-sm">{icons[it.t]}</span>
            <span>{it.x}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-gray-500 italic">
        AI reviews against ABCD completeness, verb observability, and stakeholder alignment.
      </div>
    </div>
  );
}

export default function ComposedBanner({
  obj,
  idx,
  defaultAudience,
  showAI,
  onToggleAI,
}: ComposedBannerProps) {
  const audience = obj.audience || defaultAudience || '…';
  const ok = obj.condition && obj.behavior && obj.criteria;
  const missing = [
    !obj.condition && 'Condition',
    !obj.behavior && 'Behavior',
    !obj.criteria && 'Criteria',
  ].filter(Boolean);

  return (
    <div
      className={`px-5 py-4 rounded-lg border ${
        ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-base font-bold ${ok ? 'text-green-600' : 'text-amber-600'}`}>
            {ok ? '✓' : '⟳'} Composed Objective {idx + 1}
          </span>
          {!ok && (
            <span className="text-[11px] text-amber-600">
              — {missing.join(', ')} needed
            </span>
          )}
        </div>
        <button
          onClick={onToggleAI}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded border cursor-pointer ${
            showAI
              ? 'text-white bg-purple-600 border-purple-600/30'
              : 'text-purple-600 bg-transparent border-purple-600/30 hover:bg-purple-50'
          }`}
        >
          🎓 AI Review
        </button>
      </div>

      <div className="text-sm text-gray-900 leading-relaxed">
        {obj.condition ? (
          <span className="font-medium">{obj.condition}, </span>
        ) : (
          <span className="text-gray-500 italic">[Condition], </span>
        )}
        <span className="text-[#03428e] italic">{audience}</span>
        <span> will </span>
        {obj.behavior ? (
          <span className="font-bold">{obj.behavior}</span>
        ) : (
          <span className="text-gray-500 italic">[behavior]</span>
        )}
        {obj.criteria ? (
          <span className="text-gray-500"> {obj.criteria}</span>
        ) : (
          <span className="text-gray-500 italic"> [criteria]</span>
        )}
        <span>.</span>
      </div>

      {showAI && <AIReview obj={obj} onClose={onToggleAI} />}
    </div>
  );
}
