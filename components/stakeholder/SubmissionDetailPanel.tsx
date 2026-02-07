'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { TRAINING_TYPE_LABELS, TrainingType } from '@/lib/types/stakeholderAnalysis';

// -- Types matching the API response --

interface QuestionResponse {
  questionId: string;
  section: string;
  questionText: string;
  fieldType: string;
  options: string[] | null;
  response: {
    id: string;
    value: string;
    updatedAt: string;
  } | null;
}

interface ChangeLogEntry {
  id: string;
  questionId: string;
  questionText: string;
  changedBy: string;
  previousValue: string | null;
  newValue: string;
  changedAt: string;
}

interface SubmissionDetail {
  id: string;
  trainingType: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  revisionNotes: string | null;
  stakeholderName: string | null;
  stakeholderEmail: string | null;
  questionResponses: QuestionResponse[];
  changeLog: ChangeLogEntry[];
}

// -- Status badge config --

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  SUBMITTED: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  UNDER_REVIEW: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  REVISION_REQUESTED: { label: 'Revision Requested', bg: 'bg-orange-100', text: 'text-orange-700' },
  DRAFT: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
};

// -- Props --

interface SubmissionDetailPanelProps {
  submissionId: string | null;
  onClose: () => void;
  onStatusChange: () => void;
}

// -- Helpers --

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function parseMultiSelect(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through — might be comma-separated
  }
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function groupBySection(items: QuestionResponse[]): { section: string; questions: QuestionResponse[] }[] {
  const map = new Map<string, QuestionResponse[]>();
  for (const item of items) {
    const list = map.get(item.section) ?? [];
    list.push(item);
    map.set(item.section, list);
  }
  return Array.from(map.entries()).map(([section, questions]) => ({ section, questions }));
}

// -- Response value renderer --

function ResponseValue({ qr }: { qr: QuestionResponse }) {
  if (!qr.response) {
    return <span className="text-gray-400 italic text-sm">No response</span>;
  }

  const value = qr.response.value;

  if (qr.fieldType === 'MULTI_SELECT') {
    const items = parseMultiSelect(value);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (qr.fieldType === 'SCALE') {
    return <span className="text-gray-900">{value} / 5</span>;
  }

  // SINGLE_SELECT, SHORT_TEXT, LONG_TEXT, DATE, DATE_WITH_TEXT, NUMBER
  return <span className="text-gray-900 whitespace-pre-wrap">{value}</span>;
}

// -- Component --

export default function SubmissionDetailPanel({
  submissionId,
  onClose,
  onStatusChange,
}: SubmissionDetailPanelProps) {
  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [approving, setApproving] = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [sendingRevision, setSendingRevision] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Change log accordion
  const [changeLogOpen, setChangeLogOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!submissionId) return;
    setIsLoading(true);
    setError(null);
    setData(null);
    setShowRevisionInput(false);
    setRevisionNotes('');
    setChangeLogOpen(false);

    try {
      const res = await fetch(`/api/stakeholder/submissions/${submissionId}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to load submission');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleApprove = async () => {
    if (!submissionId || approving) return;
    setApproving(true);
    try {
      const res = await fetch(
        `/api/stakeholder/submissions/${submissionId}/approve`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to approve');
      }
      setToast('Submission approved');
      onStatusChange();
      onClose();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!submissionId || sendingRevision || !revisionNotes.trim()) return;
    setSendingRevision(true);
    try {
      const res = await fetch(
        `/api/stakeholder/submissions/${submissionId}/request-revision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revisionNotes: revisionNotes.trim() }),
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to request revision');
      }
      setToast('Revision requested');
      onStatusChange();
      onClose();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to request revision');
    } finally {
      setSendingRevision(false);
    }
  };

  const isOpen = submissionId !== null;
  const canReview = data && (data.status === 'SUBMITTED' || data.status === 'UNDER_REVIEW');
  const sections = data ? groupBySection(data.questionResponses) : [];
  const status = data ? (statusConfig[data.status] ?? statusConfig.DRAFT) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 pr-12">
              <h2 className="text-lg font-semibold text-gray-900">
                {data.stakeholderName || 'Unknown Stakeholder'}
              </h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {status && (
                  <span
                    className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {TRAINING_TYPE_LABELS[data.trainingType as TrainingType] ??
                    data.trainingType}
                </span>
                {data.submittedAt && (
                  <span className="text-sm text-gray-400">
                    Submitted {formatDate(data.submittedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Revision notes banner */}
              {data.revisionNotes && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-orange-700 uppercase mb-1">
                    Revision Notes
                  </p>
                  <p className="text-sm text-orange-900 whitespace-pre-wrap">
                    {data.revisionNotes}
                  </p>
                </div>
              )}

              {/* Sections */}
              {sections.map(({ section, questions }) => (
                <div key={section}>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                    {section}
                  </h3>
                  <div className="space-y-4">
                    {questions.map((qr) => (
                      <div key={qr.questionId}>
                        <p className="text-sm text-gray-500 mb-1">
                          {qr.questionText}
                        </p>
                        <ResponseValue qr={qr} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Change Log */}
              {data.changeLog.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setChangeLogOpen(!changeLogOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>Change Log ({data.changeLog.length})</span>
                    {changeLogOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {changeLogOpen && (
                    <div className="border-t border-gray-200 px-4 py-3 space-y-3">
                      {data.changeLog.map((entry) => (
                        <div key={entry.id} className="text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium">
                              {entry.changedBy}
                            </span>
                            <span className="text-gray-400">&mdash;</span>
                            <span className="text-gray-400">
                              {formatDateTime(entry.changedAt)}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-0.5">
                            Updated &ldquo;{entry.questionText}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky action buttons */}
            {canReview && (
              <div className="border-t border-gray-200 px-6 py-4 bg-white space-y-3">
                {showRevisionInput ? (
                  <div className="space-y-3">
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Describe what needs to be revised..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      disabled={sendingRevision}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowRevisionInput(false);
                          setRevisionNotes('');
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        disabled={sendingRevision}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequestRevision}
                        disabled={!revisionNotes.trim() || sendingRevision}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingRevision ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        Send Revision Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRevisionInput(true)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </>
  );
}
