import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { CourseStatus, CoursePhase, CourseType, Priority } from "@prisma/client";

async function createCourse(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const courseType = String(formData.get("courseType") || "").trim();
  const phase = String(formData.get("phase") || "").trim() || CoursePhase.INTAKE;
  const priority = String(formData.get("priority") || "").trim() || Priority.MEDIUM;
  const targetGoLiveStr = String(formData.get("targetGoLive") || "").trim();

  if (!name) {
    throw new Error("Course name is required");
  }

  let targetGoLive: Date | null = null;
  if (targetGoLiveStr) {
    const parsedDate = new Date(targetGoLiveStr);
    if (!isNaN(parsedDate.getTime())) {
      targetGoLive = parsedDate;
    }
  }

  await prisma.course.create({
    data: {
      name,
      description: description || null,
      clientName: clientName || null,
      courseType: (courseType || null) as CourseType | null,
      phase: phase as CoursePhase,
      priority: priority as Priority,
      targetGoLive,
    },
  });

  revalidatePath("/courses");
}

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-sm text-gray-500">
          Simple course list and create form for EduTex.
        </p>
      </header>

      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Create new course</h2>
        <form action={createCourse} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Case Management rollout, Authorea study, etc."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Short description, scope, key deliverables."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="clientName">
              Client name
            </label>
            <input
              id="clientName"
              name="clientName"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Client or organization name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="courseType">
              Course type
            </label>
            <select
              id="courseType"
              name="courseType"
              defaultValue=""
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Select type (optional)</option>
              <option value={CourseType.PERFORMANCE_PROBLEM}>Performance Problem</option>
              <option value={CourseType.NEW_SYSTEM}>New System</option>
              <option value={CourseType.COMPLIANCE}>Compliance</option>
              <option value={CourseType.ROLE_CHANGE}>Role Change</option>
              <option value={CourseType.ONBOARDING}>Onboarding</option>
              <option value={CourseType.PROFESSIONAL_DEVELOPMENT}>Professional Development</option>
              <option value={CourseType.OTHER}>Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phase">
              Phase
            </label>
            <select
              id="phase"
              name="phase"
              defaultValue={CoursePhase.INTAKE}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value={CoursePhase.INTAKE}>Intake</option>
              <option value={CoursePhase.ANALYSIS}>Analysis</option>
              <option value={CoursePhase.DESIGN}>Design</option>
              <option value={CoursePhase.DEVELOPMENT}>Development</option>
              <option value={CoursePhase.IMPLEMENTATION}>Implementation</option>
              <option value={CoursePhase.EVALUATION}>Evaluation</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={Priority.MEDIUM}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value={Priority.LOW}>Low</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.URGENT}>Urgent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="targetGoLive">
              Target go live
            </label>
            <input
              id="targetGoLive"
              name="targetGoLive"
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="text-sm font-semibold px-4 py-2 rounded bg-black text-white"
          >
            Save course
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Existing courses</h2>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No courses yet. Create your first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="border rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <div>
                  <Link href={`/courses/${course.id}`}>
                    <div className="text-sm font-semibold">
                      {course.name}
                    </div>
                  </Link>
                  {course.clientName && (
                    <div className="text-xs text-gray-500">
                      Client: {course.clientName}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {course.courseType && <span>{course.courseType} · </span>}
                    Phase: {course.phase} · Priority: {course.priority}
                  </div>
                  {course.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {course.description}
                    </div>
                  )}
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {course.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
