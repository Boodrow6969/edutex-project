'use client';

import GuidancePanel from '@/components/ui/GuidancePanel';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';

interface SuccessMetricsTabProps {
  data: NeedsAnalysisFormData;
  onChange: (updates: Partial<NeedsAnalysisFormData>) => void;
}

export default function SuccessMetricsTab({ data, onChange }: SuccessMetricsTabProps) {
  return (
    <div className="space-y-6">
      {/* Kirkpatrick Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Kirkpatrick&apos;s Four Levels</h3>
        <p className="text-sm text-gray-500">
          Define how you&apos;ll measure training effectiveness at each level of evaluation
        </p>
      </div>

      {/* Level 1: Reaction */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-blue-100 text-[#03428e] text-xs font-bold px-2 py-1 rounded">
            Level 1
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Reaction</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">How will you measure learner satisfaction?</p>

        <GuidancePanel>
          Did they like it? Satisfaction surveys, NPS scores. Easy to measure but doesn&apos;t
          predict behavior change.
        </GuidancePanel>

        <textarea
          value={data.level1Reaction}
          onChange={(e) => onChange({ level1Reaction: e.target.value })}
          placeholder="e.g., Post-training survey with 5-point satisfaction scale, NPS score, qualitative feedback..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>

      {/* Level 2: Learning */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
            Level 2
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Learning</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">How will you verify knowledge/skill acquisition?</p>

        <GuidancePanel>
          Did they learn it? Knowledge checks, skill demonstrations, certifications. Measures
          if training worked, not if it transfers.
        </GuidancePanel>

        <textarea
          value={data.level2Learning}
          onChange={(e) => onChange({ level2Learning: e.target.value })}
          placeholder="e.g., Pre/post knowledge assessment, skill demonstration checklist, certification exam with 80% pass threshold..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>

      {/* Level 3: Behavior */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">
            Level 3
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Behavior</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">How will you verify on-the-job application?</p>

        <GuidancePanel>
          Are they doing it? Manager observations, quality audits, system data. This is where
          training proves its value — usually measured 30-90 days post-training.
        </GuidancePanel>

        <textarea
          value={data.level3Behavior}
          onChange={(e) => onChange({ level3Behavior: e.target.value })}
          placeholder="e.g., Manager observation checklist at 30/60/90 days, system usage analytics, quality audit scores..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>

      {/* Level 4: Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">
            Level 4
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Results</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">What business outcomes will you track?</p>

        <GuidancePanel>
          Did business improve? The KPIs stakeholders care about: sales, errors, time, satisfaction.
          Hardest to attribute directly to training but most important to leadership.
        </GuidancePanel>

        <textarea
          value={data.level4Results}
          onChange={(e) => onChange({ level4Results: e.target.value })}
          placeholder="e.g., 15% reduction in customer complaints, 20% decrease in error rate, 10% improvement in time-to-resolution..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>
    </div>
  );
}
