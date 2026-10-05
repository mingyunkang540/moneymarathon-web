interface Props {
  id: string; label: string; value: string; onChange: (value: string) => void;
  unit: string; hint: string; error?: string; decimal?: boolean;
}

export default function MoneyInput({ id, label, value, onChange, unit, hint, error, decimal }: Props) {
  return <div className={`field${error ? ' field-invalid' : ''}`}>
    <label htmlFor={id}>{label}</label>
    <div className="input-shell"><input id={id} name={id} type="text" inputMode={decimal ? 'decimal' : 'numeric'}
      value={value} onChange={(event) => onChange(event.target.value)}
      onBlur={() => {
        if (!decimal && /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value)) {
          const parsed = Number(value.replaceAll(',', ''))
          if (Number.isSafeInteger(parsed)) onChange(parsed.toLocaleString('ko-KR'))
        }
      }}
      autoComplete="off" spellCheck={false} maxLength={24}
      aria-invalid={!!error} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} />
      <span className="input-unit" aria-hidden="true">{unit}</span>
    </div>
    <span id={`${id}-hint`} className="field-hint">{hint}</span>
    {error && <span id={`${id}-error`} className="field-error">! {error}</span>}
  </div>
}

