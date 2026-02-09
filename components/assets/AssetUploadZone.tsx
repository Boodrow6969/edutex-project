'use client';

import { useState, useRef, useCallback } from 'react';

/** Response shape returned by the upload API */
export interface ContentAssetResponse {
  id: string;
  workspaceId: string;
  uploadedById: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  alt: string | null;
  tags: string[];
  sourceContext: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: { id: string; name: string | null };
}

const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.svg';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface AssetUploadZoneProps {
  workspaceId: string;
  onUploadComplete: (asset: ContentAssetResponse) => void;
  onError?: (message: string) => void;
}

export default function AssetUploadZone({
  workspaceId,
  onUploadComplete,
  onError,
}: AssetUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = useCallback(
    (msg: string) => {
      setError(msg);
      onError?.(msg);
    },
    [onError]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        showError(`"${file.name}" is not an allowed image type.`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        showError(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/workspaces/${workspaceId}/assets`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          showError(data.error || 'Upload failed');
          return;
        }

        const asset: ContentAssetResponse = await res.json();
        onUploadComplete(asset);
      } catch {
        showError('Network error during upload');
      } finally {
        setIsUploading(false);
      }
    },
    [workspaceId, onUploadComplete, showError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset so the same file can be re-selected
      e.target.value = '';
    },
    [uploadFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
            <span className="text-sm font-medium">Drop an image here or click to browse</span>
            <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP, SVG — max {MAX_SIZE_MB} MB</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
