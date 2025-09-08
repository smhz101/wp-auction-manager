import * as React from 'react'

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost'
  }
> = ({ className = '', variant = 'primary', ...props }) => {
  const styles: Record<string, string> = {
    ghost: 'bg-transparent hover:bg-zinc-100',
    primary: 'bg-black text-white hover:bg-zinc-800',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${styles[variant]} ${className}`}
    />
  )
}

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => (
  <select
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

export const Switch: React.FC<{
  checked: boolean
  onChange: (v: boolean) => void
}> = ({ checked, onChange }) => (
  <button
    aria-pressed={checked}
    className={`h-6 w-11 rounded-full transition ${checked ? 'bg-black' : 'bg-zinc-200'} relative`}
    onClick={() => onChange(!checked)}
    type="button"
  >
    <span
      className={`absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transition ${
        checked ? 'translate-x-5' : ''
      }`}
    />
  </button>
)

export const Section: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <section className="rounded border border-zinc-200 bg-white isolation-auto">
    <div className="border-b border-zinc-200 px-4 py-3">
      <h2 className="text-sm font-semibold !m-0">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </section>
)

export const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
)

export const Row: React.FC<{
  label: string
  hint?: string
  children: React.ReactNode
}> = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {children}
    {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
  </label>
)
