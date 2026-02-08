'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ProjectBlueprintNewPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Diagnosis: This component was posting to literal /api/courses/[id]/blueprints instead of using params.id
 *
 * Root cause: The params Promise wasn't being properly awaited, causing courseId to be null/undefined
 * when the fetch call executed, which resulted in an invalid URL.
 *
 * Fix: Properly await params Promise and add validation to ensure courseId is a valid string
 * before making API calls. Always use the resolved courseId value, never literal "[id]".
 */
export default function ProjectBlueprintNewPage({ params }: ProjectBlueprintNewPageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [screen, setScreen] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Screen 1: LearningBlueprint fields
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number>(0);

  // Screen 2: PerformanceNeed fields
  const [problemStatement, setProblemStatement] = useState('');
  const [desiredBehavior, setDesiredBehavior] = useState('');
  const [consequences, setConsequences] = useState('');

  // Resolve params Promise - CRITICAL: Must await params before using courseId in URLs
  // In Next.js App Router, params is a Promise for client components
  useEffect(() => {
    let isMounted = true;
    
    params
      .then((p) => {
        // Validate that we got a real ID, not a placeholder
        if (p.id && typeof p.id === 'string' && p.id.trim() !== '' && p.id !== '[id]') {
          if (isMounted) {
            setCourseId(p.id.trim());
          }
        } else {
          console.error('Invalid course ID from params:', p.id);
          if (isMounted) {
            setError('Invalid course ID');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to resolve params:', err);
        if (isMounted) {
          setError('Failed to load course information');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleScreen1Next = () => {
    // Validate Screen 1 fields
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!audience.trim()) {
      setError('Audience is required');
      return;
    }
    if (!deliveryMode.trim()) {
      setError('Delivery mode is required');
      return;
    }
    if (timeBudgetMinutes < 0) {
      setError('Time budget must be a non-negative number');
      return;
    }
    setError(null);
    setScreen(2);
  };

  const handleSubmit = async () => {
    // Validate Screen 2 fields
    if (!problemStatement.trim()) {
      setError('Problem statement is required');
      return;
    }
    if (!desiredBehavior.trim()) {
      setError('Desired behavior is required');
      return;
    }
    if (!consequences.trim()) {
      setError('Consequences is required');
      return;
    }

    // CRITICAL: Validate courseId before making API call
    // Must be a non-empty string and not a placeholder like "[id]"
    if (!courseId || typeof courseId !== 'string' || courseId.trim() === '' || courseId === '[id]') {
      setError('Course ID is missing or invalid. Please refresh the page.');
      console.error('Invalid courseId in handleSubmit:', courseId);
      return;
    }

    // Ensure courseId is trimmed and valid
    const validCourseId = courseId.trim();
    if (!validCourseId) {
      setError('Course ID is missing or invalid. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // IMPORTANT: Always use the resolved courseId value, never literal "[id]"
      // The URL must be: /api/courses/<actual-course-id>/blueprints
      const apiUrl = `/api/courses/${validCourseId}/blueprints`;

      // Temporary debug log to verify correct courseId
      console.log('[Blueprint Create] Using courseId:', validCourseId, 'API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          audience,
          deliveryMode,
          timeBudgetMinutes,
          problemStatement,
          desiredBehavior,
          consequences,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create blueprint');
      }

      const data = await response.json();
      // Redirect to blueprint detail page - use validated courseId
      router.push(`/courses/${validCourseId}/blueprints/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (!courseId) {
    return <div>Loading...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Create Learning Blueprint</h1>

      {/* Progress indicator */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${screen >= 1 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${screen >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Blueprint Details</span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className={`flex items-center ${screen >= 2 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${screen >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Performance Need</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Screen 1: LearningBlueprint */}
      {screen === 1 && (
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Blueprint Details</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Enter blueprint title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="audience">
              Audience *
            </label>
            <input
              id="audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Describe the target audience"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="deliveryMode">
              Delivery Mode *
            </label>
            <input
              id="deliveryMode"
              type="text"
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g., Online, In-person, Blended"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="timeBudgetMinutes">
              Time Budget (minutes) *
            </label>
            <input
              id="timeBudgetMinutes"
              type="number"
              min="0"
              value={timeBudgetMinutes}
              onChange={(e) => setTimeBudgetMinutes(parseInt(e.target.value) || 0)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="0"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleScreen1Next}
              className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: PerformanceNeed */}
      {screen === 2 && (
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Performance Need</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="problemStatement">
              Problem Statement *
            </label>
            <textarea
              id="problemStatement"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              placeholder="Describe the performance problem or gap"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="desiredBehavior">
              Desired Behavior *
            </label>
            <textarea
              id="desiredBehavior"
              value={desiredBehavior}
              onChange={(e) => setDesiredBehavior(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              placeholder="Describe what learners should be able to do"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="consequences">
              Consequences *
            </label>
            <textarea
              id="consequences"
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              placeholder="Describe the consequences of not addressing this need"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setScreen(1)}
              className="px-4 py-2 border rounded text-sm font-semibold hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Blueprint'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

