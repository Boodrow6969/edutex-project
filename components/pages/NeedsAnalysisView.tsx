'use client';

import { useState } from 'react';
import BlockEditor from '@/components/editor/BlockEditor';
import { NeedsAnalysisResult, RecommendedTask } from '@/lib/types/needsAnalysis';

interface NeedsAnalysisViewProps {
  pageId: string;
  projectId: string;
}

/**
 * Needs Analysis page view with block editor and AI analysis panel.
 *
 * Note: The analysis result is stored in client state only for this milestone.
 * Persistence of analysis results would require schema changes (e.g., adding
 * a metadata JSON field to Page model) which is out of scope.
 */
export default function NeedsAnalysisView({
  pageId,
  projectId,
}: NeedsAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<NeedsAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [taskCreationResult, setTaskCreationResult] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setTaskCreationResult(null);

    try {
      const response = await fetch('/api/ai/analyzeNeeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze');
      }

      const data = await response.json();
      setAnalysis(data.result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!analysis) return;

    setIsCreatingTasks(true);
    setTaskCreationResult(null);

    try {
      const response = await fetch('/api/tasks/fromNeedsAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, analysis }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tasks');
      }

      const data = await response.json();
      setTaskCreationResult({
        message: data.message,
        type: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tasks';
      setTaskCreationResult({
        message,
        type: 'error',
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const getPriorityColor = (priority: RecommendedTask['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Left panel - Block Editor */}
      <div className="flex-1 lg:border-r lg:border-gray-200 overflow-auto">
        <BlockEditor pageId={pageId} />
      </div>

      {/* Right panel - Analysis */}
      <div className="lg:w-96 bg-gray-50 border-t lg:border-t-0 border-gray-200 flex flex-col">
        {/* Analysis header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            AI Analysis
          </h2>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Analyze Content
              </>
            )}
          </button>

          {analysisError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {analysisError}
            </div>
          )}
        </div>

        {/* Analysis results */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {!analysis && !isAnalyzing && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-2">No analysis yet</p>
              <p className="text-sm">
                Add your SME notes in the editor, then click &quot;Analyze Content&quot; to get AI-powered insights.
              </p>
            </div>
          )}

          {analysis && (
            <>
              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Summary
                </h3>
                <p className="text-sm text-gray-600">{analysis.summary}</p>
              </div>

              {/* Key Insights */}
              {analysis.keyInsights.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {analysis.keyInsights.map((insight, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex gap-2"
                      >
                        <span className="text-blue-500 flex-shrink-0">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Audience Notes */}
              {analysis.audienceNotes && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Target Audience
                  </h3>
                  <p className="text-sm text-gray-600">{analysis.audienceNotes}</p>
                </div>
              )}

              {/* Constraints */}
              {analysis.constraints.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Constraints
                  </h3>
                  <ul className="space-y-1">
                    {analysis.constraints.map((constraint, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex gap-2"
                      >
                        <span className="text-yellow-500 flex-shrink-0">!</span>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Tasks */}
              {analysis.recommendedTasks.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Recommended Tasks ({analysis.recommendedTasks.length})
                    </h3>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {analysis.recommendedTasks.map((task, index) => (
                      <li
                        key={index}
                        className="text-sm border border-gray-100 rounded p-2"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-gray-500 text-xs mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleCreateTasks}
                    disabled={isCreatingTasks}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreatingTasks ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Tasks...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Create Tasks in Project
                      </>
                    )}
                  </button>

                  {taskCreationResult && (
                    <div
                      className={`mt-3 p-3 rounded text-sm ${
                        taskCreationResult.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-600'
                      }`}
                    >
                      {taskCreationResult.message}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
