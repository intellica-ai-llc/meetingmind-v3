import { useState, useRef, useEffect } from 'react'

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
  className?: string
  placeholder?: string
}

export function EditableField({
  value,
  onSave,
  className = '',
  placeholder = '',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = () => {
    setEditing(false)
    if (draft !== value) {
      onSave(draft)
    }
  }

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') {
          setDraft(value)
          setEditing(false)
        }
      }}
      className={`bg-transparent border-b border-cyan/40 text-white outline-none px-1 py-0.5 ${className}`}
      placeholder={placeholder}
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:text-cyan transition-colors ${className}`}
      title="Click to edit"
    >
      {value || placeholder || '—'}
    </span>
  )
}