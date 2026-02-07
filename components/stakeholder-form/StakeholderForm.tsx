'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AttributionModal } from './AttributionModal';
import { QuestionField } from './QuestionField';
import { FormSkeleton } from './FormSkeleton';

interface Question {
  id: string;
  section: string;
  questionText: string;
  stakeholderGuidance: string;
  fieldType: string;
  required: boolean;
  options?: string[];
  displayOrder: number;
  conditional?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'includes';
    value: string;
  };
}

interface FormData {
  workspaceName: string;
  trainingType: string;
  trainingTypeLabel: string;
  submission: {
    id: string;
    status: string;
    revisionNotes: string | null;
  } | null;
  stakeholderName: string | null;
  stakeholderEmail: string | null;
  questions: Question[];
  responses: Record<string, string>;
}

interface StakeholderFormProps {
  token: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function StakeholderForm({ token }: StakeholderFormProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [stakeholderName, setStakeholderName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    new Set()
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [missingQuestions, setMissingQuestions] = useState<
    { questionId: string; questionText: string; section: string }[]
  >([]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestResponsesRef = useRef<Record<string, string>>({});

  // Fetch form data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stakeholder/form/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load form');
          return;
        }
        const data: FormData = await res.json();
        setFormData(data);
        setResponses(data.responses);
        latestResponsesRef.current = data.responses;
        setStakeholderName(data.stakeholderName);

        if (!data.stakeholderName) {
          setShowModal(true);
        }
      } catch {
        setError('Failed to load form. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // Focus first field after modal closes
  useEffect(() => {
    if (!showModal && formData && stakeholderName) {
      // Small delay for DOM to settle
      const t = setTimeout(() => {
        const firstInput = firstFieldRef.current?.querySelector<HTMLElement>(
          'input, textarea, button[type="button"]'
        );
        firstInput?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showModal, formData, stakeholderName]);

  // Auto-save: uses ref to always read latest name/responses without stale closures
  const stakeholderNameRef = useRef(stakeholderName);
  stakeholderNameRef.current = stakeholderName;

  const saveResponses = useCallback(
    async (current: Record<string, string>) => {
      const name = stakeholderNameRef.current;
      if (!name) return;

      setSaveStatus('saving');
      setSaveError(null);
      try {
        const entries = Object.entries(current).map(([questionId, value]) => ({
          questionId,
          value,
        }));
        const res = await fetch(`/api/stakeholder/form/${token}/responses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: entries,
            changedBy: name,
          }),
        });
        if (res.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          const data = await res.json().catch(() => null);
          setSaveError(data?.error || 'Save failed');
          setSaveStatus('error');
        }
      } catch {
        setSaveError('Network error — check your connection');
        setSaveStatus('error');
      }
    },
    [token]
  );

  const handleChange = useCallback(
    (questionId: string, value: string) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
      latestResponsesRef.current = { ...latestResponsesRef.current, [questionId]: value };

      // Clear validation error for this field
      setValidationErrors((errs) => {
        if (!errs.has(questionId)) return errs;
        const copy = new Set(errs);
        copy.delete(questionId);
        return copy;
      });

      // Debounced save — scheduled outside the state updater
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(
        () => saveResponses(latestResponsesRef.current),
        1500
      );
    },
    [saveResponses]
  );

  const handleModalConfirm = async (name: string, email: string) => {
    setModalSubmitting(true);
    try {
      const res = await fetch(`/api/stakeholder/form/${token}/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email || undefined }),
      });
      if (res.ok) {
        setStakeholderName(name);
        setShowModal(false);
      }
    } catch {
      // keep modal open
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setMissingQuestions([]);
    setValidationErrors(new Set());

    // Save any pending changes first
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      await saveResponses(latestResponsesRef.current);
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/stakeholder/form/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'MISSING_REQUIRED_RESPONSES') {
          setMissingQuestions(data.missingQuestions);
          setValidationErrors(
            new Set(data.missingQuestions.map((q: { questionId: string }) => q.questionId))
          );
          setSubmitError(
            `Please complete ${data.missingQuestions.length} required field${data.missingQuestions.length > 1 ? 's' : ''} before submitting.`
          );
          // Scroll to first error
          const firstErrorId = data.missingQuestions[0]?.questionId;
          if (firstErrorId) {
            document
              .getElementById(`question-${firstErrorId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          setSubmitError(data.error || 'Failed to submit form');
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError('Failed to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if a conditional question should be visible
  const isVisible = (question: Question): boolean => {
    if (!question.conditional) return true;
    const parentValue = responses[question.conditional.questionId] || '';
    switch (question.conditional.operator) {
      case 'equals':
        return parentValue === question.conditional.value;
      case 'not_equals':
        return parentValue !== question.conditional.value;
      case 'includes':
        return parentValue.includes(question.conditional.value);
      default:
        return true;
    }
  };

  if (loading) return <FormSkeleton />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load form
          </h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  if (submitted || formData.submission?.status === 'SUBMITTED' || formData.submission?.status === 'APPROVED') {
    const isApproved = formData.submission?.status === 'APPROVED';
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isApproved ? 'Responses approved' : 'Form submitted successfully'}
          </h2>
          <p className="text-sm text-gray-600">
            {isApproved
              ? 'Your responses have been reviewed and approved. Thank you for your contribution!'
              : 'Thank you for your responses. The instructional design team will review them shortly.'}
          </p>
        </div>
      </div>
    );
  }

  // Group questions by section
  const visibleQuestions = formData.questions.filter(isVisible);
  const sections: { name: string; questions: Question[] }[] = [];
  for (const q of visibleQuestions) {
    const last = sections[sections.length - 1];
    if (last && last.name === q.section) {
      last.questions.push(q);
    } else {
      sections.push({ name: q.section, questions: [q] });
    }
  }

  const isRevision = formData.submission?.status === 'REVISION_REQUESTED';

  return (
    <div>
      {showModal && (
        <AttributionModal
          onConfirm={handleModalConfirm}
          isSubmitting={modalSubmitting}
          initialName={formData.stakeholderName ?? ''}
          initialEmail={formData.stakeholderEmail ?? ''}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Form header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formData.workspaceName}
          </h1>
          <p className="mt-1 text-base sm:text-lg text-[#03428e] font-medium">
            {formData.trainingTypeLabel}
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
            This form helps the instructional design team understand your
            training needs. Your responses will be used to shape the analysis
            and design of the training program.
          </p>

          {stakeholderName && (
            <p className="mt-3 text-sm text-gray-500">
              Responding as <span className="font-medium text-gray-700">{stakeholderName}</span>
            </p>
          )}
        </header>

        {/* Revision banner */}
        {isRevision && formData.submission?.revisionNotes && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  Revision requested
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  {formData.submission.revisionNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save indicator */}
        <div className="mb-6 flex items-center justify-end h-5">
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-500">
              {saveError || 'Save failed'}
            </span>
          )}
        </div>

        {/* Sections and questions */}
        <div ref={firstFieldRef}>
          {sections.map((section, si) => (
            <div key={section.name} className={si > 0 ? 'mt-10' : ''}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {section.name}
              </h2>

              <div className="space-y-5">
                {section.questions.map((q) => (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5"
                  >
                    <QuestionField
                      question={q}
                      value={responses[q.id] || ''}
                      onChange={handleChange}
                      validationError={validationErrors.has(q.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit area */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{submitError}</p>
              {missingQuestions.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {missingQuestions.map((mq) => (
                    <li key={mq.questionId} className="text-xs text-red-600">
                      <button
                        type="button"
                        className="underline hover:no-underline text-left"
                        onClick={() =>
                          document
                            .getElementById(`question-${mq.questionId}`)
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            })
                        }
                      >
                        {mq.section}: {mq.questionText}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-[#03428e] text-white font-medium text-sm rounded-lg hover:bg-[#022d61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : isRevision ? 'Resubmit responses' : 'Submit responses'}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Your responses are auto-saved as you type. Submitting sends them to the
            instructional design team for review.
          </p>
        </div>
      </div>
    </div>
  );
}
