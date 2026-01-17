'use client';

import { useState, useCallback } from 'react';
import SubTabBar from '@/components/ui/SubTabBar';
import ProblemTab from '@/components/needs-analysis/ProblemTab';
import StakeholdersTab from '@/components/needs-analysis/StakeholdersTab';
import PerformanceTab from '@/components/needs-analysis/PerformanceTab';
import SuccessMetricsTab from '@/components/needs-analysis/SuccessMetricsTab';
import ObjectivesTab from '@/components/needs-analysis/ObjectivesTab';
import {
  NeedsAnalysisFormData,
  NeedsAnalysisResult,
  NeedsAnalysisProps,
  defaultNeedsAnalysisFormData,
} from '@/lib/types/needsAnalysis';

const TABS = [
  { id: 'problem', label: 'Problem' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'performance', label: 'Performance' },
  { id: 'success-metrics', label: 'Success Metrics' },
  { id: 'objectives', label: 'Objectives' },
];

export default function NeedsAnalysisView({
  projectId,
  pageId,
  initialData,
  onSave,
}: NeedsAnalysisProps) {
  const [activeTab, setActiveTab] = useState('problem');
  const [formData, setFormData] = useState<NeedsAnalysisFormData>({
    ...defaultNeedsAnalysisFormData,
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotes, setImportNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NeedsAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleFormChange = useCallback((updates: Partial<NeedsAnalysisFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveMessage(null);
  }, []);

  const handleSave = async () => {
    if (!onSave) {
      setSaveMessage({ text: 'Save functionality not configured', type: 'error' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await onSave(formData);
      setSaveMessage({ text: 'Progress saved successfully', type: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveMessage({ text: message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeNotes = async () => {
    if (!importNotes.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // If pageId exists, use the existing endpoint
      // Otherwise, we'll need to send the raw text
      const response = await fetch('/api/ai/analyzeNeeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageId ? { pageId } : { rawText: importNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze');
      }

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportResults = () => {
    if (!analysisResult) return;

    const updates: Partial<NeedsAnalysisFormData> = {};

    if (analysisResult.summary) {
      updates.problemStatement = analysisResult.summary;
    }

    if (analysisResult.audienceNotes) {
      updates.learnerPersonas = [...formData.learnerPersonas, analysisResult.audienceNotes];
    }

    if (analysisResult.constraints.length > 0) {
      updates.constraints = [...formData.constraints, ...analysisResult.constraints];
    }

    if (analysisResult.keyInsights.length > 0) {
      // Add key insights to business need
      updates.businessNeed = formData.businessNeed
        ? `${formData.businessNeed}\n\nKey Insights:\n${analysisResult.keyInsights.map(i => `- ${i}`).join('\n')}`
        : `Key Insights:\n${analysisResult.keyInsights.map(i => `- ${i}`).join('\n')}`;
    }

    handleFormChange(updates);
    setIsImportModalOpen(false);
    setImportNotes('');
    setAnalysisResult(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'problem':
        return <ProblemTab data={formData} onChange={handleFormChange} />;
      case 'stakeholders':
        return <StakeholdersTab data={formData} onChange={handleFormChange} />;
      case 'performance':
        return <PerformanceTab data={formData} onChange={handleFormChange} />;
      case 'success-metrics':
        return <SuccessMetricsTab data={formData} onChange={handleFormChange} />;
      case 'objectives':
        return <ObjectivesTab projectId={projectId} pageId={pageId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Needs Analysis</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="text-[#03428e] hover:text-[#022d61] font-medium text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Import from Notes
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !onSave}
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
            Conduct a comprehensive analysis aligned with adult learning principles and instructional design best practices.
          </p>
          {saveMessage && (
            <div
              className={`mt-3 text-sm ${
                saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <SubTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="p-6 max-w-4xl mx-auto">{renderTabContent()}</div>

      {/* AI Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Import from SME Notes</h2>
                <p className="text-sm text-gray-500">Paste your SME interview notes and let AI extract key information</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportNotes('');
                  setAnalysisResult(null);
                  setAnalysisError(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {!analysisResult ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SME Notes / Interview Transcript
                    </label>
                    <textarea
                      value={importNotes}
                      onChange={(e) => setImportNotes(e.target.value)}
                      placeholder="Paste your SME interview notes, meeting transcripts, or any relevant documentation here..."
                      rows={12}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
                    />
                  </div>

                  {analysisError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {analysisError}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Analysis Complete
                    </div>
                    <p className="text-sm text-green-600">
                      Review the extracted information below, then click &quot;Import to Form&quot; to add it to your analysis.
                    </p>
                  </div>

                  {analysisResult.summary && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary → Problem Statement</h4>
                      <p className="text-sm text-gray-600">{analysisResult.summary}</p>
                    </div>
                  )}

                  {analysisResult.audienceNotes && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Audience Notes → Learner Personas</h4>
                      <p className="text-sm text-gray-600">{analysisResult.audienceNotes}</p>
                    </div>
                  )}

                  {analysisResult.constraints.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Constraints</h4>
                      <ul className="space-y-1">
                        {analysisResult.constraints.map((constraint, index) => (
                          <li key={index} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-yellow-500">!</span>
                            {constraint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.keyInsights.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Insights → Business Need</h4>
                      <ul className="space-y-1">
                        {analysisResult.keyInsights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-blue-500">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportNotes('');
                  setAnalysisResult(null);
                  setAnalysisError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>

              {!analysisResult ? (
                <button
                  type="button"
                  onClick={handleAnalyzeNotes}
                  disabled={isAnalyzing || !importNotes.trim()}
                  className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Notes
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisResult(null);
                      setImportNotes('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
                  >
                    Start Over
                  </button>
                  <button
                    type="button"
                    onClick={handleImportResults}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Import to Form
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
