'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeneratedObjective, BloomLevelString } from '@/lib/types/objectives';

interface LearningObjectivesViewProps {
  pageId: string;
  courseId: string;
}

interface SavedObjective {
  id: string;
  title: string;
  description: string;
  bloomLevel: BloomLevelString;
  tags: string[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

type ObjectiveStatus = 'generated' | 'approved' | 'editing';

interface ObjectiveWithStatus extends GeneratedObjective {
  id?: string; // Present if saved
  status: ObjectiveStatus;
  originalData?: GeneratedObjective; // For canceling edits
}

const BLOOM_LEVELS: BloomLevelString[] = [
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
  'CREATE',
];

const BLOOM_COLORS: Record<BloomLevelString, string> = {
  REMEMBER: 'bg-slate-100 text-slate-700 border-slate-300',
  UNDERSTAND: 'bg-blue-100 text-blue-700 border-blue-300',
  APPLY: 'bg-green-100 text-green-700 border-green-300',
  ANALYZE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  EVALUATE: 'bg-orange-100 text-orange-700 border-orange-300',
  CREATE: 'bg-purple-100 text-purple-700 border-purple-300',
};

/**
 * Learning Objectives page view with AI generation and CRUD management.
 */
export default function LearningObjectivesView({
  pageId,
  courseId,
}: LearningObjectivesViewProps) {
  // Saved objectives from database
  const [savedObjectives, setSavedObjectives] = useState<SavedObjective[]>([]);
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Generated objectives (not yet saved)
  const [generatedObjectives, setGeneratedObjectives] = useState<ObjectiveWithStatus[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState('');
  const [needsSummaryInput, setNeedsSummaryInput] = useState('');

  // Manual creation state
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualObjective, setManualObjective] = useState<GeneratedObjective>({
    title: '',
    description: '',
    bloomLevel: 'APPLY',
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GeneratedObjective | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch existing objectives
  const fetchObjectives = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await fetch(`/api/courses/${courseId}/objectives`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch objectives');
      }
      const data = await response.json();
      setSavedObjectives(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load objectives';
      setLoadError(message);
    } finally {
      setIsLoadingObjectives(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  // Generate objectives via AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/ai/generateObjectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          context: contextInput.trim() || undefined,
          needsSummary: needsSummaryInput.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate objectives');
      }

      const data = await response.json();
      const newObjectives: ObjectiveWithStatus[] = data.objectives.map(
        (obj: GeneratedObjective) => ({
          ...obj,
          status: 'generated' as ObjectiveStatus,
        })
      );
      setGeneratedObjectives(newObjectives);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve and save a generated objective
  const handleApprove = async (index: number) => {
    const objective = generatedObjectives[index];
    if (!objective) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectives: [
            {
              title: objective.title,
              description: objective.description,
              bloomLevel: objective.bloomLevel,
              tags: objective.tags || [],
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save objective');
      }

      const data = await response.json();
      setSavedObjectives((prev) => [...prev, ...data.created]);

      // Remove from generated list
      setGeneratedObjectives((prev) => prev.filter((_, i) => i !== index));
      setSaveMessage({ type: 'success', text: 'Objective approved and saved' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  // Approve all generated objectives
  const handleApproveAll = async () => {
    if (generatedObjectives.length === 0) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectives: generatedObjectives.map((obj) => ({
            title: obj.title,
            description: obj.description,
            bloomLevel: obj.bloomLevel,
            tags: obj.tags || [],
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save objectives');
      }

      const data = await response.json();
      setSavedObjectives((prev) => [...prev, ...data.created]);
      setGeneratedObjectives([]);
      setSaveMessage({
        type: 'success',
        text: `Approved and saved ${data.created.length} objective(s)`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard a generated objective
  const handleDiscard = (index: number) => {
    setGeneratedObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  // Start editing a saved objective
  const handleStartEdit = (objective: SavedObjective) => {
    setEditingId(objective.id);
    setEditForm({
      title: objective.title,
      description: objective.description,
      bloomLevel: objective.bloomLevel,
      tags: objective.tags,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Save edited objective
  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/objectives/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          bloomLevel: editForm.bloomLevel,
          tags: editForm.tags,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update objective');
      }

      const updated = await response.json();
      setSavedObjectives((prev) =>
        prev.map((obj) => (obj.id === editingId ? updated : obj))
      );
      setEditingId(null);
      setEditForm(null);
      setSaveMessage({ type: 'success', text: 'Objective updated' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a saved objective
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this objective?')) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/objectives/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete objective');
      }

      setSavedObjectives((prev) => prev.filter((obj) => obj.id !== id));
      setSaveMessage({ type: 'success', text: 'Objective deleted' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  // Create manual objective
  const handleCreateManual = async () => {
    if (!manualObjective.title.trim()) {
      setSaveMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectives: [
            {
              title: manualObjective.title.trim(),
              description: manualObjective.description.trim(),
              bloomLevel: manualObjective.bloomLevel,
              tags: manualObjective.tags || [],
            },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create objective');
      }

      const data = await response.json();
      setSavedObjectives((prev) => [...prev, ...data.created]);
      setIsCreatingManual(false);
      setManualObjective({ title: '', description: '', bloomLevel: 'APPLY' });
      setSaveMessage({ type: 'success', text: 'Objective created' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create';
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  // Edit a generated objective before approving
  const handleEditGenerated = (index: number, field: keyof GeneratedObjective, value: string | string[]) => {
    setGeneratedObjectives((prev) =>
      prev.map((obj, i) =>
        i === index ? { ...obj, [field]: value } : obj
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Left panel - Generation and Context */}
      <div className="lg:w-96 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
        {/* Generation header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            AI Generation
          </h2>

          {/* Context inputs */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context (optional)
              </label>
              <textarea
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Add any additional context about the training need..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Needs Summary (optional)
              </label>
              <textarea
                value={needsSummaryInput}
                onChange={(e) => setNeedsSummaryInput(e.target.value)}
                placeholder="Paste a summary from needs analysis..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Generate Objectives
              </>
            )}
          </button>

          {generateError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {generateError}
            </div>
          )}
        </div>

        {/* Generated objectives (review panel) */}
        <div className="flex-1 overflow-auto p-4">
          {generatedObjectives.length === 0 && !isGenerating && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-2">No generated objectives</p>
              <p className="text-sm">
                Add context above and click &quot;Generate Objectives&quot; to get AI-powered suggestions.
              </p>
            </div>
          )}

          {generatedObjectives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Review Generated ({generatedObjectives.length})
                </h3>
                <button
                  onClick={handleApproveAll}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve All
                </button>
              </div>

              {generatedObjectives.map((obj, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div>
                    <input
                      type="text"
                      value={obj.title}
                      onChange={(e) => handleEditGenerated(index, 'title', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <textarea
                      value={obj.description}
                      onChange={(e) => handleEditGenerated(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={obj.bloomLevel}
                      onChange={(e) => handleEditGenerated(index, 'bloomLevel', e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded border ${BLOOM_COLORS[obj.bloomLevel]}`}
                    >
                      {BLOOM_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {obj.rationale && (
                    <p className="text-xs text-gray-500 italic">
                      Rationale: {obj.rationale}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(index)}
                      disabled={isSaving}
                      className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDiscard(index)}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Saved Objectives */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Learning Objectives ({savedObjectives.length})
          </h2>
          <button
            onClick={() => setIsCreatingManual(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Manual
          </button>
        </div>

        {/* Status message */}
        {saveMessage && (
          <div
            className={`mx-4 mt-4 p-3 rounded text-sm ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Objectives list */}
        <div className="flex-1 overflow-auto p-4">
          {isLoadingObjectives ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading objectives...</span>
              </div>
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{loadError}</p>
              <button
                onClick={fetchObjectives}
                className="mt-3 text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : savedObjectives.length === 0 && !isCreatingManual ? (
            <div className="text-center text-gray-500 py-12">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="mb-2 font-medium">No objectives yet</p>
              <p className="text-sm">
                Generate objectives using AI or add them manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Manual creation form */}
              {isCreatingManual && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">New Objective</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={manualObjective.title}
                      onChange={(e) =>
                        setManualObjective((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter objective statement..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={manualObjective.description}
                      onChange={(e) =>
                        setManualObjective((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Extended description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bloom Level
                    </label>
                    <select
                      value={manualObjective.bloomLevel}
                      onChange={(e) =>
                        setManualObjective((prev) => ({
                          ...prev,
                          bloomLevel: e.target.value as BloomLevelString,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {BLOOM_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateManual}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingManual(false);
                        setManualObjective({ title: '', description: '', bloomLevel: 'APPLY' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Saved objectives */}
              {savedObjectives.map((obj) => (
                <div
                  key={obj.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  {editingId === obj.id && editForm ? (
                    // Edit mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => prev && { ...prev, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => prev && { ...prev, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                      <select
                        value={editForm.bloomLevel}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev && { ...prev, bloomLevel: e.target.value as BloomLevelString }
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {BLOOM_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{obj.title}</h3>
                          {obj.description && (
                            <p className="mt-1 text-sm text-gray-600">{obj.description}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${
                            BLOOM_COLORS[obj.bloomLevel]
                          }`}
                        >
                          {obj.bloomLevel}
                        </span>
                      </div>

                      {obj.tags && obj.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {obj.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => handleStartEdit(obj)}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(obj.id)}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
