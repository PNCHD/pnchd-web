/** Shared status colours for proposals and invoices. The label is always
 * rendered alongside — colour never carries the meaning alone. */
export const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-navy/10 text-navy',
  sent: 'bg-sky-100 text-sky-800',
  approved: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-emerald-600 text-white',
  rejected: 'bg-rose-100 text-rose-800',
  expired: 'bg-navy/5 text-navy/50',
  voided: 'bg-navy/5 text-navy/50',
  refunded: 'bg-amber-100 text-amber-800',
}
