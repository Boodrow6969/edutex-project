'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CurriculumStatus } from '@prisma/client';

interface CreateCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: (curriculum: { id: string; name: string }) => void;
}

export default function CreateCurriculumModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateCurriculumModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(CurriculumStatus.DRAFT as string);
  const [programDuration, setProgramDuration] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [certificationName, setCertificationName] = useState('');
  const [audienceProgression, setAudienceProgression] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(CurriculumStatus.DRAFT);
    setProgramDuration('');
    setTotalHours('');
    setCertificationName('');
    setAudienceProgression('');
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
      const response = await fetch('/api/curricula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          description: description.trim() || null,
          status,
          programDuration: programDuration.trim() || null,
          totalHours: totalHours ? Number(totalHours) : null,
          certificationName: certificationName.trim() || null,
          audienceProgression: audienceProgression.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create curriculum');
      }

      const curriculum = await response.json();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(curriculum);
      }

      // Reset and close modal
      resetForm();
      onClose();

      // Navigate to the new curriculum
      router.push(`/workspace/${workspaceId}/curriculum/${curriculum.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create curriculum');
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
            <h2 className="text-lg font-semibold text-gray-900">New Curriculum</h2>
            <p className="text-sm text-gray-500">Create a learning program with multiple courses</p>
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
              <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="curriculum-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                placeholder="e.g., Software Engineer Onboarding Program"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-description">
                Description
              </label>
              <textarea
                id="curriculum-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e] resize-none"
                placeholder="Describe the program goals, target audience, and key outcomes."
              />
            </div>

            {/* Status and Program Duration - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-status">
                  Status
                </label>
                <select
                  id="curriculum-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                >
                  <option value={CurriculumStatus.DRAFT}>Draft</option>
                  <option value={CurriculumStatus.IN_PROGRESS}>In Progress</option>
                  <option value={CurriculumStatus.PUBLISHED}>Published</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-duration">
                  Program Duration
                </label>
                <input
                  id="curriculum-duration"
                  type="text"
                  value={programDuration}
                  onChange={(e) => setProgramDuration(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                  placeholder="e.g., 12 weeks"
                />
              </div>
            </div>

            {/* Total Hours and Certification - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-hours">
                  Total Hours
                </label>
                <input
                  id="curriculum-hours"
                  type="number"
                  min="0"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                  placeholder="e.g., 40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-cert">
                  Certification Name
                </label>
                <input
                  id="curriculum-cert"
                  type="text"
                  value={certificationName}
                  onChange={(e) => setCertificationName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e]"
                  placeholder="e.g., Certified Developer"
                />
              </div>
            </div>

            {/* Audience Progression */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="curriculum-progression">
                Audience Progression
              </label>
              <textarea
                id="curriculum-progression"
                value={audienceProgression}
                onChange={(e) => setAudienceProgression(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e]/20 focus:border-[#03428e] resize-none"
                placeholder="e.g., Beginner → Intermediate → Advanced"
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
                'Create Curriculum'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
