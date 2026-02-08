import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function updateCourse(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const phase = String(formData.get("phase") || "").trim();
  const priority = String(formData.get("priority") || "").trim();

  if (!id) {
    throw new Error("Course ID is required");
  }

  await prisma.course.update({
    where: { id },
    data: {
      status,
      phase,
      priority,
    },
  });

  revalidatePath(`/courses/${id}`);
}

export default async function CourseDetailPage(
  props: CourseDetailPageProps
) {
  const { id } = await props.params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-bold">{course.name}</h1>
      <p className="text-sm text-gray-500">
        Status: {course.status} (Phase: {course.phase}, Priority: {course.priority})
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Pipeline Information</h2>
        <div className="text-sm space-y-1">
          {course.clientName && (
            <p className="text-gray-600">Client: {course.clientName}</p>
          )}
          {course.courseType && (
            <p className="text-gray-600">Type: {course.courseType}</p>
          )}
          {course.targetGoLive && (
            <p className="text-gray-600">
              Target go live: {formatDate(course.targetGoLive)}
            </p>
          )}
        </div>
      </section>

      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold">Learning blueprints</h2>
        <Link
          href={`/courses/${id}/blueprints`}
          className="inline-block px-4 py-2 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
        >
          View blueprints
        </Link>
      </section>

      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold">Update Status</h2>
        <form action={updateCourse} className="space-y-3">
          <input type="hidden" name="id" value={course.id} />

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={course.status || "draft"}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phase">
              Phase
            </label>
            <select
              id="phase"
              name="phase"
              defaultValue={course.phase || "intake"}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="intake">Intake</option>
              <option value="design">Design</option>
              <option value="build">Build</option>
              <option value="pilot">Pilot</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={course.priority || "medium"}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button
            type="submit"
            className="text-sm font-semibold px-4 py-2 rounded bg-black text-white"
          >
            Save updates
          </button>
        </form>
      </section>

      {course.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-sm whitespace-pre-wrap">
            {course.description}
          </p>
        </section>
      )}

      <section className="pt-4 border-t mt-4">
        <p className="text-xs text-gray-400">
          Created at {course.createdAt.toISOString()}
        </p>
      </section>
    </main>
  );
}
