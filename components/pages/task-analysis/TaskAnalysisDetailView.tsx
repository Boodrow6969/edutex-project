'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TaskAnalysisData, ProceduralStepData } from '@/lib/types/proceduralTaskAnalysis';
import TaskIdentitySection from './TaskIdentitySection';
import ModeSelector from './ModeSelector';
import LearnerContextSection from './LearnerContextSection';
import ProceduralStepBuilder from './ProceduralStepBuilder';
import PriorityScoringPanel from './PriorityScoringPanel';

interface TaskAnalysisDetailViewProps {
  courseId: string;
  workspaceId: string;
  taskAnalysisId: string;
}

export default function TaskAnalysisDetailView({
  courseId,
  workspaceId,
  taskAnalysisId,
}: TaskAnalysisDetailViewProps) {
  const [data, setData] = useState<TaskAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const pendingRef = useRef<Record<string, unknown>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch task analysis on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/courses/${courseId}/task-analyses/${taskAnalysisId}`);
        if (!res.ok) throw new Error('Failed to load task analysis');
        const json = await res.json();
        if (!cancelled) {
          json.dataSource = json.dataSource || {};
          setData(json);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
          setIsLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId, taskAnalysisId]);

  // Flush pending save
  const flushSave = useCallback(async () => {
    const pending = pendingRef.current;
    if (Object.keys(pending).length === 0) return;
    pendingRef.current = {};

    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/task-analyses/${taskAnalysisId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setData(updated);
      setLastSaved(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [courseId, taskAnalysisId]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
      // Fire synchronous best-effort save
      const pending = pendingRef.current;
      if (Object.keys(pending).length > 0) {
        navigator.sendBeacon?.(
          `/api/courses/${courseId}/task-analyses/${taskAnalysisId}`,
          new Blob([JSON.stringify(pending)], { type: 'application/json' })
        );
      }
    };
  }, [courseId, taskAnalysisId]);

  const handleFieldChange = useCallback(
    (updates: Record<string, unknown>) => {
      // Update local state immediately
      setData((prev) => (prev ? { ...prev, ...updates } as TaskAnalysisData : prev));

      // Accumulate pending changes
      pendingRef.current = { ...pendingRef.current, ...updates };

      // Debounced save (1500ms)
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => flushSave(), 1500);
    },
    [flushSave]
  );

  const handleStepsChange = useCallback(
    (steps: ProceduralStepData[]) => {
      setData((prev) => (prev ? { ...prev, steps } : prev));

      // Steps always go as full array
      pendingRef.current = { ...pendingRef.current, steps };

      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => flushSave(), 1500);
    },
    [flushSave]
  );

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading task analysis...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {data.taskName || 'Untitled Task Analysis'}
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0">
              {isSaving && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              )}
              {!isSaving && lastSaved && (
                <span className="text-xs text-gray-400">Saved {lastSaved}</span>
              )}
              {error && (
                <span className="text-xs text-red-500">{error}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Edit task details, define procedural steps, and score priority.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <TaskIdentitySection
          taskName={data.taskName}
          taskGoal={data.taskGoal}
          objectiveId={data.objectiveId}
          objective={data.objective}
          sourceTaskId={data.sourceTaskId}
          dataSource={data.dataSource}
          courseId={courseId}
          onChange={handleFieldChange}
        />

        <ModeSelector
          analysisType={data.analysisType}
          onChange={handleFieldChange}
        />

        <LearnerContextSection
          audienceRole={data.audienceRole}
          audiencePriorKnowledge={data.audiencePriorKnowledge}
          audienceTechComfort={data.audienceTechComfort}
          constraints={data.constraints}
          contextNotes={data.contextNotes}
          dataSource={data.dataSource}
          courseId={courseId}
          onChange={handleFieldChange}
        />

        {data.analysisType === 'PROCEDURAL' && (
          <ProceduralStepBuilder
            steps={data.steps}
            onChange={handleStepsChange}
          />
        )}

        <PriorityScoringPanel
          criticalityScore={data.criticalityScore}
          frequencyScore={data.frequencyScore}
          difficultyScore={data.difficultyScore}
          universalityScore={data.universalityScore}
          feasibilityScore={data.feasibilityScore}
          onChange={handleFieldChange}
        />
      </div>
    </div>
  );
}
