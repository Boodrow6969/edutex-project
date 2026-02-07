'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AttributionModalProps {
  onConfirm: (name: string, email: string) => void;
  isSubmitting: boolean;
  initialName?: string;
  initialEmail?: string;
}

export function AttributionModal({
  onConfirm,
  isSubmitting,
  initialName = '',
  initialEmail = '',
}: AttributionModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleConfirm = useCallback(() => {
    if (name.trim() && !isSubmitting) {
      onConfirm(name.trim(), email.trim());
    }
  }, [name, email, isSubmitting, onConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
      // Escape does NOT close — this modal is required
    },
    [handleConfirm]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attribution-title"
        onKeyDown={handleKeyDown}
      >
        <h2
          id="attribution-title"
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          Before you begin
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please identify yourself so the instructional design team knows who
          provided these responses.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="stakeholder-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="stakeholder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="stakeholder-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="stakeholder-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@company.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!name.trim() || isSubmitting}
          className="mt-6 w-full bg-[#03428e] text-white font-medium text-sm py-2.5 rounded-lg hover:bg-[#022d61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Continue to form'}
        </button>
      </div>
    </div>
  );
}
