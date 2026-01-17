'use client';

import { useState, useEffect, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Target, RefreshCw, Trash2, ChevronDown, ChevronUp, AlertCircle, Plus } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface ImportedObjective {
  id: string;
  text: string;
  bloomLevel: string;
}

interface APIObjective {
  id: string;
  title: string;
  description: string;
  bloomLevel: string;
}

// Bloom level options
const BLOOM_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'] as const;

// Bloom level colors
const BLOOM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  REMEMBER: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  UNDERSTAND: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  APPLY: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  ANALYZE: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  EVALUATE: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  CREATE: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
};

// =============================================================================
// Component
// =============================================================================

export default function LearningObjectivesImportComponent({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const { importedAt, objectives, displayMode, projectId } = node.attrs as {
    importedAt: string;
    objectives: ImportedObjective[];
    displayMode: 'compact' | 'detailed';
    projectId?: string;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Quick Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [newBloomLevel, setNewBloomLevel] = useState<string>('APPLY');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Use projectId from node attributes
  const resolvedProjectId = projectId;

  // ==========================================================================
  // Fetch Objectives
  // ==========================================================================

  const fetchObjectives = useCallback(async () => {
    if (!resolvedProjectId) {
      setError('Project ID not available. Cannot fetch objectives.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${resolvedProjectId}/objectives`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch objectives');
      }

      const apiObjectives: APIObjective[] = await response.json();

      // Transform API response to our format
      const importedObjectives: ImportedObjective[] = apiObjectives.map((obj) => ({
        id: obj.id,
        text: obj.title,
        bloomLevel: obj.bloomLevel,
      }));

      updateAttributes({
        importedAt: new Date().toISOString(),
        objectives: importedObjectives,
        projectId: resolvedProjectId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch objectives';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedProjectId, updateAttributes]);

  // Auto-fetch on mount if no objectives yet
  useEffect(() => {
    if (objectives.length === 0 && !importedAt && resolvedProjectId && !isLoading) {
      fetchObjectives();
    }
  }, [objectives.length, importedAt, resolvedProjectId, isLoading, fetchObjectives]);

  // ==========================================================================
  // Add Objective
  // ==========================================================================

  const handleAddObjective = useCallback(async () => {
    if (!resolvedProjectId || !newObjectiveText.trim()) {
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const response = await fetch(`/api/projects/${resolvedProjectId}/objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectives: [
            {
              title: newObjectiveText.trim(),
              description: '',
              bloomLevel: newBloomLevel,
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create objective');
      }

      // Clear form and refresh objectives list
      setNewObjectiveText('');
      setNewBloomLevel('APPLY');
      setShowAddForm(false);
      await fetchObjectives();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create objective';
      setAddError(message);
    } finally {
      setIsAdding(false);
    }
  }, [resolvedProjectId, newObjectiveText, newBloomLevel, fetchObjectives]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const getBloomStyle = (level: string) => {
    return BLOOM_COLORS[level.toUpperCase()] || BLOOM_COLORS.REMEMBER;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <NodeViewWrapper className="learning-objectives-import-wrapper">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4 relative group">
        {/* Delete Button */}
        <button
          type="button"
          onClick={deleteNode}
          title="Delete block"
          className="absolute top-2 right-2 p-1.5 rounded-md z-10
                     text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-indigo-50 rounded-t-lg pr-12">
          <Target className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900">Learning Objectives</h3>
            {importedAt && (
              <p className="text-xs text-indigo-600">
                Imported {formatDate(importedAt)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Display Mode Toggle */}
            <select
              value={displayMode}
              onChange={(e) => updateAttributes({ displayMode: e.target.value })}
              className="px-2 py-1 text-xs border border-indigo-200 rounded bg-white text-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="detailed">Detailed</option>
              <option value="compact">Compact</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchObjectives}
              disabled={isLoading}
              title="Refresh objectives"
              className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-100
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4">
            {/* Error State */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && objectives.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading objectives...</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && objectives.length === 0 && !error && (
              <div className="text-center py-6">
                <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">
                  No learning objectives found for this project.
                </p>
                <p className="text-xs text-gray-400">
                  Add an objective below or import from the Learning Objectives page.
                </p>
              </div>
            )}

            {/* Objectives List */}
            {objectives.length > 0 && (
              <div className="space-y-2">
                {displayMode === 'detailed' ? (
                  // Detailed View
                  objectives.map((obj, index) => {
                    const bloomStyle = getBloomStyle(obj.bloomLevel);
                    return (
                      <div
                        key={obj.id}
                        className={`flex items-start gap-3 p-3 rounded-md border ${bloomStyle.border} ${bloomStyle.bg}`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{obj.text}</p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded ${bloomStyle.bg} ${bloomStyle.text}`}
                        >
                          {obj.bloomLevel}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  // Compact View
                  <ul className="space-y-1">
                    {objectives.map((obj, index) => {
                      const bloomStyle = getBloomStyle(obj.bloomLevel);
                      return (
                        <li key={obj.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-gray-400">{index + 1}.</span>
                          <span className="flex-1">{obj.text}</span>
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${bloomStyle.bg} ${bloomStyle.text}`}
                          >
                            {obj.bloomLevel.substring(0, 3)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {objectives.length} objective{objectives.length !== 1 ? 's' : ''} imported
                  </span>
                  <div className="flex items-center gap-1">
                    {Object.entries(
                      objectives.reduce((acc, obj) => {
                        acc[obj.bloomLevel] = (acc[obj.bloomLevel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([level, count]) => {
                      const style = getBloomStyle(level);
                      return (
                        <span
                          key={level}
                          className={`px-1.5 py-0.5 text-xs rounded ${style.bg} ${style.text}`}
                          title={`${count} ${level}`}
                        >
                          {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Add Form */}
            {resolvedProjectId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!showAddForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Objective</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Add Error */}
                    {addError && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700">{addError}</p>
                      </div>
                    )}

                    {/* Form Row */}
                    <div className="flex items-start gap-2">
                      {/* Text Input */}
                      <input
                        type="text"
                        value={newObjectiveText}
                        onChange={(e) => setNewObjectiveText(e.target.value)}
                        placeholder="Enter learning objective..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   placeholder-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && newObjectiveText.trim()) {
                            e.preventDefault();
                            handleAddObjective();
                          }
                          if (e.key === 'Escape') {
                            setShowAddForm(false);
                            setNewObjectiveText('');
                            setAddError(null);
                          }
                        }}
                        disabled={isAdding}
                        autoFocus
                      />

                      {/* Bloom Level Dropdown */}
                      <select
                        value={newBloomLevel}
                        onChange={(e) => setNewBloomLevel(e.target.value)}
                        disabled={isAdding}
                        className="px-2 py-2 text-sm border border-gray-300 rounded-md bg-white
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {BLOOM_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0) + level.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        disabled={isAdding || !newObjectiveText.trim()}
                        className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md
                                   hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors flex items-center gap-1.5"
                      >
                        {isAdding ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewObjectiveText('');
                          setAddError(null);
                        }}
                        disabled={isAdding}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Bloom Level Preview Badge */}
                    {newBloomLevel && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Bloom level:</span>
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${BLOOM_COLORS[newBloomLevel].bg} ${BLOOM_COLORS[newBloomLevel].text}`}
                        >
                          {newBloomLevel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
