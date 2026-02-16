'use client';

import { useState, useEffect, useRef } from 'react';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';

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

export default function NeedsAnalysisPanel({ courseId, workspaceId }: NeedsAnalysisPanelProps) {
  const [data, setData] = useState<NeedsAnalysisFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        // Step 1: Find the NEEDS_ANALYSIS page for this course
        const pagesRes = await fetch(`/api/courses/${courseId}/pages`);
        if (!pagesRes.ok) throw new Error('Failed to fetch course pages');

        const pages: Array<{ id: string; type: string }> = await pagesRes.json();
        const naPage = pages.find((p) => p.type === 'NEEDS_ANALYSIS');

        if (!naPage) {
          setError('no-needs-analysis');
          return;
        }

        // Step 2: Fetch the needs analysis data
        const naRes = await fetch(`/api/pages/${naPage.id}/needs-analysis`);
        if (!naRes.ok) throw new Error('Failed to fetch needs analysis');

        const naData: NeedsAnalysisFormData = await naRes.json();
        setData(naData);
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

  if (error === 'no-needs-analysis') {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 mb-3">
          No approved needs analysis found. Complete the Needs Analysis page first.
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

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error || 'Failed to load needs analysis'}</p>
      </div>
    );
  }

  const hasContent = data.problemStatement || data.businessNeed || data.currentState || data.desiredState;

  if (!hasContent) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          The Needs Analysis page exists but has no content yet. Fill it out to see reference data here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Problem / Business Need */}
      {(data.problemStatement || data.businessNeed) && (
        <Section title="Problem & Business Need">
          {data.problemStatement && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">Problem: </span>
              <TextBlock value={data.problemStatement} />
            </div>
          )}
          {data.businessNeed && (
            <div>
              <span className="text-xs font-medium text-gray-600">Business Need: </span>
              <TextBlock value={data.businessNeed} />
            </div>
          )}
        </Section>
      )}

      {/* Performance Gap */}
      {(data.currentState || data.desiredState) && (
        <Section title="Performance Gap">
          {data.currentState && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">Current State: </span>
              <TextBlock value={data.currentState} />
            </div>
          )}
          {data.desiredState && (
            <div>
              <span className="text-xs font-medium text-gray-600">Desired State: </span>
              <TextBlock value={data.desiredState} />
            </div>
          )}
        </Section>
      )}

      {/* Target Audience */}
      {(data.learnerPersonas.length > 0 || data.stakeholders.length > 0) && (
        <Section title="Target Audience">
          {data.learnerPersonas.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">Learner Personas:</span>
              <ListBlock items={data.learnerPersonas} />
            </div>
          )}
          {data.stakeholders.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600">Stakeholders:</span>
              <ListBlock items={data.stakeholders} />
            </div>
          )}
        </Section>
      )}

      {/* Constraints */}
      {data.constraints.length > 0 && (
        <Section title="Constraints">
          <ListBlock items={data.constraints} />
        </Section>
      )}

      {/* Success Metrics */}
      {(data.level1Reaction || data.level2Learning || data.level3Behavior || data.level4Results) && (
        <Section title="Success Metrics (Kirkpatrick)">
          {data.level1Reaction && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L1 Reaction: </span>
              <TextBlock value={data.level1Reaction} />
            </div>
          )}
          {data.level2Learning && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L2 Learning: </span>
              <TextBlock value={data.level2Learning} />
            </div>
          )}
          {data.level3Behavior && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">L3 Behavior: </span>
              <TextBlock value={data.level3Behavior} />
            </div>
          )}
          {data.level4Results && (
            <div>
              <span className="text-xs font-medium text-gray-600">L4 Results: </span>
              <TextBlock value={data.level4Results} />
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
