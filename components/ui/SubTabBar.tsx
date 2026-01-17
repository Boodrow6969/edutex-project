'use client';

interface Tab {
  id: string;
  label: string;
}

interface SubTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SubTabBar({ tabs, activeTab, onTabChange }: SubTabBarProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-1 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors relative
                ${isActive
                  ? 'text-[#03428e]'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03428e]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
