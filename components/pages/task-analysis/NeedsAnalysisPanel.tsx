'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalysisContext } from '@/lib/types/courseAnalysis';

interface NeedsAnalysisPanelProps {
  courseId: string;
  workspaceId?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function TextBlock({ value }: { value: string }) {
  if (!value) return <p className="text-sm text-gray-400 italic">Not documented</p>;
  return <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>;
}

function ListBlock({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-400 italic">None</p>;
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700">{item}</li>
      ))}
    </ul>
  );
}

const INTERVENTION_COLORS: Record<string, string> = {
  training: 'bg-blue-100 text-blue-700',
  'job-aid': 'bg-amber-100 text-amber-700',
  awareness: 'bg-purple-100 text-purple-700',
  'not-training': 'bg-red-100 text-red-700',
  existing: 'bg-gray-100 text-gray-700',
};

export default function NeedsAnalysisPanel({ courseId, workspaceId }: NeedsAnalysisPanelProps) {
  const [context, setContext] = useState<AnalysisContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/analysis-context`);
        if (!response.ok) throw new Error('Failed to fetch analysis context');

        const data: AnalysisContext = await response.json();
        setContext(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded mb-1" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error || 'Failed to load analysis context'}</p>
      </div>
    );
  }

  const ca = context.courseAnalysis;
  const hasAudiences = ca.audiences && ca.audiences.length > 0;
  const hasTasks = ca.tasks && ca.tasks.length > 0;
  const hasIdContent = ca.problemSummary || ca.currentStateSummary || ca.desiredStateSummary || hasAudiences || hasTasks;
  const hasStakeholderData = context.submissions.length > 0;

  if (!hasIdContent && !hasStakeholderData) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 mb-3">
          No analysis data found. Complete the Needs Analysis page first.
        </p>
        {workspaceId && (
          <a
            href={`/workspace/${workspaceId}`}
            className="text-sm text-[#03428e] hover:underline"
          >
            Go to workspace
          </a>
        )}
      </div>
    );
  }

  const trainingTasks = ca.tasks?.filter((t) => t.intervention === 'training') ?? [];

  return (
    <div className="space-y-1">
      {/* Audience Profiles (v2) */}
      {hasAudiences && (
        <Section title={`Audiences (${ca.audiences.length})`}>
          <div className="space-y-2">
            {ca.audiences.map((aud) => (
              <div key={aud.id || aud.order} className="text-sm">
                <span className="font-medium text-gray-700">{aud.role}</span>
                {aud.headcount && <span className="text-gray-400 ml-1">({aud.headcount})</span>}
                {aud.trainingFormat && (
                  <span className="text-xs text-gray-500 ml-2">{aud.trainingFormat}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tasks & Competencies (v2) */}
      {hasTasks && (
        <Section title={`Tasks (${ca.tasks.length} total, ${trainingTasks.length} training)`}>
          <div className="space-y-1.5">
            {ca.tasks.map((task) => (
              <div key={task.id || task.order} className="flex items-start gap-2 text-sm">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${
                    INTERVENTION_COLORS[task.intervention] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.intervention}
                </span>
                <span className="text-gray-700">{task.task}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Legacy ID Synthesis (backward compat) */}
      {ca.problemSummary && (
        <Section title="Problem Summary">
          <TextBlock value={ca.problemSummary} />
        </Section>
      )}

      {/* Constraints */}
      {ca.constraints.length > 0 && (
        <Section title="Constraints">
          <ListBlock items={ca.constraints} />
        </Section>
      )}

      {/* Training Decision */}
      {ca.isTrainingSolution !== null && (
        <Section title="Training Decision">
          <p className="text-sm text-gray-700">
            {ca.isTrainingSolution === true
              ? 'Yes — training is the primary solution'
              : ca.isTrainingSolution === false
                ? 'No — training alone won\'t solve this'
                : 'Partially — training is part of a blended solution'}
          </p>
          {ca.solutionRationale && (
            <div className="mt-1">
              <span className="text-xs font-medium text-gray-600">Rationale: </span>
              <TextBlock value={ca.solutionRationale} />
            </div>
          )}
        </Section>
      )}

      {/* Success Metrics */}
      {(ca.level1Reaction || ca.level2Learning || ca.level3Behavior || ca.level4Results) && (
        <Section title="Success Metrics (Kirkpatrick)">
          {ca.level1Reaction && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L1 Reaction: </span>
              <TextBlock value={ca.level1Reaction} />
            </div>
          )}
          {ca.level2Learning && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L2 Learning: </span>
              <TextBlock value={ca.level2Learning} />
            </div>
          )}
          {ca.level3Behavior && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L3 Behavior: </span>
              <TextBlock value={ca.level3Behavior} />
            </div>
          )}
          {ca.level4Results && (
            <div>
              <span className="text-xs font-medium text-gray-600">L4 Results: </span>
              <TextBlock value={ca.level4Results} />
            </div>
          )}
        </Section>
      )}

      {/* Stakeholder Submissions Summary */}
      {hasStakeholderData && (
        <Section title={`Stakeholder Data (${context.submissions.length} submission${context.submissions.length !== 1 ? 's' : ''})`}>
          {context.submissions.map((sub) => (
            <div key={sub.id} className="mb-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">{sub.stakeholderName}</span>
              <span className="text-gray-400 ml-1">({sub.trainingType.replace(/_/g, ' ')})</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
