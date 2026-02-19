'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SubTabBar from '@/components/ui/SubTabBar';
import AnalysisTab from '@/components/needs-analysis/AnalysisTab';
import StakeholdersTab from '@/components/needs-analysis/StakeholdersTab';
import ObjectivesTab from '@/components/needs-analysis/ObjectivesTab';
import {
  CourseAnalysisFormData,
  defaultCourseAnalysisFormData,
  StakeholderSubmissionDisplay,
  WorkspaceContact,
} from '@/lib/types/courseAnalysis';

const TABS = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'objectives', label: 'Objectives' },
];

const AUTOSAVE_DELAY = 1500;

interface NeedsAnalysisViewProps {
  courseId: string;
  pageId?: string;
  workspaceId: string;
  initialTab?: string;
}

export default function NeedsAnalysisView({
  courseId,
  pageId,
  workspaceId,
  initialTab,
}: NeedsAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'analysis');
  const [formData, setFormData] = useState<CourseAnalysisFormData>(defaultCourseAnalysisFormData);
  const [submissions, setSubmissions] = useState<StakeholderSubmissionDisplay[]>([]);
  const [workspaceContacts, setWorkspaceContacts] = useState<WorkspaceContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save refs
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const activeTabRef = useRef(activeTab);

  // Keep activeTab ref current
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Fetch all data from analysis-context endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/analysis-context`);
        if (!response.ok) throw new Error('Failed to fetch analysis context');

        const data = await response.json();
        const loaded = { ...defaultCourseAnalysisFormData, ...data.courseAnalysis };
        setFormData(loaded);
        lastSavedDataRef.current = JSON.stringify(loaded);
        setSubmissions(data.submissions ?? []);
        setWorkspaceContacts(data.workspaceContacts ?? []);
      } catch {
        // Data will stay at defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleFormChange = useCallback((updates: Partial<CourseAnalysisFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveStatus('idle');
  }, []);

  const saveToServer = useCallback(async (data: CourseAnalysisFormData) => {
    if (!pageId || isSavingRef.current) return;

    const dataStr = JSON.stringify(data);
    if (dataStr === lastSavedDataRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const response = await fetch(`/api/pages/${pageId}/course-analysis`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: dataStr,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      // Update formData with server response (gets real IDs for new audiences/tasks)
      const saved = await response.json();
      if (saved.audiences || saved.tasks) {
        setFormData((prev) => {
          const updated = {
            ...prev,
            audiences: (saved.audiences ?? []).map((a: Record<string, unknown>) => ({
              id: a.id,
              role: a.role,
              headcount: a.headcount,
              frequency: a.frequency,
              techComfort: a.techComfort,
              trainingFormat: a.trainingFormat,
              notes: a.notes,
              order: a.order,
            })),
            tasks: (saved.tasks ?? []).map((t: Record<string, unknown>) => ({
              id: t.id,
              task: t.task,
              audience: t.audience,
              source: t.source,
              complexity: t.complexity,
              intervention: t.intervention,
              priority: t.priority,
              notes: t.notes,
              order: t.order,
            })),
          };
          lastSavedDataRef.current = JSON.stringify(updated);
          return updated;
        });
      } else {
        lastSavedDataRef.current = dataStr;
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [pageId]);

  // Debounced auto-save on formData change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip auto-save on Objectives tab (manages its own save)
    if (activeTabRef.current === 'objectives') return;
    if (!pageId) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveToServer(formData);
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData, pageId, saveToServer]);

  // Manual save — flush any pending timer and save immediately
  const handleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveToServer(formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <AnalysisTab
            data={formData}
            onChange={handleFormChange}
            submissions={submissions}
          />
        );
      case 'stakeholders':
        return (
          <StakeholdersTab
            data={formData}
            onChange={handleFormChange}
            workspaceContacts={workspaceContacts}
          />
        );
      case 'objectives':
        return <ObjectivesTab courseId={courseId} pageId={pageId} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Needs Analysis</h1>
            <div className="flex items-center gap-3">
              {/* Save status indicator */}
              {saveStatus === 'saving' && (
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-500">Save failed</span>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !pageId}
                className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Progress
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Synthesize stakeholder input into actionable decisions that drive Learning Objectives.
          </p>
        </div>

        {/* Tab Navigation */}
        <SubTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="p-6 max-w-5xl mx-auto">{renderTabContent()}</div>
    </div>
  );
}
