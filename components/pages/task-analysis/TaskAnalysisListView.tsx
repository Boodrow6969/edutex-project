'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TaskAnalysisSummary {
  id: string;
  taskName: string;
  analysisType: 'PROCEDURAL' | 'HIERARCHICAL' | 'COGNITIVE';
  criticalityScore: number | null;
  frequencyScore: number | null;
  difficultyScore: number | null;
  universalityScore: number | null;
  feasibilityScore: number | null;
  steps: { id: string }[];
  objective: { id: string; title: string; bloomLevel: string } | null;
  updatedAt: string;
}

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  PROCEDURAL: 'Procedural',
  HIERARCHICAL: 'Hierarchical (HTA)',
  COGNITIVE: 'Cognitive (CTA)',
};

const ANALYSIS_TYPE_COLORS: Record<string, string> = {
  PROCEDURAL: 'bg-blue-100 text-blue-700',
  HIERARCHICAL: 'bg-purple-100 text-purple-700',
  COGNITIVE: 'bg-orange-100 text-orange-700',
};

function compositeScore(ta: TaskAnalysisSummary): number | null {
  const scores = [
    ta.criticalityScore,
    ta.frequencyScore,
    ta.difficultyScore,
    ta.universalityScore,
    ta.feasibilityScore,
  ];
  if (scores.every((s) => s === null)) return null;
  return scores.reduce((sum, s) => (sum ?? 0) + (s ?? 0), 0);
}

function priorityBadge(score: number | null) {
  if (score === null) return { label: 'Not Scored', color: 'bg-gray-100 text-gray-500' };
  if (score <= 8) return { label: 'Low Priority', color: 'bg-gray-100 text-gray-600' };
  if (score <= 11) return { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'High Priority', color: 'bg-green-100 text-green-700' };
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface TaskAnalysisListViewProps {
  courseId: string;
  workspaceId: string;
}

export default function TaskAnalysisListView({ courseId, workspaceId }: TaskAnalysisListViewProps) {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<TaskAnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/task-analyses`);
      if (!res.ok) throw new Error('Failed to fetch task analyses');
      const data = await res.json();
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/task-analyses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName: 'New Task Analysis', analysisType: 'PROCEDURAL' }),
      });
      if (!res.ok) throw new Error('Failed to create task analysis');
      const created = await res.json();
      router.push(`/workspace/${workspaceId}/course/${courseId}/task-analysis/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this task analysis? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/task-analyses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete task analysis');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading task analyses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Task Analysis</h1>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#03428e] rounded-md hover:bg-[#022d61] transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task Analysis
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Break down tasks into teachable steps. Define the sequence, decision points, and instructional events for each task.
          </p>
          {/* Summary stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-gray-600">
              <strong>{analyses.length}</strong> analysis{analyses.length !== 1 ? 'es' : ''}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">
              <strong>{analyses.reduce((sum, a) => sum + a.steps.length, 0)}</strong> total steps
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="p-6 max-w-5xl mx-auto space-y-3">
        {analyses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No task analyses yet.</p>
            <p className="text-sm text-gray-400">Create one to break down how a task should be taught.</p>
          </div>
        ) : (
          analyses.map((ta) => {
            const score = compositeScore(ta);
            const priority = priorityBadge(score);

            return (
              <div
                key={ta.id}
                onClick={() => router.push(`/workspace/${workspaceId}/course/${courseId}/task-analysis/${ta.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{ta.taskName || 'Untitled'}</h3>
                    {ta.objective && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        Linked: {ta.objective.title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, ta.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${ANALYSIS_TYPE_COLORS[ta.analysisType]}`}>
                    {ANALYSIS_TYPE_LABELS[ta.analysisType]}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${priority.color}`}>
                    {score !== null ? `${score}/15 — ${priority.label}` : priority.label}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                    {ta.steps.length} step{ta.steps.length !== 1 ? 's' : ''}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    Updated {formatDate(ta.updatedAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
