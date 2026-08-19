import { useState, type FormEvent } from 'react'

import { useCreateProject } from './useProjects'

export function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const createProject = useCreateProject()
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    try {
      await createProject.mutateAsync({
        title: trimmed,
        address: address.trim() || null,
      })
      onClose()
    } catch {
      // Surfaced below via createProject.error; the dialog stays open so the
      // typed input isn't lost.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-title"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 id="new-project-title" className="text-navy mb-4 text-lg font-bold">
          New project
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title" className="text-navy block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              required
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Kitchen remodel"
              className="border-navy/20 focus:border-navy mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label htmlFor="address" className="text-navy block text-sm font-medium">
              Job site address <span className="text-navy/40">(optional)</span>
            </label>
            <input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="border-navy/20 focus:border-navy mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          {createProject.error && (
            <p role="alert" className="text-brand-red text-sm">
              {createProject.error.message}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-navy/70 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createProject.isPending ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
