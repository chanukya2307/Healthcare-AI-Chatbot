export default function AuthShell({ children }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_25%),linear-gradient(180deg,#08101d_0%,#030712_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
            Care Coordination
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            One place for patients, hospital teams, and AI-assisted support.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
            Sign in to manage appointments, track approvals, and keep healthcare
            communication flowing smoothly across your platform.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-slate-400">Access</p>
              <p className="mt-2 text-lg font-semibold text-white">Role-based</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-slate-400">UI</p>
              <p className="mt-2 text-lg font-semibold text-white">Mobile-first</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-slate-400">API</p>
              <p className="mt-2 text-lg font-semibold text-white">Axios ready</p>
            </div>
          </div>
        </section>
        <section className="w-full max-w-md">{children}</section>
      </div>
    </main>
  );
}
