'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { TrainingType, TRAINING_TYPE_LABELS } from '@/lib/types/stakeholderAnalysis';

interface CreateTokenModalProps {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTokenModal({
  workspaceId,
  onClose,
  onCreated,
}: CreateTokenModalProps) {
  const [trainingType, setTrainingType] = useState<TrainingType>(
    TrainingType.PERFORMANCE_PROBLEM
  );
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/stakeholder/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          trainingType,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create token');
      }

      const data = await res.json();
      const url = `${window.location.origin}${data.formUrl}`;
      setGeneratedUrl(url);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Generate New Link
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generatedUrl ? (
          /* Success state — show the URL */
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Share this link with your stakeholder:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white rounded"
                style={{ backgroundColor: '#03428e' }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleCreate}>
            <div className="p-6 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="trainingType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Training Type
                </label>
                <select
                  id="trainingType"
                  value={trainingType}
                  onChange={(e) =>
                    setTrainingType(e.target.value as TrainingType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={creating}
                >
                  {Object.values(TrainingType).map((t) => (
                    <option key={t} value={t}>
                      {TRAINING_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiration Date{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={creating}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#03428e' }}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
