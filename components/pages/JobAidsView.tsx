'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AssetAttachment from '@/components/assets/AssetAttachment';

interface JobAid {
  id: string;
  courseId: string;
  title: string;
  type: string;
  status: string;
  description: string | null;
  notes: string | null;
  linkedObjectiveId: string | null;
  linkedTaskId: string | null;
  assetIds: string[];
  rationale: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ObjectiveOption {
  id: string;
  verb: string | null;
  freeformText: string | null;
  audience: string | null;
  bloomLevel: string;
}

interface TaskOption {
  id: string;
  taskName: string;
}

const TYPE_OPTIONS = [
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'REFERENCE_CARD', label: 'Reference Card' },
  { value: 'STEP_GUIDE', label: 'Step Guide' },
  { value: 'DECISION_TREE', label: 'Decision Tree' },
  { value: 'OTHER', label: 'Other' },
] as const;

const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  CHECKLIST: { bg: 'bg-blue-100', text: 'text-blue-700' },
  REFERENCE_CARD: { bg: 'bg-green-100', text: 'text-green-700' },
  STEP_GUIDE: { bg: 'bg-amber-100', text: 'text-amber-700' },
  DECISION_TREE: { bg: 'bg-purple-100', text: 'text-purple-700' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'APPROVED', label: 'Approved' },
] as const;

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  REVIEW: { bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
};

function typeLabel(type: string) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;
}

function objectiveLabel(obj: ObjectiveOption): string {
  const parts: string[] = [];
  if (obj.verb) parts.push(obj.verb);
  if (obj.freeformText) parts.push(obj.freeformText);
  const text = parts.join(' ').trim();
  if (text) return text.slice(0, 80);
  if (obj.audience) return `(${obj.bloomLevel}) ${obj.audience}`.slice(0, 80);
  return `Objective (${obj.bloomLevel})`;
}

interface JobAidsViewProps {
  workspaceId: string;
  courseId: string;
}

export default function JobAidsView({ workspaceId, courseId }: JobAidsViewProps) {
  const [jobAids, setJobAids] = useState<JobAid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [objectives, setObjectives] = useState<ObjectiveOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);

  // Autosave debounce ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch job aids
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/courses/${courseId}/job-aids`);
        if (!res.ok) throw new Error('Failed to load job aids');
        const data = await res.json();
        setJobAids(data.jobAids || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job aids');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId]);

  // Fetch objectives and tasks for linking dropdowns
  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}/objectives`).then(r => r.json()),
      fetch(`/api/courses/${courseId}/task-analyses`).then(r => r.json()),
    ]).then(([objs, tsks]) => {
      setObjectives(objs as ObjectiveOption[]);
      setTasks(tsks as TaskOption[]);
    }).catch(() => {
      // silent — linking is optional
    });
  }, [courseId]);

  const selected = jobAids.find((j) => j.id === selectedId) ?? null;

  // Autosave a single field update
  const autosave = useCallback(
    (id: string, updates: Partial<JobAid>) => {
      // Optimistic local update
      setJobAids((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
      );

      // Clear previous timer
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}/job-aids/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!res.ok) throw new Error('Save failed');
          const updated = await res.json();
          setJobAids((prev) =>
            prev.map((j) => (j.id === id ? updated : j))
          );
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('idle');
        }
      }, 1500);
    },
    [courseId]
  );

  // Create new job aid
  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/job-aids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Job Aid' }),
      });
      if (!res.ok) throw new Error('Failed to create job aid');
      const created = await res.json();
      setJobAids((prev) => [...prev, created]);
      setSelectedId(created.id);
    } catch {
      // silent
    }
  };

  // Delete job aid
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/job-aids/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setJobAids((prev) => prev.filter((j) => j.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading Job Aids...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Job Aids</h1>
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600">Saved</span>
          )}
        </div>
        <button
          onClick={handleCreate}
          className="text-sm px-4 py-2 rounded-lg text-white font-medium bg-[#03428e] hover:bg-[#022d61] transition-colors"
        >
          New Job Aid
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* List panel */}
        <div
          className={`overflow-y-auto border-r border-gray-200 bg-gray-50 transition-all ${
            selected ? 'w-64 flex-shrink-0' : 'w-full'
          }`}
        >
          {jobAids.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">
                No job aids yet. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {jobAids.map((ja) => {
                const typeBadge = TYPE_BADGE_COLORS[ja.type] || TYPE_BADGE_COLORS.OTHER;
                const statusBadge = STATUS_BADGE_COLORS[ja.status] || STATUS_BADGE_COLORS.DRAFT;
                return (
                  <div
                    key={ja.id}
                    onClick={() => setSelectedId(ja.id)}
                    className={`bg-white border rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:border-blue-300 ${
                      selectedId === ja.id
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {ja.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {ja.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge.bg} ${typeBadge.text}`}
                      >
                        {typeLabel(ja.type)}
                      </span>
                    </div>
                    {ja.description && (
                      <p className="mt-1.5 text-xs text-gray-500 truncate">
                        {ja.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 overflow-y-auto bg-white p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header: title + close */}
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  value={selected.title}
                  onChange={(e) =>
                    autosave(selected.id, { title: e.target.value })
                  }
                  className="flex-1 text-xl font-semibold text-gray-900 border-0 border-b-2 border-transparent focus:border-[#03428e] outline-none bg-transparent px-0 py-1"
                  placeholder="Job Aid Title"
                />
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Type toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_OPTIONS.map((opt) => {
                    const isActive = selected.type === opt.value;
                    const colors = TYPE_BADGE_COLORS[opt.value];
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          autosave(selected.id, { type: opt.value })
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          isActive
                            ? `${colors.bg} ${colors.text} border-gray-300 font-medium`
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = selected.status === opt.value;
                    const colors = STATUS_BADGE_COLORS[opt.value];
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          autosave(selected.id, { status: opt.value })
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          isActive
                            ? `${colors.bg} ${colors.text} border-gray-300 font-medium`
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Linked Objective
                  </label>
                  <select
                    value={selected.linkedObjectiveId ?? ''}
                    onChange={(e) =>
                      autosave(selected.id, { linkedObjectiveId: e.target.value || null })
                    }
                    className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">&mdash; None &mdash;</option>
                    {objectives.length === 0 ? (
                      <option disabled>No objectives yet</option>
                    ) : (
                      objectives.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {objectiveLabel(obj)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Linked Task
                  </label>
                  <select
                    value={selected.linkedTaskId ?? ''}
                    onChange={(e) =>
                      autosave(selected.id, { linkedTaskId: e.target.value || null })
                    }
                    className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">&mdash; None &mdash;</option>
                    {tasks.length === 0 ? (
                      <option disabled>No tasks yet</option>
                    ) : (
                      tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.taskName || 'Unnamed Task'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={selected.description || ''}
                  onChange={(e) =>
                    autosave(selected.id, { description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="What is this job aid for?"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={selected.notes || ''}
                  onChange={(e) =>
                    autosave(selected.id, { notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="Design notes, context, or instructions for the developer"
                />
              </div>

              {/* Attached Assets */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Attached Assets
                </label>
                <div className="space-y-3">
                  {selected.assetIds.map((assetId, index) => (
                    <AssetAttachment
                      key={`${selected.id}-asset-${index}`}
                      workspaceId={workspaceId}
                      assetId={assetId || null}
                      label={`Asset ${index + 1}`}
                      onAttach={(newAssetId) => {
                        const updated = [...selected.assetIds];
                        updated[index] = newAssetId;
                        autosave(selected.id, { assetIds: updated });
                      }}
                      onRemove={() => {
                        const updated = selected.assetIds.filter((_, i) => i !== index);
                        autosave(selected.id, { assetIds: updated });
                      }}
                    />
                  ))}
                  {selected.assetIds.length < 5 && (
                    <button
                      onClick={() => {
                        const updated = [...selected.assetIds, ''];
                        autosave(selected.id, { assetIds: updated });
                      }}
                      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      + Add Asset
                    </button>
                  )}
                </div>
              </div>

              {/* Delete */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="text-sm px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Delete Job Aid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
