'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ProjectBlueprintObjectivesPageProps = {
  params: Promise<{ id: string; blueprintId: string }>;
};

interface BlueprintObjective {
  id: string;
  text: string;
  bloomLevel: string;
  priority: string;
  requiresAssessment: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectBlueprintObjectivesPage({ params }: ProjectBlueprintObjectivesPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [objectives, setObjectives] = useState<BlueprintObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [blueprintTitle, setBlueprintTitle] = useState<string | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [priority, setPriority] = useState('');
  const [requiresAssessment, setRequiresAssessment] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
      setBlueprintId(p.blueprintId);
    });
  }, [params]);

  // Fetch project and blueprint info for breadcrumb
  useEffect(() => {
    if (!projectId || !blueprintId) return;

    const fetchProjectAndBlueprint = async () => {
      try {
        // Fetch project
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProjectName(projectData.name || null);
        }

        // Fetch blueprint (we can get it from the blueprint detail or create a simple API)
        // For now, we'll try to get it from the project API or fetch blueprint directly
        // Since there's no direct blueprint API, we'll skip blueprint title for now
        // and just use the project name in breadcrumb
      } catch (err) {
        // Silently fail - breadcrumb is optional
        console.error('Failed to fetch project info:', err);
      }
    };

    fetchProjectAndBlueprint();
  }, [projectId, blueprintId]);

  // Fetch objectives
  useEffect(() => {
    if (!projectId || !blueprintId) return;

    const fetchObjectives = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}/blueprints/${blueprintId}/objectives`);
        if (!response.ok) {
          throw new Error('Failed to fetch objectives');
        }
        const data = await response.json();
        setObjectives(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchObjectives();
  }, [projectId, blueprintId]);

  const resetForm = () => {
    setText('');
    setBloomLevel('');
    setPriority('');
    setRequiresAssessment(false);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEdit = (objective: BlueprintObjective) => {
    setText(objective.text);
    setBloomLevel(objective.bloomLevel);
    setPriority(objective.priority);
    setRequiresAssessment(objective.requiresAssessment);
    setEditingId(objective.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !blueprintId) {
      setError('Project ID or Blueprint ID is missing');
      return;
    }

    if (!text.trim()) {
      setError('Text is required');
      return;
    }

    if (!bloomLevel.trim()) {
      setError('Bloom level is required');
      return;
    }

    if (!priority.trim()) {
      setError('Priority is required');
      return;
    }

    try {
      setError(null);
      const url = editingId
        ? `/api/projects/${projectId}/blueprints/${blueprintId}/objectives/${editingId}`
        : `/api/projects/${projectId}/blueprints/${blueprintId}/objectives`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          bloomLevel,
          priority,
          requiresAssessment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save objective');
      }

      // Refresh objectives list
      const fetchResponse = await fetch(`/api/projects/${projectId}/blueprints/${blueprintId}/objectives`);
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setObjectives(data);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!projectId || !blueprintId) {
      setError('Project ID or Blueprint ID is missing');
      return;
    }

    if (!confirm('Are you sure you want to delete this objective?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `/api/projects/${projectId}/blueprints/${blueprintId}/objectives/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete objective');
      }

      // Refresh objectives list
      const fetchResponse = await fetch(`/api/projects/${projectId}/blueprints/${blueprintId}/objectives`);
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setObjectives(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!projectId || !blueprintId) {
    return <div>Loading...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Navigation */}
      <div className="space-y-2">
        <Link
          href={`/projects/${projectId}/blueprints/${blueprintId}`}
          className="text-sm text-gray-500 hover:text-gray-700 inline-block"
        >
          ← Back to Blueprint
        </Link>
        {(projectName || projectId) && (
          <div className="text-sm text-gray-500">
            <Link
              href={`/projects/${projectId}`}
              className="hover:text-gray-700"
            >
              Projects
            </Link>
            {projectName && (
              <>
                {' › '}
                <Link
                  href={`/projects/${projectId}`}
                  className="hover:text-gray-700"
                >
                  {projectName}
                </Link>
              </>
            )}
            {' › '}
            <Link
              href={`/projects/${projectId}/blueprints`}
              className="hover:text-gray-700"
            >
              Blueprints
            </Link>
            {' › '}
            <Link
              href={`/projects/${projectId}/blueprints/${blueprintId}`}
              className="hover:text-gray-700"
            >
              Blueprint
            </Link>
            {' › Objectives'}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blueprint Objectives</h1>
        {!showAddForm && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
          >
            Add Objective
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit Objective' : 'Add Objective'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="text">
                Objective Text *
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                placeholder="Enter the learning objective"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bloomLevel">
                Bloom Level *
              </label>
              <input
                id="bloomLevel"
                type="text"
                value={bloomLevel}
                onChange={(e) => setBloomLevel(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g., REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="priority">
                Priority *
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="requiresAssessment"
                type="checkbox"
                checked={requiresAssessment}
                onChange={(e) => setRequiresAssessment(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium" htmlFor="requiresAssessment">
                Requires Assessment
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading objectives...</div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No objectives yet. Click &quot;Add Objective&quot; to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => (
            <div key={objective.id} className="border rounded-xl p-6 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{objective.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Bloom Level: {objective.bloomLevel}</span>
                    <span>•</span>
                    <span>Priority: {objective.priority}</span>
                    {objective.requiresAssessment && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">Requires Assessment</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(objective)}
                    className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(objective.id)}
                    className="px-3 py-1 text-xs border rounded hover:bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

