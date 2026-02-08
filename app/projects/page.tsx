import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createProject(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const courseType = String(formData.get("courseType") || "").trim();
  const phase = String(formData.get("phase") || "").trim() || "intake";
  const priority = String(formData.get("priority") || "").trim() || "medium";
  const targetGoLiveStr = String(formData.get("targetGoLive") || "").trim();

  if (!name) {
    throw new Error("Project name is required");
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
      courseType: courseType || null,
      phase,
      priority,
      targetGoLive,
    },
  });

  revalidatePath("/projects");
}

export default async function ProjectsPage() {
  const projects = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-sm text-gray-500">
          Simple project list and create form for EduTex.
        </p>
      </header>

      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Create new project</h2>
        <form action={createProject} className="space-y-3">
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
            <input
              id="courseType"
              name="courseType"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g., Course, Module, Job Aid"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phase">
              Phase
            </label>
            <select
              id="phase"
              name="phase"
              defaultValue="intake"
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
              defaultValue="medium"
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
            Save project
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Existing projects</h2>

        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">
            No projects yet. Create your first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="border rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <div>
                  <Link href={`/projects/${project.id}`}>
                    <div className="text-sm font-semibold">
                      {project.name}
                    </div>
                  </Link>
                  {project.clientName && (
                    <div className="text-xs text-gray-500">
                      Client: {project.clientName}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {project.courseType && <span>{project.courseType} · </span>}
                    Phase: {project.phase} · Priority: {project.priority}
                  </div>
                  {project.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {project.description}
                    </div>
                  )}
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {project.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

