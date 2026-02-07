'use client';

function Pulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />
  );
}

export function FormSkeleton() {
  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <Pulse className="h-8 w-48" />
          <Pulse className="h-5 w-64" />
          <Pulse className="h-4 w-full max-w-lg" />
          <Pulse className="h-4 w-full max-w-md" />
        </div>

        {/* Section divider */}
        <Pulse className="h-6 w-40 mb-6" />

        {/* Question skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-6 bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-full max-w-sm" />
            {i % 2 === 0 ? (
              <Pulse className="h-10 w-full" />
            ) : (
              <Pulse className="h-24 w-full" />
            )}
          </div>
        ))}

        {/* Another section */}
        <Pulse className="h-6 w-48 mb-6 mt-8" />

        {[6, 7, 8].map((i) => (
          <div key={i} className="mb-6 bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <Pulse className="h-4 w-2/3" />
            <Pulse className="h-3 w-full max-w-xs" />
            <Pulse className="h-10 w-full" />
          </div>
        ))}

        {/* Submit button skeleton */}
        <div className="mt-8">
          <Pulse className="h-12 w-full sm:w-48" />
        </div>
      </div>
    </div>
  );
}
