import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] px-8 py-16 text-center">
      <div className="mb-3 text-3xl">⊞</div>
      <h3 className="mb-1.5 text-sm font-semibold text-[#f9fafb]">No dashboards yet</h3>
      <p className="mb-6 max-w-xs text-xs text-[#6b7280]">
        Build your first dashboard or let AI generate one from a prompt.
      </p>
      <Link
        href="/builder"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
      >
        Create your first dashboard →
      </Link>
    </div>
  )
}
