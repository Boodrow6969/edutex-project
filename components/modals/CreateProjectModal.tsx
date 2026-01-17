'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: (project: { id: string; name: string }) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateProjectModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [phase, setPhase] = useState('intake');
  const [priority, setPriority] = useState('medium');
  const [targetGoLive, setTargetGoLive] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setClientName('');
    setProjectType('');
    setPhase('intake');
    setPriority('medium');
    setTargetGoLive('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          description: description.trim() || null,
          clientName: clientName.trim() || null,
          projectType: projectType.trim() || null,
          phase,
          priority,
          targetGoLive: targetGoLive || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await response.json();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(project);
      }

      // Reset and close modal
      resetForm();
      onClose();

      // Navigate to the new project
      router.push(`/workspace/${workspaceId}/project/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Course</h2>
            <p className="text-sm text-gray-500">Create a new learning project</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                placeholder="Case Management rollout, Authorea study, etc."
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-description">
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e] resize-none"
                placeholder="Short description, scope, key deliverables."
              />
            </div>

            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-client">
                Client name
              </label>
              <input
                id="project-client"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                placeholder="Client or organization name"
              />
            </div>

            {/* Project Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-type">
                Project type
              </label>
              <input
                id="project-type"
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                placeholder="e.g., Course, Module, Job Aid"
              />
            </div>

            {/* Phase and Priority - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="project-phase">
                  Phase
                </label>
                <select
                  id="project-phase"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                >
                  <option value="intake">Intake</option>
                  <option value="design">Design</option>
                  <option value="build">Build</option>
                  <option value="pilot">Pilot</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="project-priority">
                  Priority
                </label>
                <select
                  id="project-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Target Go Live */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-golive">
                Target go-live date
              </label>
              <input
                id="project-golive"
                type="date"
                value={targetGoLive}
                onChange={(e) => setTargetGoLive(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
