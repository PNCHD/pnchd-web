import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useProfile } from '../../auth/useProfile'
import type { LineItemDraft } from '../../data/billingRepository'
import { useRepositories } from '../../data/repositoryContext'
import type {
  InvoiceStatus,
  LineItemParentType,
  ProposalStatus,
} from '../../types/billing'

export function useProposals() {
  const { billing } = useRepositories()
  const { profile, isLoading } = useProfile()

  const query = useQuery({
    queryKey: ['proposals'],
    queryFn: () => billing.listProposals(),
    enabled: !isLoading && Boolean(profile?.organizationId),
  })

  return {
    proposals: query.data ?? [],
    isLoading: isLoading || query.isPending,
    error: query.error,
  }
}

export function useInvoices() {
  const { billing } = useRepositories()
  const { profile, isLoading } = useProfile()

  const query = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billing.listInvoices(),
    enabled: !isLoading && Boolean(profile?.organizationId),
  })

  return {
    invoices: query.data ?? [],
    isLoading: isLoading || query.isPending,
    error: query.error,
  }
}

export function useProposal(id: string | undefined) {
  const { billing } = useRepositories()
  const query = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => (id ? billing.getProposal(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  })
  return { proposal: query.data ?? null, isLoading: query.isPending, error: query.error }
}

export function useInvoice(id: string | undefined) {
  const { billing } = useRepositories()
  const query = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => (id ? billing.getInvoice(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  })
  return { invoice: query.data ?? null, isLoading: query.isPending, error: query.error }
}

export function useLineItems(
  parentType: LineItemParentType,
  parentId: string | undefined,
) {
  const { billing } = useRepositories()
  const query = useQuery({
    queryKey: ['lineItems', parentType, parentId],
    queryFn: () =>
      parentId ? billing.listLineItems(parentType, parentId) : Promise.resolve([]),
    enabled: Boolean(parentId),
  })
  return { lineItems: query.data ?? [], isLoading: query.isPending, error: query.error }
}

export function useSaveLineItems(
  parentType: LineItemParentType,
  parentId: string | undefined,
) {
  const { billing } = useRepositories()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      items: LineItemDraft[]
      subtotalCents: number
      taxCents: number | null
      totalCents: number
    }) => {
      if (!profile?.organizationId || !parentId) {
        throw new Error('Missing organization or record.')
      }
      return billing.replaceLineItems({
        organizationId: profile.organizationId,
        parentType,
        parentId,
        ...params,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineItems', parentType, parentId] })
      queryClient.invalidateQueries({ queryKey: [parentType, parentId] })
      queryClient.invalidateQueries({ queryKey: [`${parentType}s`] })
    },
  })
}

export function useCreateProposal() {
  const { billing } = useRepositories()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { title: string; clientId: string }) => {
      if (!profile?.organizationId) throw new Error('You need an organization first.')
      return billing.createProposal({
        organizationId: profile.organizationId,
        ...input,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  })
}

export function useCreateInvoice() {
  const { billing } = useRepositories()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { title: string; clientId: string }) => {
      if (!profile?.organizationId) throw new Error('You need an organization first.')
      return billing.createInvoice({
        organizationId: profile.organizationId,
        ...input,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useUpdateProposalStatus() {
  const { billing } = useRepositories()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProposalStatus }) =>
      billing.updateProposalStatus(id, status),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposal', id] })
    },
  })
}

export function useUpdateInvoiceStatus() {
  const { billing } = useRepositories()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      billing.updateInvoiceStatus(id, status),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
    },
  })
}
