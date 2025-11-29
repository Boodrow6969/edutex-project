export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">EduTex</h1>
      <p className="text-lg">
        App is running on Next, Prisma, and Postgres.
      </p>

      <div className="mt-6 grid gap-4 w-full max-w-2xl">
        <a
          href="/auth/sign-in"
          className="border rounded-xl p-4 hover:bg-gray-100 transition"
        >
          <h2 className="font-semibold">Sign in</h2>
          <p>Go to the authentication flow.</p>
        </a>

        <a
          href="/dashboard"
          className="border rounded-xl p-4 hover:bg-gray-100 transition"
        >
          <h2 className="font-semibold">Dashboard</h2>
          <p>Placeholder for the main EduTex workspace.</p>
        </a>
      </div>
    </main>
  );
}
