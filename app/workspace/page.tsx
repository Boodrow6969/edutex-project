export default function WorkspacePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to EduTex
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your instructional design workspace is ready. Get started by creating
          a workspace and project.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Workspace
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Start a new workspace for a client or program. Organize all your
              training projects in one place.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Get Started →
            </button>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browse Templates
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Use pre-configured templates for needs analysis, course design,
              and more to speed up your workflow.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Templates →
            </button>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Start Guide
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Create a workspace for your organization or client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Add a project for each training initiative</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                Use pages for analysis and design (needs analysis, objectives,
                etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                Track tasks and deliverables in databases with multiple views
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
