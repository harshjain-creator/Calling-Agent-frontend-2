const OUTCOME_STYLE = {
  interested:         'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  not_interested:     'bg-red-500/15     text-red-500     border-red-500/30',
  callback_requested: 'bg-sky-500/15     text-sky-500     border-sky-500/30',
  meeting_scheduled:  'bg-violet-500/15  text-violet-500  border-violet-500/30',
  information_shared: 'bg-slate-500/15   text-slate-500   border-slate-500/30',
  unclear:            'bg-amber-500/15   text-amber-500   border-amber-500/30',
  call_dropped:       'bg-orange-500/15  text-orange-500  border-orange-500/30',
}

const SENTIMENT_STYLE = {
  positive: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  neutral:  'bg-slate-500/15   text-slate-500   border-slate-500/30',
  negative: 'bg-rose-500/15    text-rose-500    border-rose-500/30',
}

export default function OutcomeBadge({ value, kind = 'outcome' }) {
  if (!value) return null
  const styleMap = kind === 'sentiment' ? SENTIMENT_STYLE : OUTCOME_STYLE
  const cls = styleMap[value] || 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border)]'
  const label = value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
