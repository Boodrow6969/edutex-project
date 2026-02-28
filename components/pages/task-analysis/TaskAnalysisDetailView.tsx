'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TaskAnalysisData, ProceduralStepData } from '@/lib/types/proceduralTaskAnalysis';
import TaskAnalysisHeader from './TaskAnalysisHeader';
import TaskInfoBanner from './TaskInfoBanner';
import LearnerContextSection from './LearnerContextSection';
import ProceduralStepBuilder from './ProceduralStepBuilder';
import PriorityScoringPanel, { getComposite, priorityBadge } from './PriorityScoringPanel';
import ReferencePanel from './ReferencePanel';

interface TaskAnalysisDetailViewProps {
  courseId: string;
  workspaceId: string;
  taskAnalysisId: string;
}

type RightTab = 'learner' | 'priority' | 'reference';

const TABS: { key: RightTab; label: string }[] = [
  { key: 'learner', label: 'Learner' },
  { key: 'priority', label: 'Priority' },
  { key: 'reference', label: 'Reference' },
];

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

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<RightTab>('learner');

  const pendingRef = useRef<Record<string, unknown>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Responsive: collapse panel by default on < 1024px
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsPanelOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPanelOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
      setData((prev) => (prev ? { ...prev, ...updates } as TaskAnalysisData : prev));
      pendingRef.current = { ...pendingRef.current, ...updates };
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => flushSave(), 1500);
    },
    [flushSave]
  );

  const handleStepsChange = useCallback(
    (steps: ProceduralStepData[]) => {
      setData((prev) => (prev ? { ...prev, steps } : prev));
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

  const composite = getComposite(data);
  const priority = priorityBadge(composite);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Bar */}
      <TaskAnalysisHeader
        taskName={data.taskName}
        analysisType={data.analysisType}
        priorityLabel={priority.label}
        priorityColor={priority.color}
        compositeScore={composite}
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={error}
        isPanelOpen={isPanelOpen}
        onTaskNameChange={(name) => handleFieldChange({ taskName: name })}
        onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
        onPriorityClick={() => {
          setIsPanelOpen(true);
          setActiveTab('priority');
        }}
      />

      {/* Task Info Banner (full-width, collapsible) */}
      <TaskInfoBanner
        taskGoal={data.taskGoal}
        objectiveId={data.objectiveId}
        objective={data.objective}
        sourceTaskId={data.sourceTaskId}
        dataSource={data.dataSource}
        courseId={courseId}
        onChange={handleFieldChange}
      />

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Step Builder */}
        <div
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
            isPanelOpen ? '' : 'w-full'
          }`}
        >
          {data.analysisType === 'PROCEDURAL' && (
            <ProceduralStepBuilder
              steps={data.steps}
              onChange={handleStepsChange}
            />
          )}
        </div>

        {/* Right Panel — Tabbed Context */}
        <div
          className={`flex-shrink-0 border-l border-gray-200 bg-white flex flex-col transition-all duration-300 overflow-hidden ${
            isPanelOpen
              ? 'w-[35%] min-w-[320px] max-w-[480px]'
              : 'w-0 min-w-0 border-l-0'
          }`}
        >
          {isPanelOpen && (
            <>
              {/* Tab Bar — sticky */}
              <div className="flex-shrink-0 border-b border-gray-200 flex">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-2 py-2.5 text-xs font-medium text-center transition-colors ${
                      activeTab === tab.key
                        ? 'text-[#03428e] border-b-2 border-[#03428e] bg-blue-50/30'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content — scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'learner' && (
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
                )}

                {activeTab === 'priority' && (
                  <PriorityScoringPanel
                    criticalityScore={data.criticalityScore}
                    frequencyScore={data.frequencyScore}
                    difficultyScore={data.difficultyScore}
                    universalityScore={data.universalityScore}
                    feasibilityScore={data.feasibilityScore}
                    onChange={handleFieldChange}
                  />
                )}

                {activeTab === 'reference' && (
                  <ReferencePanel courseId={courseId} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
