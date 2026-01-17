'use client';

import GuidancePanel from '@/components/ui/GuidancePanel';
import MultiInput from '@/components/ui/MultiInput';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';

interface ProblemTabProps {
  data: NeedsAnalysisFormData;
  onChange: (updates: Partial<NeedsAnalysisFormData>) => void;
}

export default function ProblemTab({ data, onChange }: ProblemTabProps) {
  const handleConstraintAdd = (item: string) => {
    onChange({ constraints: [...data.constraints, item] });
  };

  const handleConstraintRemove = (index: number) => {
    onChange({ constraints: data.constraints.filter((_, i) => i !== index) });
  };

  const handleAssumptionAdd = (item: string) => {
    onChange({ assumptions: [...data.assumptions, item] });
  };

  const handleAssumptionRemove = (index: number) => {
    onChange({ assumptions: data.assumptions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Problem Definition Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Problem Definition</h3>
        <p className="text-sm text-gray-500 mb-4">Define the core problem to solve and business need</p>

        <GuidancePanel>
          What&apos;s going wrong? Ask stakeholders to describe the specific observable problem.
          Listen for: complaints, errors, missed targets, customer feedback. Push back on vague
          answers like &quot;they need training&quot; — ask &quot;What would you see differently if they had this training?&quot;
        </GuidancePanel>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.problemStatement}
              onChange={(e) => onChange({ problemStatement: e.target.value })}
              placeholder="Describe the specific observable problem that needs to be addressed..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Need
            </label>
            <GuidancePanel>
              Why does this matter to the business? Connect to revenue, cost, compliance, or
              strategic goals. If they can&apos;t articulate this, training may not be the solution.
            </GuidancePanel>
            <textarea
              value={data.businessNeed}
              onChange={(e) => onChange({ businessNeed: e.target.value })}
              placeholder="How does solving this problem impact the business?"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department / Division
            </label>
            <input
              type="text"
              value={data.department}
              onChange={(e) => onChange({ department: e.target.value })}
              placeholder="e.g., Sales, Customer Support, Operations"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reality Check Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reality Check</h3>

        <div className="space-y-6">
          <div>
            <GuidancePanel>
              What limits exist? Budget, timeline, technology access, union rules, geographic
              distribution. These shape what&apos;s possible in the solution.
            </GuidancePanel>
            <MultiInput
              label="Constraints"
              placeholder="Add a constraint and press Enter..."
              items={data.constraints}
              onAdd={handleConstraintAdd}
              onRemove={handleConstraintRemove}
            />
          </div>

          <div>
            <GuidancePanel>
              What do learners already know? What&apos;s NOT a training problem? Document these to
              avoid scope creep and set realistic expectations.
            </GuidancePanel>
            <MultiInput
              label="Assumptions"
              placeholder="Add an assumption and press Enter..."
              items={data.assumptions}
              onAdd={handleAssumptionAdd}
              onRemove={handleAssumptionRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
