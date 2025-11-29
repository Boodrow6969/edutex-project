import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type BlueprintDetailPageProps = {
  params: Promise<{ id: string; blueprintId: string }>;
};

export default async function BlueprintDetailPage(props: BlueprintDetailPageProps) {
  const { id: projectId, blueprintId } = await props.params;

  // Fetch blueprint with all related data
  const blueprint = await prisma.learningBlueprint.findUnique({
    where: { id: blueprintId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      performanceNeeds: {
        orderBy: { createdAt: 'asc' },
      },
      objectives: {
        orderBy: { createdAt: 'asc' },
      },
      constraints: {
        orderBy: { createdAt: 'asc' },
      },
      activityInstances: {
        include: {
          objective: {
            select: {
              id: true,
              text: true,
            },
          },
          pattern: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { positionIndex: 'asc' },
      },
    },
  });

  if (!blueprint) {
    notFound();
  }

  // Verify blueprint belongs to project
  if (blueprint.projectId !== projectId) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="mb-2 space-x-4">
            <Link
              href={`/projects/${projectId}`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Project
            </Link>
            <Link
              href={`/projects/${projectId}/blueprints`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to blueprints
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{blueprint.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className="font-medium">{blueprint.status}</span>
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/blueprints/${blueprintId}/objectives`}
          className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
        >
          Manage Objectives
        </Link>
      </div>

      {/* Blueprint Details */}
      <section className="border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Blueprint Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Audience:</span>
            <p className="font-medium mt-1">{blueprint.audience}</p>
          </div>
          <div>
            <span className="text-gray-500">Delivery Mode:</span>
            <p className="font-medium mt-1">{blueprint.deliveryMode}</p>
          </div>
          <div>
            <span className="text-gray-500">Time Budget:</span>
            <p className="font-medium mt-1">{blueprint.timeBudgetMinutes} minutes</p>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium mt-1">{formatDate(blueprint.createdAt)}</p>
          </div>
        </div>
      </section>

      {/* Performance Needs */}
      {blueprint.performanceNeeds.length > 0 && (
        <section className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Performance Needs</h2>
          {blueprint.performanceNeeds.map((need) => (
            <div key={need.id} className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Problem Statement</h3>
                <p className="text-sm mt-1 whitespace-pre-wrap">{need.problemStatement}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Desired Behavior</h3>
                <p className="text-sm mt-1 whitespace-pre-wrap">{need.desiredBehavior}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Consequences</h3>
                <p className="text-sm mt-1 whitespace-pre-wrap">{need.consequences}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Objectives */}
      <section className="border rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Objectives ({blueprint.objectives.length})</h2>
          <Link
            href={`/projects/${projectId}/blueprints/${blueprintId}/objectives`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Manage →
          </Link>
        </div>
        {blueprint.objectives.length === 0 ? (
          <p className="text-sm text-gray-500">No objectives yet.</p>
        ) : (
          <div className="space-y-3">
            {blueprint.objectives.map((objective) => (
              <div key={objective.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm font-medium">{objective.text}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>Bloom Level: {objective.bloomLevel}</span>
                  <span>•</span>
                  <span>Priority: {objective.priority}</span>
                  {objective.requiresAssessment && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Requires Assessment</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Constraints */}
      {blueprint.constraints.length > 0 && (
        <section className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Constraints ({blueprint.constraints.length})</h2>
          <div className="space-y-3">
            {blueprint.constraints.map((constraint) => (
              <div key={constraint.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{constraint.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{constraint.description}</p>
                    {constraint.value && (
                      <p className="text-xs text-gray-500 mt-1">Value: {constraint.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity Instances */}
      {blueprint.activityInstances.length > 0 && (
        <section className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Activity Instances ({blueprint.activityInstances.length})
          </h2>
          <div className="space-y-3">
            {blueprint.activityInstances.map((instance) => (
              <div key={instance.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{instance.pattern.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{instance.pattern.description}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Objective: {instance.objective.text}
                    </p>
                    {instance.notes && (
                      <p className="text-xs text-gray-600 mt-1">Notes: {instance.notes}</p>
                    )}
                    {instance.learnerDeliverable && (
                      <p className="text-xs text-gray-600 mt-1">
                        Deliverable: {instance.learnerDeliverable}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Position: {instance.positionIndex}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {blueprint.activityInstances.length === 0 && (
        <section className="border rounded-xl p-6">
          <p className="text-sm text-gray-500 text-center">
            No activity instances yet. Add objectives and create activity instances to build out the
            blueprint.
          </p>
        </section>
      )}
    </main>
  );
}

