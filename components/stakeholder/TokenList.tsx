'use client';

import { useState } from 'react';
import { Copy, Check, Ban, Loader2 } from 'lucide-react';
import { TRAINING_TYPE_LABELS, TrainingType } from '@/lib/types/stakeholderAnalysis';

interface Token {
  id: string;
  token: string;
  trainingType: string;
  isActive: boolean;
  expiresAt: string | null;
  stakeholderName: string | null;
  stakeholderEmail: string | null;
  createdAt: string;
  submission: {
    id: string;
    status: string;
    submittedAt: string | null;
    responseCount: number;
  } | null;
}

interface TokenListProps {
  tokens: Token[];
  onDeactivated: () => void;
}

function getTokenStatus(token: Token): { label: string; bg: string; text: string } {
  if (!token.isActive) {
    return { label: 'Revoked', bg: 'bg-red-100', text: 'text-red-700' };
  }
  if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
    return { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-700' };
  }
  return { label: 'Active', bg: 'bg-green-100', text: 'text-green-700' };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TokenList({ tokens, onDeactivated }: TokenListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const handleCopy = async (token: Token) => {
    const url = `${window.location.origin}/stakeholder/form/${token.token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (token: Token) => {
    setDeactivatingId(token.id);
    try {
      const res = await fetch(`/api/stakeholder/tokens/${token.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (res.ok) {
        onDeactivated();
      }
    } finally {
      setDeactivatingId(null);
    }
  };

  if (tokens.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          No access links yet. Click &ldquo;Generate New Link&rdquo; to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Training Type
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Created
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Expires
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Stakeholder
            </th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tokens.map((token) => {
            const status = getTokenStatus(token);
            return (
              <tr key={token.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">
                  {TRAINING_TYPE_LABELS[token.trainingType as TrainingType] ??
                    token.trainingType}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(token.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {token.expiresAt ? formatDate(token.expiresAt) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {token.stakeholderName || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCopy(token)}
                      title="Copy link"
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                    >
                      {copiedId === token.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {token.isActive && (
                      <button
                        onClick={() => handleDeactivate(token)}
                        disabled={deactivatingId === token.id}
                        title="Deactivate"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        {deactivatingId === token.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
