import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`rounded-3xl bg-white border border-eco-100/80 shadow-[0_8px_30px_rgba(6,78,59,0.06)] text-left ${onClick ? 'cursor-pointer hover:border-eco-300 transition' : ''} ${className}`}
    >
      {children}
    </Comp>
  )
}
