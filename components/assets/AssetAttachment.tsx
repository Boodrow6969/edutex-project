'use client';

import { useState, useEffect } from 'react';
import SlideOver from '@/components/ui/SlideOver';
import WorkspaceAssetBrowser from './WorkspaceAssetBrowser';
import type { ContentAssetResponse } from './AssetUploadZone';

interface AssetAttachmentProps {
  workspaceId: string;
  assetId: string | null;
  onAttach: (assetId: string) => void;
  onRemove: () => void;
  label?: string;
}

export default function AssetAttachment({
  workspaceId,
  assetId,
  onAttach,
  onRemove,
  label = 'Reference Image',
}: AssetAttachmentProps) {
  const [browserOpen, setBrowserOpen] = useState(false);
  const [assetMeta, setAssetMeta] = useState<ContentAssetResponse | null>(null);

  // Fetch asset metadata when assetId changes
  useEffect(() => {
    if (!assetId || !workspaceId) {
      setAssetMeta(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/workspaces/${workspaceId}/assets/${assetId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setAssetMeta(data);
      })
      .catch(() => {
        if (!cancelled) setAssetMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [assetId, workspaceId]);

  const handleSelect = (asset: ContentAssetResponse) => {
    setAssetMeta(asset); // Optimistic — we already have the data from the browser
    onAttach(asset.id);
    setBrowserOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {assetId && assetMeta ? (
        /* Attached state: thumbnail + remove */
        <div className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetMeta.url}
              alt={assetMeta.alt || assetMeta.filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{assetMeta.filename}</p>
            <p className="text-xs text-gray-400">{assetMeta.mimeType}</p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setBrowserOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Change
            </button>
            <button
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : assetId && !assetMeta ? (
        /* Loading state: have ID but metadata not yet fetched */
        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading asset...
        </div>
      ) : (
        /* Empty state: attach button */
        <button
          onClick={() => setBrowserOpen(true)}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Attach image
        </button>
      )}

      <SlideOver
        isOpen={browserOpen}
        onClose={() => setBrowserOpen(false)}
        title="Select Image"
      >
        <WorkspaceAssetBrowser
          workspaceId={workspaceId}
          onSelect={handleSelect}
        />
      </SlideOver>
    </div>
  );
}
