'use client';

import { useState } from 'react';

/**
 * Floating AI Assistant button that appears on the right side of the screen.
 * Opens a chat/assistant panel when clicked.
 */
export default function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 ${
          isOpen
            ? 'bg-gray-700 text-white'
            : 'bg-[#03428e] hover:bg-[#022d61] text-white'
        }`}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
        <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-200 ${
          isHovered || isOpen ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
        }`}>
          {isOpen ? 'Close' : 'AI Help'}
        </span>
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-20 right-6 w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#03428e] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Powered by Claude</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Hi! I&apos;m your AI assistant. I can help you with:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Writing learning objectives
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Analyzing needs assessments
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Creating course content
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Reviewing instructional design
                    </li>
                  </ul>
                </div>

                {/* Quick actions */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      Generate learning objectives from my content
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      Review my needs analysis
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      Suggest assessment questions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent"
                />
                <button
                  type="button"
                  className="p-2 bg-[#03428e] hover:bg-[#022d61] text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
