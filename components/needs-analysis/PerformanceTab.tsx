'use client';

import GuidancePanel from '@/components/ui/GuidancePanel';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';

interface PerformanceTabProps {
  data: NeedsAnalysisFormData;
  onChange: (updates: Partial<NeedsAnalysisFormData>) => void;
}

export default function PerformanceTab({ data, onChange }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Current State Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Current State</h3>
        <p className="text-sm text-gray-500 mb-4">Describe what performers are doing now</p>

        <GuidancePanel>
          What are people doing now? Be specific and observable. Not &quot;they don&apos;t understand the
          system&quot; but &quot;they take 15 minutes to process a case that should take 5.&quot;
        </GuidancePanel>

        <textarea
          value={data.currentState}
          onChange={(e) => onChange({ currentState: e.target.value })}
          placeholder="Describe current observable behaviors and performance levels..."
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>

      {/* Desired State Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Desired State</h3>
        <p className="text-sm text-gray-500 mb-4">Describe what &quot;good&quot; looks like after training</p>

        <GuidancePanel>
          What would &quot;good&quot; look like? Describe the observable behavior after training. This
          becomes the basis for learning objectives and evaluation.
        </GuidancePanel>

        <textarea
          value={data.desiredState}
          onChange={(e) => onChange({ desiredState: e.target.value })}
          placeholder="Describe the target behaviors and performance levels you want to achieve..."
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
        />
      </div>

      {/* Performance Gap Visual */}
      <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Performance Gap</h3>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="text-sm font-medium text-red-700 mb-1">Current</div>
            <div className="text-xs text-gray-500">
              {data.currentState ? 'Defined' : 'Not defined'}
            </div>
          </div>
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm font-medium text-green-700 mb-1">Desired</div>
            <div className="text-xs text-gray-500">
              {data.desiredState ? 'Defined' : 'Not defined'}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          The gap between current and desired state defines what training must address.
        </p>
      </div>
    </div>
  );
}
