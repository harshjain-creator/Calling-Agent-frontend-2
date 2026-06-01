import { Bot, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function TranscriptView({ turns }) {
  if (!turns || turns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-[var(--color-fg-muted)] text-sm">
          No transcript captured.
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
          {turns.map(t => {
            const isBot = t.role === 'bot'
            return (
              <div key={t.idx} className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                {isBot && (
                  <div className="h-8 w-8 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 border ${
                    isBot
                      ? 'bg-[var(--color-bg-muted)] border-[var(--color-border)] text-[var(--color-fg)] rounded-tl-sm'
                      : 'bg-[var(--color-accent-soft)] border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-tr-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{t.text}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
                    {t.language && <span>{t.language}</span>}
                    {isBot && t.latency_ms != null && <span>↳ {(t.latency_ms / 1000).toFixed(1)}s</span>}
                  </div>
                </div>
                {!isBot && (
                  <div className="h-8 w-8 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] flex items-center justify-center flex-shrink-0">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
