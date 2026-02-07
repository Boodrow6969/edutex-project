'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CreateTokenModal from '@/components/stakeholder/CreateTokenModal';
import TokenList from '@/components/stakeholder/TokenList';
import SubmissionsList from '@/components/stakeholder/SubmissionsList';
import SubmissionDetailPanel from '@/components/stakeholder/SubmissionDetailPanel';

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

interface Submission {
  id: string;
  trainingType: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  stakeholderName: string | null;
  createdAt: string;
}

export default function StakeholderManagementPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [wsRes, tokenRes, subRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}`),
        fetch(`/api/stakeholder/tokens?workspaceId=${workspaceId}`),
        fetch(`/api/stakeholder/submissions?workspaceId=${workspaceId}`),
      ]);

      if (wsRes.ok) {
        const ws = await wsRes.json();
        setWorkspaceName(ws.name);
      }
      if (tokenRes.ok) {
        setTokens(await tokenRes.json());
      }
      if (subRes.ok) {
        setSubmissions(await subRes.json());
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">
            Workspaces
          </Link>
          <span>/</span>
          <Link
            href={`/workspace/${workspaceId}`}
            className="hover:text-blue-600"
          >
            {workspaceName || 'Workspace'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Needs Analysis</span>
        </nav>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Needs Analysis
        </h1>

        {/* Section A: Token Management */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Access Links
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#03428e' }}
            >
              <Plus className="w-4 h-4" />
              Generate New Link
            </button>
          </div>
          <TokenList tokens={tokens} onDeactivated={fetchData} />
        </section>

        {/* Section B: Submissions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Submissions
          </h2>
          <SubmissionsList
            submissions={submissions}
            onSelect={(id) => setSelectedSubmissionId(id)}
          />
        </section>
      </div>

      {/* Create Token Modal */}
      {showCreateModal && (
        <CreateTokenModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}

      {/* Submission Detail Panel */}
      <SubmissionDetailPanel
        submissionId={selectedSubmissionId}
        onClose={() => setSelectedSubmissionId(null)}
        onStatusChange={fetchData}
      />
    </div>
  );
}
