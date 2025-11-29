'use client';

import Link from 'next/link';

/**
 * Deprecated test editor page.
 * Directs users to create real pages through projects.
 */
export default function TestEditorPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-yellow-800 mb-4">
          Test Editor Deprecated
        </h1>
        <p className="text-yellow-700 mb-4">
          The block editor now persists to the database. To use the editor:
        </p>
        <ol className="list-decimal list-inside text-yellow-700 space-y-2 mb-6">
          <li>Create or select a workspace from the sidebar</li>
          <li>Create or select a project</li>
          <li>Create a new page in the project</li>
          <li>Click on the page to open the editor</li>
        </ol>
        <Link
          href="/workspace"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Workspace
        </Link>
      </div>
    </div>
  );
}
