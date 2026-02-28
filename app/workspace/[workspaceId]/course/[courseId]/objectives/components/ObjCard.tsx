'use client';

import { BLOOM, PRI } from '../constants';
import type { WizardObjective, TriageItemData } from '../types';

interface ObjCardProps {
  obj: WizardObjective;
  isSel: boolean;
  onClick: () => void;
  triageItems: TriageItemData[];
}

function BloomBadge({ level }: { level: string }) {
  const b = BLOOM.find((x) => x.level === level);
  if (!b) return null;
  return (
    <span
      className="inline-block text-[11px] font-semibold rounded px-2 py-0.5"
      style={{ color: b.color, backgroundColor: b.bg, border: `1px solid ${b.border}` }}
    >
      {b.level}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = PRI.find((x) => x.label === priority);
  if (!p) return null;
  return (
    <span
      className="inline-block text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5"
      style={{ color: p.color, backgroundColor: p.bg, border: `1px solid ${p.color}22` }}
    >
      {p.label}
    </span>
  );
}

export { BloomBadge, PriorityBadge };

export default function ObjCard({ obj, isSel, onClick, triageItems }: ObjCardProps) {
  const linkedTask = obj.linkedTaskId
    ? triageItems.find((t) => t.id === obj.linkedTaskId)
    : null;

  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded-md cursor-pointer mb-1 border ${
        isSel
          ? 'bg-[#e8eef7] border-[#03428e]'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
        {obj.priority && <PriorityBadge priority={obj.priority} />}
        {obj.bloomLevel && <BloomBadge level={obj.bloomLevel} />}
        {obj.requiresAssessment && (
          <span className="text-[10px] text-cyan-600 font-medium">📋</span>
        )}
      </div>
      <div className={`text-xs leading-snug ${isSel ? 'font-semibold' : 'font-normal'} text-gray-900`}>
        {obj.behavior || obj.freeformText || 'New objective...'}
      </div>
      {linkedTask && (
        <div className="text-[10px] text-gray-500 mt-0.5">
          ↳ {linkedTask.text}
        </div>
      )}
    </div>
  );
}
