export function StatusBadge({
  status,
}: {
  status: string
}) {
  const map: Record<string, string> = {
    Paid: 'bg-eco-100 text-eco-800',
    Completed: 'bg-eco-100 text-eco-800',
    Verified: 'bg-eco-100 text-eco-800',
    RecyclerVerified: 'bg-eco-100 text-eco-800',
    Pending: 'bg-amber-100 text-amber-800',
    Created: 'bg-sky-100 text-sky-800',
    Expired: 'bg-red-100 text-red-700',
    Suspended: 'bg-red-100 text-red-700',
    Hazardous: 'bg-red-100 text-red-700',
  }
  const cls = map[status] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
      {status}
    </span>
  )
}
