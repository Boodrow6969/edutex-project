'use client';

import { useState } from 'react';

const bloomLevelColors: Record<string, string> = {
  REMEMBER: 'bg-gray-100 text-gray-700',
  UNDERSTAND: 'bg-blue-100 text-blue-700',
  APPLY: 'bg-green-100 text-green-700',
  ANALYZE: 'bg-yellow-100 text-yellow-700',
  EVALUATE: 'bg-orange-100 text-orange-700',
  CREATE: 'bg-purple-100 text-purple-700',
};

export default function ObjectivesGuidance() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-900">Writing Effective Learning Objectives</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 text-sm">
          {/* ABCD Format */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Use the ABCD Format</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded">
                <span className="font-medium text-blue-700">A</span>
                <span className="text-gray-600">udience</span>
                <p className="text-xs text-gray-500 mt-1">Who is the learner?</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <span className="font-medium text-green-700">B</span>
                <span className="text-gray-600">ehavior</span>
                <p className="text-xs text-gray-500 mt-1">What will they do? (action verb)</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <span className="font-medium text-yellow-700">C</span>
                <span className="text-gray-600">ondition</span>
                <p className="text-xs text-gray-500 mt-1">Under what circumstances?</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <span className="font-medium text-purple-700">D</span>
                <span className="text-gray-600">egree</span>
                <p className="text-xs text-gray-500 mt-1">How well? (criterion)</p>
              </div>
            </div>
          </div>

          {/* Bloom's Taxonomy */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Bloom&apos;s Taxonomy Levels</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 pr-2 font-medium text-gray-700">Level</th>
                    <th className="text-left py-1 pr-2 font-medium text-gray-700">Use when learners need to...</th>
                    <th className="text-left py-1 font-medium text-gray-700">Example verbs</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.REMEMBER}`}>Remember</span></td>
                    <td className="py-1 pr-2">Recall facts</td>
                    <td className="py-1">List, define, identify</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.UNDERSTAND}`}>Understand</span></td>
                    <td className="py-1 pr-2">Explain concepts</td>
                    <td className="py-1">Describe, summarize, explain</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.APPLY}`}>Apply</span></td>
                    <td className="py-1 pr-2">Use in situations</td>
                    <td className="py-1">Demonstrate, execute, implement</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.ANALYZE}`}>Analyze</span></td>
                    <td className="py-1 pr-2">Break down, compare</td>
                    <td className="py-1">Compare, contrast, examine</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.EVALUATE}`}>Evaluate</span></td>
                    <td className="py-1 pr-2">Make judgments</td>
                    <td className="py-1">Justify, critique, assess</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2"><span className={`px-1.5 py-0.5 rounded text-xs ${bloomLevelColors.CREATE}`}>Create</span></td>
                    <td className="py-1 pr-2">Produce new work</td>
                    <td className="py-1">Design, develop, construct</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
