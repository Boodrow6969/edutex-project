'use client';

import { BLOOM } from '../constants';
import { BloomBadge, PriorityBadge } from './ObjCard';
import type { WizardObjective, TriageItemData } from '../types';

interface Screen6Props {
  objs: WizardObjective[];
  triageItems: TriageItemData[];
  audiences: string[];
  onCreateObjective: () => void;
}

export default function Screen6Export({
  objs,
  triageItems,
  audiences,
  onCreateObjective,
}: Screen6Props) {
  const activeTasks = triageItems.filter((t) => t.column !== 'nice');
  const orphanTasks = activeTasks.filter(
    (t) => !objs.some((o) => o.linkedTaskId === t.id)
  );

  // Group objectives by parent task
  const grouped: Record<string, WizardObjective[]> = {};
  objs.forEach((o) => {
    const taskName = o.linkedTaskId
      ? triageItems.find((t) => t.id === o.linkedTaskId)?.text || 'Unknown Task'
      : 'Ungrouped';
    if (!grouped[taskName]) grouped[taskName] = [];
    grouped[taskName].push(o);
  });

  const actions = [
    {
      icon: '📝',
      label: 'Push to Storyboard',
      desc: 'Each objective seeds a module block in the storyboard editor',
    },
    {
      icon: '📋',
      label: 'Push to Assessment Builder',
      desc: `${objs.filter((o) => o.requiresAssessment).length} assessed objectives create assessment stubs`,
    },
    {
      icon: '📄',
      label: 'Export Objectives Table',
      desc: 'Download as .docx or .pdf for stakeholder review',
    },
    {
      icon: '📎',
      label: 'Copy to Design Strategy',
      desc: 'Insert into HLDD objectives section',
    },
  ];

  const composeText = (o: WizardObjective) => {
    if (o.freeformText) return o.freeformText;
    const parts: string[] = [];
    if (o.condition) parts.push(o.condition + ', ');
    parts.push((o.audience || audiences[0] || '') + ' will ');
    parts.push(o.behavior || '[behavior]');
    if (o.criteria) parts.push(', ' + o.criteria);
    return parts.join('');
  };

  return (
    <div className="p-5 max-w-[820px] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Export & Downstream Handoff</h2>
      <p className="text-[13px] text-gray-500 mb-4">
        Export always works regardless of completeness. Missing fields are blank, not blocked.
      </p>

      {/* Push action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50"
          >
            <span className="text-lg flex-shrink-0">{a.icon}</span>
            <div>
              <div className="text-[13px] font-semibold text-gray-900">{a.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{a.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Orphan task warning */}
      {orphanTasks.length > 0 && (
        <div className="mb-4 px-4.5 py-3.5 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">⚠️</span>
            <span className="text-[13px] font-bold text-amber-600">
              {orphanTasks.length} parent task{orphanTasks.length !== 1 ? 's' : ''} from Needs
              Analysis have no matching objectives:
            </span>
          </div>
          {orphanTasks.map((t) => (
            <div key={t.id} className="text-xs text-amber-800 py-px pl-6.5">
              &bull; {t.text}
            </div>
          ))}
          <div className="mt-2.5 pl-6.5">
            <button
              onClick={onCreateObjective}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#03428e] border-none rounded cursor-pointer hover:bg-[#022d61]"
            >
              Create Objectives
            </button>
          </div>
        </div>
      )}

      {/* All Objectives grouped list */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-sm font-bold text-gray-900 mb-3.5">
          All Objectives ({objs.length})
        </div>
        {Object.entries(grouped).map(([taskName, items]) => (
          <div key={taskName} className="mb-4">
            <div className="text-xs font-bold text-[#03428e] uppercase tracking-wide mb-1.5 pb-1 border-b border-gray-200">
              Parent Task: {taskName}
            </div>
            {items.map((o) => {
              const txt = composeText(o);
              return (
                <div key={o.id} className="py-2 border-b border-gray-200/15">
                  <div className="text-[13px] text-gray-900 leading-normal">{txt}</div>
                  <div className="flex gap-1.5 mt-1">
                    {o.bloomLevel && <BloomBadge level={o.bloomLevel} />}
                    {o.priority && <PriorityBadge priority={o.priority} />}
                    {o.requiresAssessment && (
                      <span className="text-[10px] text-cyan-600 font-medium">📋 Assess</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
