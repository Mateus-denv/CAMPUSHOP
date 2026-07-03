type PlanBadgeProps = {
  text?: string | null
  color?: string | null
  icon?: string | null
  className?: string
}

const defaultStyles = {
  ESSENCIAL: {
    background: 'bg-slate-100 text-slate-600 border-slate-200',
    glow: '',
  },
  PLUS: {
    background: 'bg-blue-100 text-blue-700 border-blue-200',
    glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_0_24px_rgba(59,130,246,0.18)]',
  },
  PREMIUM: {
    background: 'bg-amber-100 text-amber-800 border-amber-300',
    glow: 'shadow-[0_0_0_1px_rgba(234,179,8,0.22),0_0_28px_rgba(234,179,8,0.28)]',
  },
}

export function PlanBadge({ text = 'ESSENCIAL', color, icon, className = '' }: PlanBadgeProps) {
  const planKey = text.toUpperCase() as keyof typeof defaultStyles
  const styles = defaultStyles[planKey] ?? defaultStyles.ESSENCIAL
  const displayText = ['ESSENCIAL', 'PLUS', 'PREMIUM'].includes(planKey) ? text.toUpperCase() : 'PLANO'

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em]',
        styles.background,
        styles.glow,
        className,
      ].join(' ')}
      style={color ? { borderColor: color } : undefined}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{displayText}</span>
    </span>
  )
}
