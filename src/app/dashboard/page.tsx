import { logout } from '#/features/auth/actions'

export default function DashboardPage() {
  return (
    <main className="bg-bg text-text min-h-screen px-6 pt-20 pb-24 sm:px-10">
      <div className="mx-auto flex max-w-[760px] items-center justify-between gap-6">
        <h1 className="house-section">Dashboard</h1>
        <form action={logout}>
          <button
            type="submit"
            className="border-border text-text-muted hover:text-text rounded-md border px-3 py-1.5 font-mono text-xs transition-colors"
          >
            sign out
          </button>
        </form>
      </div>
    </main>
  )
}
