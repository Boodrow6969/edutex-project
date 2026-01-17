'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional description/subtitle below the title */
  description?: string;
  /** Optional status badge (e.g., "Draft", "Published") */
  badge?: string;
  /** Badge variant for styling */
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Action buttons to display on the right */
  actions?: ReactNode;
  /** Optional back button handler */
  onBack?: () => void;
  /** Additional className for the container */
  className?: string;
}

const badgeStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

/**
 * Reusable page header component matching Figma design.
 * Provides consistent header styling across all pages.
 */
export default function PageHeader({
  title,
  description,
  badge,
  badgeVariant = 'default',
  actions,
  onBack,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Title and description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900 truncate">{title}</h1>
              {badge && (
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeStyles[badgeVariant]}`}>
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>

          {/* Right side: Actions */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Primary action button for page headers
 */
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-[#03428e] hover:bg-[#022d61] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

/**
 * Secondary action button for page headers
 */
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:hover:bg-transparent flex items-center gap-2 transition-colors text-sm"
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * Icon button for page headers (e.g., settings, more options)
 */
export function IconButton({
  onClick,
  disabled = false,
  icon,
  label,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent transition-colors"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
