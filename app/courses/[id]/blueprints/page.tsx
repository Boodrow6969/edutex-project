import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserOrThrow, assertCourseAccess } from '@/lib/auth-helpers';

// Force dynamic rendering to avoid static analysis issues with Prisma
export const dynamic = 'force-dynamic';

type BlueprintListPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlueprintListPage(props: BlueprintListPageProps) {
  const { id: courseId } = await props.params;

  // Auth check
  const user = await getCurrentUserOrThrow();
  await assertCourseAccess(courseId, user.id);

  // Fetch course info
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      clientName: true,
      phase: true,
    },
  });

  if (!course) {
    notFound();
  }

  // Fetch all blueprints for this course
  const blueprints = await prisma.learningBlueprint.findMany({
    where: { courseId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      audience: true,
      deliveryMode: true,
      status: true,
      createdAt: true,
    },
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/courses/${courseId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Course
        </Link>
        <h1 className="text-3xl font-bold">{course.name}</h1>
        {course.clientName && (
          <p className="text-sm text-gray-500 mt-1">Client: {course.clientName}</p>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Learning blueprints</h2>
          {blueprints.length > 0 && (
            <Link
              href={`/courses/${courseId}/blueprints/new`}
              className="px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
            >
              New blueprint
            </Link>
          )}
        </div>

        {blueprints.length === 0 ? (
          <div className="border rounded-xl p-8 text-center space-y-4">
            <p className="text-sm text-gray-500">
              No blueprints yet. Create your first blueprint to get started.
            </p>
            <Link
              href={`/courses/${courseId}/blueprints/new`}
              className="inline-block px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
            >
              Create first blueprint
            </Link>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Audience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Delivery Mode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blueprints.map((blueprint) => (
                  <tr
                    key={blueprint.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/courses/${courseId}/blueprints/${blueprint.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {blueprint.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{blueprint.audience}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{blueprint.deliveryMode}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        {blueprint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(blueprint.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

