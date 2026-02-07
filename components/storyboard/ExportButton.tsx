'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ExportButtonProps {
  pageId: string;
  pageTitle?: string;
  className?: string;
}

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export function StoryboardExportButton({
  pageId,
  pageTitle,
  className = '',
}: ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (includeEmpty: boolean = false) => {
    setStatus('loading');
    setErrorMessage('');
    setShowDropdown(false);

    try {
      const params = new URLSearchParams({
        format: 'docx',
        includeEmpty: includeEmpty.toString(),
      });

      const response = await fetch(`/api/pages/${pageId}/export?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${pageTitle || 'storyboard'}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus('success');
      
      // Reset to idle after showing success
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      
      // Reset to idle after showing error
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Exporting...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Downloaded!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Failed</span>
          </>
        );
      default:
        return (
          <>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </>
        );
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => status === 'idle' && setShowDropdown(!showDropdown)}
        disabled={status === 'loading'}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
          transition-colors duration-150
          ${status === 'loading' 
            ? 'bg-gray-100 text-gray-500 cursor-wait' 
            : status === 'success'
            ? 'bg-green-50 text-green-700'
            : status === 'error'
            ? 'bg-red-50 text-red-700'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        {getButtonContent()}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && status === 'idle' && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              <button
                onClick={() => handleExport(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">Export to Word</div>
                  <div className="text-xs text-gray-500">Completed fields only</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">Export with All Fields</div>
                  <div className="text-xs text-gray-500">Include empty placeholders</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Error tooltip */}
      {status === 'error' && errorMessage && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600 z-20">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Simple export button without dropdown - just exports with default settings
 */
export function SimpleExportButton({
  pageId,
  pageTitle,
  className = '',
}: ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');

  const handleExport = async () => {
    setStatus('loading');

    try {
      const response = await fetch(`/api/pages/${pageId}/export?format=docx`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${pageTitle || 'storyboard'}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
        transition-colors duration-150
        ${status === 'loading' 
          ? 'bg-gray-100 text-gray-500 cursor-wait' 
          : status === 'success'
          ? 'bg-green-50 text-green-700'
          : status === 'error'
          ? 'bg-red-50 text-red-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        ${className}
      `}
      title="Export to Word"
    >
      {status === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : status === 'error' ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {status === 'loading' ? 'Exporting...' : 
         status === 'success' ? 'Done!' :
         status === 'error' ? 'Failed' : 'Export'}
      </span>
    </button>
  );
}
