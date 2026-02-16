'use client';

import { useState } from 'react';
import {
  LearningTaskData,
  GAP_TYPE_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '@/lib/types/taskAnalysis';

interface FindingsSummaryProps {
  tasks: LearningTaskData[];
}

export default function FindingsSummary({ tasks }: FindingsSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const lines = ['Task Analysis Findings \u2014 Non-Training Items', ''];

    tasks.forEach((task, index) => {
      lines.push(`${index + 1}. ${task.title}`);
      lines.push(`   Gap: ${task.gapType ? GAP_TYPE_LABELS[task.gapType] : 'Not classified'}`);
      lines.push(`   Recommendation: ${task.intervention ? INTERVENTION_TYPE_LABELS[task.intervention] : 'Not set'}`);
      lines.push(`   Impact: ${task.impactNote || 'Not documented'}`);
      lines.push('');
    });

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = lines.join('\n');
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (tasks.length === 0) return null;

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Findings Summary
        </>
      )}
    </button>
  );
}
