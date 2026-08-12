import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="bg-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-navy text-2xl font-bold">Page not found</h1>
        <Link to="/" className="text-brand-red mt-4 inline-block text-sm font-semibold">
          Back to home
        </Link>
      </div>
    </div>
  )
}
