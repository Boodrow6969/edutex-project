'use client';

import { useState, useEffect } from 'react';

interface DeletePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageName: string;
  onDeleted: () => void;
}

export default function DeletePageModal({
  isOpen,
  onClose,
  pageId,
  pageName,
  onDeleted,
}: DeletePageModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockCount, setBlockCount] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetch(`/api/pages/${pageId}`)
        .then((res) => res.json())
        .then((data) => {
          setBlockCount(data.blocks?.length ?? 0);
        })
        .catch(() => setBlockCount(null));
    }
  }, [isOpen, pageId]);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete page');
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Delete Page</h2>
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
            Are you sure you want to permanently delete <strong>{pageName}</strong>?
          </p>

          {blockCount !== null && blockCount > 0 && (
            <p className="text-sm text-gray-600">
              This will delete {blockCount} content block{blockCount !== 1 ? 's' : ''}.
            </p>
          )}

          <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
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
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Page'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
