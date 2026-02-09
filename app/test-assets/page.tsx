'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceAssetBrowser, AssetAttachment } from '@/components/assets';

/**
 * Manual test page for content asset components.
 * Usage: /test-assets?workspaceId={id}
 * Remove before merge to main.
 */
function TestAssetsContent() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') ?? '';
  const [attachedId, setAttachedId] = useState<string | null>(null);

  if (!workspaceId) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-red-600">Missing workspaceId</h1>
        <p className="mt-2 text-gray-600">
          Navigate to <code>/test-assets?workspaceId=YOUR_WORKSPACE_ID</code>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold">Asset Components Test</h1>
      <p className="text-gray-500 text-sm">Workspace: {workspaceId}</p>

      {/* AssetAttachment demo */}
      <section>
        <h2 className="text-lg font-semibold mb-3">AssetAttachment</h2>
        <AssetAttachment
          workspaceId={workspaceId}
          assetId={attachedId}
          onAttach={setAttachedId}
          onRemove={() => setAttachedId(null)}
        />
        {attachedId && (
          <p className="mt-3 p-3 bg-gray-50 rounded text-xs">
            Attached asset ID: {attachedId}
          </p>
        )}
      </section>

      {/* Standalone browser demo */}
      <section>
        <h2 className="text-lg font-semibold mb-3">WorkspaceAssetBrowser (standalone)</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <WorkspaceAssetBrowser
            workspaceId={workspaceId}
            onSelect={(asset) => alert(`Selected: ${asset.filename}`)}
          />
        </div>
      </section>
    </div>
  );
}

export default function TestAssetsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <TestAssetsContent />
    </Suspense>
  );
}
