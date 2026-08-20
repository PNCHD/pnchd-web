import { formatCents } from '../../lib/money'
import {
  computeTotals,
  newDraftRow,
  type LineItemDraftRow,
} from './lineItemDrafts'

/**
 * Line item table shared by proposals and invoices. Controlled — the parent owns
 * the rows so it can save them; this only renders and edits.
 */
export function LineItemEditor({
  rows,
  onChange,
  taxRatePercent,
  invalidKeys = [],
  readOnly = false,
}: {
  rows: LineItemDraftRow[]
  onChange: (rows: LineItemDraftRow[]) => void
  taxRatePercent: number | null
  invalidKeys?: string[]
  readOnly?: boolean
}) {
  const totals = computeTotals(rows, taxRatePercent)

  function update(index: number, patch: Partial<LineItemDraftRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="text-navy/50 border-navy/10 border-b text-left text-xs uppercase">
              <th className="py-2 pr-3 font-medium">Description</th>
              <th className="w-20 py-2 pr-3 text-right font-medium">Qty</th>
              <th className="w-28 py-2 pr-3 text-right font-medium">Unit price</th>
              <th className="w-28 py-2 text-right font-medium">Total</th>
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const invalid = invalidKeys.includes(row.key)
              const cell = `w-full rounded border px-2 py-1.5 outline-none ${
                invalid ? 'border-brand-red' : 'border-navy/15 focus:border-navy'
              }`
              return (
                <tr key={row.key} className="border-navy/5 border-b">
                  <td className="py-2 pr-3">
                    <input
                      aria-label={`Line ${index + 1} description`}
                      className={cell}
                      value={row.description}
                      readOnly={readOnly}
                      onChange={(e) => update(index, { description: e.target.value })}
                      placeholder="Framing labor"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      aria-label={`Line ${index + 1} quantity`}
                      className={`${cell} text-right`}
                      value={row.quantity}
                      readOnly={readOnly}
                      inputMode="decimal"
                      onChange={(e) => update(index, { quantity: e.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      aria-label={`Line ${index + 1} unit price`}
                      className={`${cell} text-right`}
                      value={row.unitPrice}
                      readOnly={readOnly}
                      inputMode="decimal"
                      placeholder="0.00"
                      onChange={(e) => update(index, { unitPrice: e.target.value })}
                    />
                  </td>
                  <td className="text-navy py-2 text-right tabular-nums">
                    {formatCents(totals.rowTotals[index])}
                  </td>
                  {!readOnly && (
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        aria-label={`Remove line ${index + 1}`}
                        onClick={() => onChange(rows.filter((_, i) => i !== index))}
                        className="text-navy/40 hover:text-brand-red px-1"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...rows, newDraftRow()])}
          className="text-brand-red mt-3 text-sm font-semibold"
        >
          + Add line
        </button>
      )}

      <dl className="border-navy/10 mt-4 space-y-1 border-t pt-3 text-sm">
        <Row label="Subtotal" cents={totals.subtotalCents} />
        {taxRatePercent ? (
          <Row label={`Tax (${taxRatePercent}%)`} cents={totals.taxCents} />
        ) : null}
        <Row label="Total" cents={totals.totalCents} emphasis />
      </dl>
    </div>
  )
}

function Row({
  label,
  cents,
  emphasis = false,
}: {
  label: string
  cents: number
  emphasis?: boolean
}) {
  return (
    <div className="flex justify-between">
      <dt className={emphasis ? 'text-navy font-semibold' : 'text-navy/60'}>{label}</dt>
      <dd
        className={`tabular-nums ${emphasis ? 'text-navy font-semibold' : 'text-navy/80'}`}
      >
        {formatCents(cents)}
      </dd>
    </div>
  )
}
