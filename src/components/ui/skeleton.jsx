/**
 * Loading skeletons. Apply when a page/section is fetching data so users
 * see structure instead of a blank flash.
 *
 *   <SkeletonLine width="60%" />
 *   <SkeletonCard />
 *   <SkeletonTable rows={5} cols={4} />
 */
export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-5 space-y-3">
      <SkeletonLine width="40%" height={18} />
      <SkeletonLine width="70%" />
      <SkeletonLine width="55%" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="grid divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 p-4">
            {Array.from({ length: cols }).map((__, c) => (
              <SkeletonLine
                key={c}
                width={c === 0 ? '20%' : `${30 + (c * 7) % 30}%`}
                height={14}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
