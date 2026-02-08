'use client';

import { useState, useRef, useEffect } from 'react';

interface TopBarProps {
  courseName?: string;
  pageName?: string;
  pageType?: string;
}

const roles = [
  { id: 'designer', label: 'Instructional Designer' },
  { id: 'manager', label: 'Manager' },
  { id: 'stakeholder', label: 'Stakeholder/SME' },
];

export default function TopBar({ courseName, pageName, pageType }: TopBarProps) {
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get page type badge color
  const getPageTypeBadgeColor = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'NEEDS_ANALYSIS':
        return 'bg-blue-100 text-blue-700';
      case 'BLUEPRINT':
        return 'bg-purple-100 text-purple-700';
      case 'STORYBOARD':
        return 'bg-green-100 text-green-700';
      case 'ASSESSMENT':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format page type for display
  const formatPageType = (type?: string) => {
    if (!type) return null;
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left side: Hamburger (mobile) + Role Dropdown */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button - only visible on small screens */}
        <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Role Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">{selectedRole.label}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-1">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedRole.id === role.id
                        ? 'bg-[#03428e] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumbs - visible on larger screens */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-gray-400">/</span>
          {courseName && (
            <>
              <span className="text-gray-500">{courseName}</span>
              {pageName && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{pageName}</span>
                </>
              )}
            </>
          )}
          {!courseName && !pageName && (
            <span className="text-gray-500">Workspace</span>
          )}
          {pageType && (
            <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${getPageTypeBadgeColor(pageType)}`}>
              {formatPageType(pageType)}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Dark Mode Toggle (optional - currently just a placeholder) */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-[#03428e] rounded-full flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
