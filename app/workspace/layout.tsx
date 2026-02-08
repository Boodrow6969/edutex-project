import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AIAssistantButton from '@/components/ui/AIAssistantButton';
import { ToastProvider } from '@/components/Toast';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <TopBar />

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

        {/* Floating AI Assistant Button */}
        <AIAssistantButton />
      </div>
    </ToastProvider>
  );
}
