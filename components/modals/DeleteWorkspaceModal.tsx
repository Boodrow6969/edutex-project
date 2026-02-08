'use client';

import { useState, useEffect } from 'react';

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  onDeleted: () => void;
}

export default function DeleteWorkspaceModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  onDeleted,
}: DeleteWorkspaceModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ courseCount: number; curriculumCount: number; memberCount: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setError(null);
      // Fetch workspace details for counts
      fetch(`/api/workspaces/${workspaceId}`)
        .then((res) => res.json())
        .then((data) => {
          setCounts({
            courseCount: data.courseCount ?? 0,
            curriculumCount: data.curriculumCount ?? 0,
            memberCount: data.memberCount ?? 0,
          });
        })
        .catch(() => setCounts(null));
    }
  }, [isOpen, workspaceId]);

  const handleDelete = async () => {
    if (confirmName !== workspaceName || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete workspace');
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const nameMatches = confirmName === workspaceName;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Delete Workspace</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-700">
            This will permanently delete <strong>{workspaceName}</strong> and all its contents:
          </p>

          {counts && (
            <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
              <li>{counts.courseCount} course{counts.courseCount !== 1 ? 's' : ''} (with all pages, tasks, and objectives)</li>
              <li>{counts.curriculumCount} curricul{counts.curriculumCount !== 1 ? 'a' : 'um'}</li>
              <li>{counts.memberCount} member{counts.memberCount !== 1 ? 's' : ''}</li>
            </ul>
          )}

          <p className="text-sm text-gray-700">
            Type <strong>{workspaceName}</strong> to confirm:
          </p>

          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={workspaceName}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!nameMatches || isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Workspace'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
