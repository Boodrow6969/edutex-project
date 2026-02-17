'use client';

import GuidancePanel from '@/components/ui/GuidancePanel';
import MultiInput from '@/components/ui/MultiInput';
import { CourseAnalysisFormData, WorkspaceContact } from '@/lib/types/courseAnalysis';

interface StakeholdersTabProps {
  data: CourseAnalysisFormData;
  onChange: (updates: Partial<CourseAnalysisFormData>) => void;
  workspaceContacts?: WorkspaceContact[];
}

export default function StakeholdersTab({ data, onChange, workspaceContacts = [] }: StakeholdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Workspace Contacts (read-only) */}
      {workspaceContacts.length > 0 && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Workspace Contacts</h3>
          <p className="text-xs text-gray-500 mb-3">From workspace settings (read-only)</p>
          <div className="grid gap-2">
            {workspaceContacts.map((contact, i) => (
              <div key={i} className="bg-white rounded p-3 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{contact.role}</span>
                </div>
                <span className="text-xs text-gray-500">{contact.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          onAdd={(item) => onChange({ smes: [...data.smes, item] })}
          onRemove={(index) => onChange({ smes: data.smes.filter((_, i) => i !== index) })}
        />
      </div>
    </div>
  );
}
