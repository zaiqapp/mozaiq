'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export interface ScalarFieldDef {
  key: string
  label: string
  type: 'text' | 'number'
  hint?: string
}

interface Props {
  fields: ScalarFieldDef[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function ScalarDataFields({ fields, values, onChange }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const labelClass = `mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`
  const hintClass = `mt-1 text-[10px] ${isDark ? 'text-[#374151]' : 'text-gray-400'}`

  return (
    <div className="flex flex-col gap-4">
      {fields.map(field => (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className={inputClass}
            value={values[field.key] === undefined ? '' : String(values[field.key])}
            onChange={e =>
              onChange(
                field.key,
                field.type === 'number'
                  ? (e.target.value === '' ? 0 : Number(e.target.value))
                  : e.target.value,
              )
            }
          />
          {field.hint && <p className={hintClass}>{field.hint}</p>}
        </div>
      ))}
    </div>
  )
}
