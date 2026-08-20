import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useRepositories } from '../../data/repositoryContext'
import { useCreateInvoice, useCreateProposal } from './useBilling'

/**
 * Create dialog shared by proposals and invoices — same fields, same shape,
 * only the destination differs.
 *
 * A client is required because `client_id` is NOT NULL on both tables: these
 * documents exist to be sent to someone. If the org has no clients yet the
 * dialog says so rather than presenting an empty dropdown, since the fix
 * (inviting a client) lives elsewhere.
 */
export function NewBillingRecordDialog({
  kind,
  onClose,
}: {
  kind: 'proposal' | 'invoice'
  onClose: () => void
}) {
  const { profiles } = useRepositories()
  const navigate = useNavigate()
  const createProposal = useCreateProposal()
  const createInvoice = useCreateInvoice()
  const create = kind === 'proposal' ? createProposal : createInvoice

  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')

  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: () => profiles.listClients(),
  })

  const noClients = !clients.isPending && (clients.data ?? []).length === 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !clientId) return

    try {
      const record = await create.mutateAsync({ title: trimmed, clientId })
      // Straight into the detail view — a record with no line items is not
      // useful, so adding them is the obvious next step.
      navigate(`/${kind}s/${record.id}`)
    } catch {
      // Surfaced below via create.error; dialog stays open so input isn't lost.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-record-title"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 id="new-record-title" className="text-navy mb-4 text-lg font-bold">
          New {kind}
        </h2>

        {noClients ? (
          <>
            <p className="text-navy/70 text-sm">
              You need a client before creating a {kind}. Invite one from Team
              settings first.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-navy/70 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="record-title" className="text-navy block text-sm font-medium">
                Title
              </label>
              <input
                id="record-title"
                required
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={
                  kind === 'proposal' ? 'Kitchen remodel' : 'Progress billing 1'
                }
                className="border-navy/20 focus:border-navy mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label htmlFor="record-client" className="text-navy block text-sm font-medium">
                Client
              </label>
              <select
                id="record-client"
                required
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="border-navy/20 focus:border-navy mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none"
              >
                <option value="" disabled>
                  {clients.isPending ? 'Loading…' : 'Select a client'}
                </option>
                {(clients.data ?? []).map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName ?? 'Unnamed client'}
                  </option>
                ))}
              </select>
            </div>

            {create.error && (
              <p role="alert" className="text-brand-red text-sm">
                {create.error.message}
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
                disabled={create.isPending}
                className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {create.isPending ? 'Creating…' : `Create ${kind}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
