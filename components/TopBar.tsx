'use client';

interface TopBarProps {
  projectName?: string;
  pageName?: string;
}

export default function TopBar({ projectName, pageName }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm">
        {projectName && (
          <>
            <span className="text-gray-600">{projectName}</span>
            {pageName && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">{pageName}</span>
              </>
            )}
          </>
        )}
        {!projectName && !pageName && (
          <span className="text-gray-900 font-medium">Workspace</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
