'use client';

import { useState, useEffect } from 'react';

interface ReferencePanelProps {
  courseId: string;
}

interface AudienceData {
  id: string;
  role: string;
  headcount: number | null;
  techComfort: string | null;
  notes: string | null;
}

interface TaskData {
  id: string;
  task: string;
  complexity: string | null;
  intervention: string | null;
  priority: string | null;
}

interface ObjectiveData {
  id: string;
  title: string;
  bloomLevel: string;
}

interface ReferenceData {
  problemSummary: string;
  currentStateSummary: string;
  desiredStateSummary: string;
  audiences: AudienceData[];
  tasks: TaskData[];
  constraints: string[];
  assumptions: string[];
}

function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {title}
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export default function ReferencePanel({ courseId }: ReferencePanelProps) {
  const [data, setData] = useState<ReferenceData | null>(null);
  const [objectives, setObjectives] = useState<ObjectiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ctxRes, objRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/analysis-context`),
          fetch(`/api/courses/${courseId}/objectives`),
        ]);

        if (!cancelled && ctxRes.ok) {
          const ctx = await ctxRes.json();
          const ca = ctx.courseAnalysis;
          if (ca) {
            const ref: ReferenceData = {
              problemSummary: ca.problemSummary || '',
              currentStateSummary: ca.currentStateSummary || '',
              desiredStateSummary: ca.desiredStateSummary || '',
              audiences: ca.audiences || [],
              tasks: ca.tasks || [],
              constraints: ca.constraints || [],
              assumptions: ca.assumptions || [],
            };
            const hasAny =
              ref.problemSummary ||
              ref.currentStateSummary ||
              ref.desiredStateSummary ||
              ref.audiences.length > 0 ||
              ref.tasks.length > 0 ||
              ref.constraints.length > 0 ||
              ref.assumptions.length > 0;
            setData(ref);
            setHasData(!!hasAny);
          }
        }

        if (!cancelled && objRes.ok) {
          const objs = await objRes.json();
          setObjectives(objs);
          if (objs.length > 0) setHasData(true);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">
          No Needs Analysis data available for this course. Complete the Analysis tab to see reference data here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 bg-gray-50 rounded-lg p-3">
      {/* Problem Summary */}
      {data?.problemSummary && (
        <CollapsibleSection title="Problem Summary">
          <p className="text-sm text-gray-600">{data.problemSummary}</p>
        </CollapsibleSection>
      )}

      {/* Current vs Desired State */}
      {(data?.currentStateSummary || data?.desiredStateSummary) && (
        <CollapsibleSection title="Current vs Desired State">
          {data.currentStateSummary && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current</span>
              <p className="text-sm text-gray-600 mt-0.5">{data.currentStateSummary}</p>
            </div>
          )}
          {data.desiredStateSummary && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Desired</span>
              <p className="text-sm text-gray-600 mt-0.5">{data.desiredStateSummary}</p>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Audience Profiles */}
      {data && data.audiences.length > 0 && (
        <CollapsibleSection title="Audience Profiles">
          <div className="space-y-2">
            {data.audiences.map((a) => (
              <div key={a.id} className="bg-white rounded p-2 border border-gray-200">
                <p className="text-sm font-medium text-gray-800">{a.role}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  {a.headcount && <span>Headcount: {a.headcount}</span>}
                  {a.techComfort && <span>Tech: {a.techComfort}</span>}
                </div>
                {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Task Inventory */}
      {data && data.tasks.length > 0 && (
        <CollapsibleSection title="Task Inventory">
          <div className="space-y-1.5">
            {data.tasks.map((t) => (
              <div key={t.id} className="bg-white rounded p-2 border border-gray-200">
                <p className="text-sm text-gray-800">{t.task}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {t.complexity && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">
                      {t.complexity}
                    </span>
                  )}
                  {t.intervention && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-600">
                      {t.intervention}
                    </span>
                  )}
                  {t.priority && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-50 text-green-600">
                      {t.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Constraints & Assumptions */}
      {data && (data.constraints.length > 0 || data.assumptions.length > 0) && (
        <CollapsibleSection title="Constraints & Assumptions">
          {data.constraints.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Constraints</span>
              <ul className="mt-1 space-y-0.5">
                {data.constraints.map((c, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">-</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.assumptions.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assumptions</span>
              <ul className="mt-1 space-y-0.5">
                {data.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">-</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Objectives */}
      {objectives.length > 0 && (
        <CollapsibleSection title="Objectives">
          <div className="space-y-1.5">
            {objectives.map((obj) => (
              <div key={obj.id} className="bg-white rounded p-2 border border-gray-200 flex items-start gap-2">
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-700 border border-blue-300 mt-0.5">
                  {obj.bloomLevel}
                </span>
                <p className="text-sm text-gray-800">{obj.title}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
