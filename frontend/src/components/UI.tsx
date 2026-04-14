import { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

type BadgeProps = {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

type InputProps = {
  label?: string
  placeholder?: string
  type?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div {...props} className={['rounded-[1.75rem] border border-slate-200 bg-white shadow-sm', className].join(' ')}>
      {children}
    </div>
  )
}

export function Button({
  children,
  loading = false,
  className = '',
  disabled,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-2xl font-semibold transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  }

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variants[variant]}`}>{children}</span>
}

export function Input({ label, placeholder, type = 'text', value, onChange, error, disabled }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'rounded-2xl border px-4 py-3 transition-colors outline-none',
          error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500',
          'disabled:cursor-not-allowed disabled:bg-slate-50',
        ].join(' ')}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
