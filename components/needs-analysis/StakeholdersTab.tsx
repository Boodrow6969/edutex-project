'use client';

import GuidancePanel from '@/components/ui/GuidancePanel';
import MultiInput from '@/components/ui/MultiInput';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';

interface StakeholdersTabProps {
  data: NeedsAnalysisFormData;
  onChange: (updates: Partial<NeedsAnalysisFormData>) => void;
}

export default function StakeholdersTab({ data, onChange }: StakeholdersTabProps) {
  const handlePersonaAdd = (item: string) => {
    onChange({ learnerPersonas: [...data.learnerPersonas, item] });
  };

  const handlePersonaRemove = (index: number) => {
    onChange({ learnerPersonas: data.learnerPersonas.filter((_, i) => i !== index) });
  };

  const handleStakeholderAdd = (item: string) => {
    onChange({ stakeholders: [...data.stakeholders, item] });
  };

  const handleStakeholderRemove = (index: number) => {
    onChange({ stakeholders: data.stakeholders.filter((_, i) => i !== index) });
  };

  const handleSmeAdd = (item: string) => {
    onChange({ smes: [...data.smes, item] });
  };

  const handleSmeRemove = (index: number) => {
    onChange({ smes: data.smes.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Learner Personas Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Learner Personas</h3>
        <p className="text-sm text-gray-500 mb-4">Identify who needs to learn and what they need to do differently</p>

        <GuidancePanel>
          Who needs to do what differently? Get specific: job titles, experience levels, current
          skill gaps. Ask &quot;If I shadowed this person for a day, what would I see them struggling with?&quot;
        </GuidancePanel>

        <MultiInput
          label="Target Learners"
          placeholder="Add a learner persona (e.g., 'New hire sales reps with < 6 months experience')..."
          items={data.learnerPersonas}
          onAdd={handlePersonaAdd}
          onRemove={handlePersonaRemove}
        />
      </div>

      {/* Stakeholders Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Project Stakeholders</h3>
        <p className="text-sm text-gray-500 mb-4">Identify decision-makers and people who will judge success</p>

        <GuidancePanel>
          Who has skin in the game? Identify decision-makers, budget holders, and people who
          will judge success. Their priorities shape evaluation criteria.
        </GuidancePanel>

        <MultiInput
          label="Stakeholders"
          placeholder="Add a stakeholder (e.g., 'VP of Sales - budget holder')..."
          items={data.stakeholders}
          onAdd={handleStakeholderAdd}
          onRemove={handleStakeholderRemove}
        />
      </div>

      {/* SMEs Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Subject Matter Experts</h3>
        <p className="text-sm text-gray-500 mb-4">Identify experts who can inform content development</p>

        <GuidancePanel>
          Who knows how to do this well? Find top performers, not just managers. The gap between
          what SMEs do and what average performers do reveals the real training content.
        </GuidancePanel>

        <MultiInput
          label="SMEs"
          placeholder="Add an SME (e.g., 'Sarah Chen - top performer, 10 years experience')..."
          items={data.smes}
          onAdd={handleSmeAdd}
          onRemove={handleSmeRemove}
        />
      </div>
    </div>
  );
}
