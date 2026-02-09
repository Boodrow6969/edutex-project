'use client';

import { EditorContent } from '@tiptap/react';
import { useStoryboardEditor, useEditorWordCount } from '@/lib/hooks/useStoryboardEditor';
import { StoryboardExportButton } from '@/components/storyboard/ExportButton';
import CourseInfoHeader from '@/components/storyboard/CourseInfoHeader';
import StoryboardToolbar from '@/components/storyboard/StoryboardToolbar';

// =============================================================================
// Types
// =============================================================================

interface StoryboardEditorProps {
  pageId: string;
  courseId: string;
  workspaceId: string;
  readOnly?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export default function StoryboardEditor({
  pageId,
  courseId,
  workspaceId,
  readOnly = false,
}: StoryboardEditorProps) {
  const {
    editor,
    pageMetadata,
    storyboardData,
    courseName,
    isLoading,
    isSaving,
    error,
    lastSaved,
    saveStatus,
    save,
  } = useStoryboardEditor({
    pageId,
    readOnly,
    autosaveDelay: 2000,
  });

  const wordCount = useEditorWordCount(editor);        

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">      
          <div className="w-5 h-5 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading storyboard...</span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error && !editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Storyboard</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex flex-col h-full">
      {/* Course Information Header */}
      {storyboardData && !readOnly && (
        <div className="px-6 pt-4">
          <CourseInfoHeader
            storyboardId={storyboardData.id}
            courseName={courseName}
            initialData={{
              title: storyboardData.title,
              targetAudience: storyboardData.targetAudience,
              duration: storyboardData.duration,
              deliveryMethod: storyboardData.deliveryMethod,
            }}
          />
        </div>
      )}

      {/* Header */}
      <StoryboardHeader
        title={pageMetadata?.title || 'Untitled Storyboard'}
        pageId={pageId}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        isSaving={isSaving}
        wordCount={wordCount}
        onSave={save}
        readOnly={readOnly}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
          <EditorContent
            editor={editor}
            className="storyboard-editor"
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      {editor && !readOnly && (
        <StoryboardToolbar editor={editor} courseId={courseId} />
      )}

      {/* Editor Styles */}
      <style jsx global>{`
        .storyboard-editor .ProseMirror {
          min-height: 500px;
          outline: none;
        }

        .storyboard-editor .ProseMirror p {
          margin: 0.75em 0;
        }

        .storyboard-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em;
          color: #111827;
        }

        .storyboard-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em;
          color: #1f2937;
        }

        .storyboard-editor .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em;
          color: #374151;
        }

        .storyboard-editor .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.75em 0;
        }

        .storyboard-editor .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.75em 0;
        }

        .storyboard-editor .ProseMirror li {
          margin: 0.25em 0;
          display: list-item;
        }

        .storyboard-editor .ProseMirror li p {
          margin: 0;
        }

        /* Nested lists */
        .storyboard-editor .ProseMirror ul ul {        
          list-style-type: circle;
        }

        .storyboard-editor .ProseMirror ul ul ul {     
          list-style-type: square;
        }

        .storyboard-editor .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding: 0.75em 1em;
          margin: 1em 0;
          color: #4b5563;
          background-color: #f9fafb;
          border-radius: 0 0.375rem 0.375rem 0;
          font-style: italic;
        }

        .storyboard-editor .ProseMirror blockquote p { 
          margin: 0;
        }

        .storyboard-editor .ProseMirror blockquote[data-variant="info"] {
          border-left-color: #3b82f6;
          background-color: #eff6ff;
          padding: 0.75em 1em;
          border-radius: 0 0.375rem 0.375rem 0;        
        }

        .storyboard-editor .ProseMirror blockquote[data-variant="warning"] {
          border-left-color: #f59e0b;
          background-color: #fffbeb;
          padding: 0.75em 1em;
          border-radius: 0 0.375rem 0.375rem 0;        
        }

        .storyboard-editor .ProseMirror blockquote[data-variant="tip"] {
          border-left-color: #10b981;
          background-color: #ecfdf5;
          padding: 0.75em 1em;
          border-radius: 0 0.375rem 0.375rem 0;        
        }

        .storyboard-editor .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.875em;
          font-family: ui-monospace, monospace;        
        }

        .storyboard-editor .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }

        .storyboard-editor .ProseMirror pre code {     
          background: none;
          padding: 0;
          color: inherit;
        }

        .storyboard-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }

        /* Placeholder styles */
        .storyboard-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        .storyboard-editor .ProseMirror h1.is-empty::before,
        .storyboard-editor .ProseMirror h2.is-empty::before,
        .storyboard-editor .ProseMirror h3.is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Focus styles */
        .storyboard-editor .ProseMirror:focus {        
          outline: none;
        }

        /* Selection styles */
        .storyboard-editor .ProseMirror ::selection {  
          background-color: #dbeafe;
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Header Component
// =============================================================================

interface StoryboardHeaderProps {
  title: string;
  pageId: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';   
  lastSaved: Date | null;
  isSaving: boolean;
  wordCount: number;
  onSave: () => void;
  readOnly: boolean;
}

function StoryboardHeader({
  title,
  pageId,
  saveStatus,
  lastSaved,
  isSaving,
  wordCount,
  onSave,
  readOnly,
}: StoryboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title and badge */}
        <div className="flex items-center gap-3">      
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded">
            Storyboard
          </span>
        </div>

        {/* Right: Status and actions */}
        <div className="flex items-center gap-4">      
          {/* Word count */}
          <span className="text-sm text-gray-500">     
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>

          {/* Save status */}
          <SaveStatus
            status={saveStatus}
            lastSaved={lastSaved}
            isSaving={isSaving}
          />

          {/* Export button */}
          <StoryboardExportButton 
            pageId={pageId} 
            pageTitle={title} 
          />

          {/* Save button */}
          {!readOnly && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[#03428e] text-white text-sm font-medium rounded-lg hover:bg-[#02346f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}        
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <ToolbarHint />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Save Status Component
// =============================================================================

interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';       
  lastSaved: Date | null;
  isSaving: boolean;
}

function SaveStatus({ status, lastSaved, isSaving }: SaveStatusProps) {
  if (isSaving || status === 'saving') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />   
        <span>Saving...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Saved</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error saving</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <span className="text-sm text-gray-400">
        Last saved {formatTime(lastSaved)}
      </span>
    );
  }

  return null;
}

// =============================================================================
// Toolbar Hint Component
// =============================================================================

function ToolbarHint() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-400">
      <span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">#</kbd>
        {' '}for heading
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">-</kbd>
        {' '}for bullet list
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">1.</kbd>
        {' '}for numbered list
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">&gt;</kbd>
        {' '}for quote
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">```</kbd>
        {' '}for code
      </span>
    </div>
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return 'just now';
  }

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
