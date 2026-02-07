export const metadata = {
  title: 'Stakeholder Needs Analysis - EduTex',
};

export default function StakeholderFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Minimal header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
            EduTex
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Muted footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-400 text-center">
            Powered by EduTex &middot; Instructional Design Workspace
          </p>
        </div>
      </footer>
    </div>
  );
}
