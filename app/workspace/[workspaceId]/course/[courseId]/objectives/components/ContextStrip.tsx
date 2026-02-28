'use client';

import type { WizardObjective, TriageItemData } from '../types';

interface ContextStripProps {
  obj: WizardObjective;
  triageItems: TriageItemData[];
  gapTypes: { knowledge: boolean; skill: boolean };
}

export default function ContextStrip({ obj, triageItems, gapTypes }: ContextStripProps) {
  const parentTask = obj.linkedTaskId
    ? triageItems.find((t) => t.id === obj.linkedTaskId)
    : null;

  const gapLabel = [
    gapTypes.knowledge && 'Knowledge',
    gapTypes.skill && 'Skill',
  ]
    .filter(Boolean)
    .join(' + ') || 'Not classified';

  return (
    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-4 text-xs flex-wrap">
      <div>
        <span className="text-gray-500 font-semibold">Parent Task: </span>
        <span className="text-gray-900">
          {parentTask ? (
            parentTask.text
          ) : (
            <span className="italic text-gray-500">Not linked</span>
          )}
        </span>
      </div>
      <div className="w-px h-4 bg-gray-200" />
      <div>
        <span className="text-gray-500 font-semibold">Gap: </span>
        <span className="text-gray-900">{gapLabel}</span>
      </div>
    </div>
  );
}
