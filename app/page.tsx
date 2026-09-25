import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            SafeScroll
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            A safer scroll starts with a smarter filter.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            SafeScroll helps parents understand potentially harmful online
            content and make informed decisions about what their children
            should watch.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Login
            </Link>
          </div>

          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900">
                AI Safety Analysis
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Analyze submitted content for potentially harmful categories.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900">
                Parent Controls
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Create child profiles and configure safety policies.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900">
                Review Decisions
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Review AI recommendations and make the final decision.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}