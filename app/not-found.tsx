import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">This dashboard doesn&apos;t exist or has been deleted.</p>
      <Link href="/" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
        Go home
      </Link>
    </div>
  )
}
