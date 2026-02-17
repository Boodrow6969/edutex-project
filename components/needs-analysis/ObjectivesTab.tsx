'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeneratedObjective } from '@/lib/types/objectives';
import ObjectivesGuidance from './ObjectivesGuidance';

interface SavedObjective {
  id: string;
  title: string;
  description: string;
  bloomLevel: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ObjectivesTabProps {
  courseId: string;
  pageId?: string;
}

// Bloom's level colors
const bloomLevelColors: Record<string, string> = {
  REMEMBER: 'bg-gray-100 text-gray-700',
  UNDERSTAND: 'bg-blue-100 text-blue-700',
  APPLY: 'bg-green-100 text-green-700',
  ANALYZE: 'bg-yellow-100 text-yellow-700',
  EVALUATE: 'bg-orange-100 text-orange-700',
  CREATE: 'bg-purple-100 text-purple-700',
};

export default function ObjectivesTab({ courseId, pageId }: ObjectivesTabProps) {
  // Saved objectives from database
  const [objectives, setObjectives] = useState<SavedObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [modalObjectives, setModalObjectives] = useState<GeneratedObjective[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<SavedObjective>>({});

  // Load objectives on mount
  const loadObjectives = useCallback(async () => {
    if (!courseId) return;

    try {
      setError(null);
      const response = await fetch(`/api/courses/${courseId}/objectives`);

      if (!response.ok) {
        throw new Error('Failed to load objectives');
      }

      const data = await response.json();
      setObjectives(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load objectives');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  // Create blank objective
  const createBlankObjective = (): GeneratedObjective => ({
    title: '',
    description: '',
    bloomLevel: 'APPLY',
    rationale: '',
    tags: [],
  });

  // Open modal for manual add
  const handleAddObjective = () => {
    setModalObjectives([createBlankObjective()]);
    setModalError(null);
    setIsGeneratingAI(false);
    setIsModalOpen(true);
  };

  // Open modal and generate with AI
  const handleGenerateWithAI = async () => {
    setModalObjectives([]);
    setModalError(null);
    setIsGeneratingAI(true);
    setIsModalOpen(true);

    try {
      const response = await fetch('/api/ai/generateObjectivesFromAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate objectives');
      }

      const data = await response.json();
      setModalObjectives(data.objectives);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add another blank objective in modal
  const handleAddModalObjective = () => {
    setModalObjectives((prev) => [...prev, createBlankObjective()]);
  };

  // Update objective in modal
  const handleUpdateModalObjective = (index: number, updates: Partial<GeneratedObjective>) => {
    setModalObjectives((prev) =>
      prev.map((obj, i) => (i === index ? { ...obj, ...updates } : obj))
    );
  };

  // Remove objective from modal
  const handleRemoveModalObjective = (index: number) => {
    setModalObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  // Save modal objectives to database
  const handleSaveModalObjectives = async () => {
    const validObjectives = modalObjectives.filter((obj) => obj.title.trim());
    if (validObjectives.length === 0) return;

    setIsSaving(true);
    setModalError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectives: validObjectives.map((obj) => ({
            title: obj.title.trim(),
            description: obj.description.trim(),
            bloomLevel: obj.bloomLevel,
            tags: obj.tags || [],
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save objectives');
      }

      // Success - close modal and refresh list
      setIsModalOpen(false);
      setModalObjectives([]);
      await loadObjectives();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing an objective
  const handleStartEdit = (objective: SavedObjective) => {
    setEditingId(objective.id);
    setEditingData({
      title: objective.title,
      description: objective.description,
      bloomLevel: objective.bloomLevel,
    });
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/objectives/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective');
      }

      setEditingId(null);
      setEditingData({});
      await loadObjectives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Delete objective
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this objective?')) return;

    try {
      const response = await fetch(`/api/objectives/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete objective');
      }

      await loadObjectives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const validModalCount = modalObjectives.filter((obj) => obj.title.trim()).length;

  return (
    <div className="space-y-6">
      {/* Guidance Panel */}
      <ObjectivesGuidance />

      {/* Objectives List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Learning Objectives ({objectives.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
            <button onClick={loadObjectives} className="ml-2 underline">
              Retry
            </button>
          </div>
        ) : objectives.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-gray-500 mb-1">No objectives yet</p>
            <p className="text-sm text-gray-400">Add your first learning objective below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((objective) => (
              <div
                key={objective.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                {editingId === objective.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={editingData.bloomLevel || objective.bloomLevel}
                        onChange={(e) => setEditingData({ ...editingData, bloomLevel: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="REMEMBER">REMEMBER</option>
                        <option value="UNDERSTAND">UNDERSTAND</option>
                        <option value="APPLY">APPLY</option>
                        <option value="ANALYZE">ANALYZE</option>
                        <option value="EVALUATE">EVALUATE</option>
                        <option value="CREATE">CREATE</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editingData.title ?? objective.title}
                      onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                      className="w-full font-medium text-gray-900 border border-gray-200 rounded px-2 py-1"
                    />
                    <textarea
                      value={editingData.description ?? objective.description}
                      onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                      rows={2}
                      className="w-full text-sm text-gray-600 border border-gray-200 rounded px-2 py-1"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${bloomLevelColors[objective.bloomLevel] || 'bg-gray-100 text-gray-700'}`}>
                            {objective.bloomLevel}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{objective.title}</h4>
                        {objective.description && (
                          <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(objective)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(objective.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddObjective}
          className="flex-1 py-3 bg-[#03428e] hover:bg-[#022d61] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Objective
        </button>
        <button
          type="button"
          onClick={handleGenerateWithAI}
          className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Generate with AI
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isGeneratingAI ? 'Generating Objectives...' : 'Add Learning Objectives'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isGeneratingAI
                    ? 'AI is analyzing your needs analysis...'
                    : 'Create objectives using the ABCD format'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              {isGeneratingAI ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Generating objectives from your needs analysis...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                </div>
              ) : modalError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{modalError}</p>
                  <button
                    onClick={handleGenerateWithAI}
                    className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalObjectives.map((objective, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveModalObjective(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${bloomLevelColors[objective.bloomLevel]}`}>
                          {objective.bloomLevel}
                        </span>
                        <select
                          value={objective.bloomLevel}
                          onChange={(e) =>
                            handleUpdateModalObjective(index, {
                              bloomLevel: e.target.value as GeneratedObjective['bloomLevel'],
                            })
                          }
                          className="text-xs border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="REMEMBER">REMEMBER</option>
                          <option value="UNDERSTAND">UNDERSTAND</option>
                          <option value="APPLY">APPLY</option>
                          <option value="ANALYZE">ANALYZE</option>
                          <option value="EVALUATE">EVALUATE</option>
                          <option value="CREATE">CREATE</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={objective.title}
                        onChange={(e) => handleUpdateModalObjective(index, { title: e.target.value })}
                        placeholder="Enter objective title (e.g., 'Demonstrate the sales process')"
                        className="w-full font-medium text-gray-900 border-b border-gray-200 hover:border-gray-300 focus:border-green-500 outline-none pb-1 mb-2 pr-8 placeholder:text-gray-400 placeholder:font-normal"
                      />

                      <textarea
                        value={objective.description}
                        onChange={(e) => handleUpdateModalObjective(index, { description: e.target.value })}
                        placeholder="Describe the full objective with condition and criterion..."
                        rows={2}
                        className="w-full text-sm text-gray-600 border border-gray-200 hover:border-gray-300 focus:border-green-500 rounded outline-none resize-none p-2 placeholder:text-gray-400"
                      />

                      {objective.rationale && (
                        <p className="text-xs text-gray-400 mt-2 italic">
                          Rationale: {objective.rationale}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Add Objective Button */}
                  <button
                    type="button"
                    onClick={handleAddModalObjective}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Objective
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {!isGeneratingAI && (
                  <span>{validModalCount} objective{validModalCount !== 1 ? 's' : ''} ready to save</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalObjectives}
                  disabled={isSaving || isGeneratingAI || validModalCount === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save to Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
