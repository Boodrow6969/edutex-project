'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AssetUploadZone, { type ContentAssetResponse } from './AssetUploadZone';

interface WorkspaceAssetBrowserProps {
  workspaceId: string;
  onSelect?: (asset: ContentAssetResponse) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function WorkspaceAssetBrowser({
  workspaceId,
  onSelect,
}: WorkspaceAssetBrowserProps) {
  const [assets, setAssets] = useState<ContentAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchAssets = useCallback(
    async (searchTerm?: string, tag?: string | null) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (tag) params.set('tag', tag);

        const res = await fetch(
          `/api/workspaces/${workspaceId}/assets?${params.toString()}`
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load assets');
          return;
        }

        const data: ContentAssetResponse[] = await res.json();
        setAssets(data);
      } catch {
        setError('Network error loading assets');
      } finally {
        setLoading(false);
      }
    },
    [workspaceId]
  );

  // Initial load
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAssets(search, activeTag);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeTag, fetchAssets]);

  // Collect all unique tags from current results
  const allTags = Array.from(new Set(assets.flatMap((a) => a.tags)));

  const handleUploadComplete = (asset: ContentAssetResponse) => {
    setAssets((prev) => [asset, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = async (assetId: string) => {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/assets/${assetId}`,
        { method: 'DELETE' }
      );
      if (res.ok || res.status === 204) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
      }
    } catch {
      // Silently fail — user can retry
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload toggle */}
      <button
        onClick={() => setShowUpload((v) => !v)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium text-left"
      >
        {showUpload ? 'Hide upload' : '+ Upload new image'}
      </button>

      {showUpload && (
        <AssetUploadZone
          workspaceId={workspaceId}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by filename..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                activeTag === tag
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <p className="text-sm text-red-600 text-center py-4">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && assets.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          {search || activeTag ? 'No matching assets found.' : 'No assets uploaded yet.'}
        </p>
      )}

      {/* Thumbnail grid */}
      {!loading && !error && assets.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 ${
                onSelect ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
              }`}
              onClick={() => onSelect?.(asset)}
            >
              {/* Thumbnail */}
              <div className="aspect-square flex items-center justify-center overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.alt || asset.filename}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Info bar */}
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-gray-700 truncate">{asset.filename}</p>
                <p className="text-xs text-gray-400">{formatFileSize(asset.fileSizeBytes)}</p>
              </div>

              {/* Delete button (hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(asset.id);
                }}
                className="absolute top-1 right-1 p-1 rounded bg-white/80 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete asset"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
