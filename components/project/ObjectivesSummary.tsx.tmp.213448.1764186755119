'use client';

import { BloomLevel } from '@prisma/client';

interface ObjectiveStats {
  total: number;
  byBloomLevel: Record<BloomLevel, number>;
  recentObjectives: Array<{
    id: string;
    title: string;
    bloomLevel: BloomLevel;
    createdAt: string;
  }>;
}

interface ObjectivesSummaryProps {
  stats: ObjectiveStats;
}

const BLOOM_LEVEL_ORDER: BloomLevel[] = [
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
  'CREATE',
];

const BLOOM_COLORS: Record<BloomLevel, string> = {
  REMEMBER: 'bg-slate-200',
  UNDERSTAND: 'bg-blue-200',
  APPLY: 'bg-green-200',
  ANALYZE: 'bg-yellow-200',
  EVALUATE: 'bg-orange-200',
  CREATE: 'bg-purple-200',
};

const BLOOM_TEXT_COLORS: Record<BloomLevel, string> = {
  REMEMBER: 'text-slate-700',
  UNDERSTAND: 'text-blue-700',
  APPLY: 'text-green-700',
  ANALYZE: 'text-yellow-700',
  EVALUATE: 'text-orange-700',
  CREATE: 'text-purple-700',
};

const BLOOM_BADGE_COLORS: Record<BloomLevel, string> = {
  REMEMBER: 'bg-slate-100 text-slate-700 border-slate-300',
  UNDERSTAND: 'bg-blue-100 text-blue-700 border-blue-300',
  APPLY: 'bg-green-100 text-green-700 border-green-300',
  ANALYZE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  EVALUATE: 'bg-orange-100 text-orange-700 border-orange-300',
  CREATE: 'bg-purple-100 text-purple-700 border-purple-300',
};

/**
 * Displays a summary of learning objectives with Bloom level breakdown.
 */
export default function ObjectivesSummary({ stats }: ObjectivesSummaryProps) {
  const hasObjectives = stats.total > 0;

  // Calculate the max count for scaling the bars
  const maxCount = Math.max(...Object.values(stats.byBloomLevel), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Learning Objectives</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stats.total} objective{stats.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-5">
        {!hasObjectives ? (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No objectives defined yet</p>
            <p className="text-xs mt-1">Create a Learning Objectives page to get started</p>
          </div>
        ) : (
          <>
            {/* Bloom Level Breakdown */}
            <div className="space-y-2 mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                By Bloom&apos;s Taxonomy
              </h3>
              {BLOOM_LEVEL_ORDER.map((level) => {
                const count = stats.byBloomLevel[level];
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className={`text-xs w-20 ${BLOOM_TEXT_COLORS[level]}`}>
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${BLOOM_COLORS[level]} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Recent Objectives */}
            {stats.recentObjectives.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Recent Objectives
                </h3>
                <div className="space-y-2">
                  {stats.recentObjectives.map((obj) => (
                    <div
                      key={obj.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span
                        className={`px-1.5 py-0.5 text-xs font-medium rounded border flex-shrink-0 ${BLOOM_BADGE_COLORS[obj.bloomLevel]}`}
                      >
                        {obj.bloomLevel.slice(0, 3)}
                      </span>
                      <span className="text-gray-700 line-clamp-1">{obj.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
