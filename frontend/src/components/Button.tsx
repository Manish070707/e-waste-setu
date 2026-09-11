import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warn'
  size?: 'md' | 'lg'
  children: ReactNode
}

const styles = {
  primary: 'bg-eco-700 text-white hover:bg-eco-800 shadow-sm',
  secondary: 'bg-white text-eco-800 border-2 border-eco-200 hover:border-eco-500',
  ghost: 'bg-transparent text-eco-800 hover:bg-eco-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  warn: 'bg-amber-500 text-white hover:bg-amber-600',
}

export function Button({ variant = 'primary', size = 'lg', className = '', children, ...rest }: Props) {
  const sizing = size === 'lg' ? 'px-5 py-3.5 text-base touch-target' : 'px-4 py-2.5 text-sm'
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:opacity-50 ${styles[variant]} ${sizing} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
