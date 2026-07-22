import type { ReactNode } from 'react';

// ─── Campos de formulario reutilizables para el panel de personalización ────────
// Todos son "controlados": reciben value + onChange y no guardan estado propio.

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="ui-label">{label}</span>
      {children}
      {hint && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function TextField({
  label, value, onChange, placeholder, hint, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        className="ui-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label, value, onChange, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="ui-input min-h-20 resize-y"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({
  label, value, onChange, options, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const valid = HEX_RE.test(value);
  return (
    <div>
      <span className="ui-label">{label}</span>
      <div className="flex items-center gap-2">
        {/* Muestra/selector nativo */}
        <div className="relative w-11 h-11 rounded-lg border border-border overflow-hidden shrink-0">
          <input
            type="color"
            value={valid ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0 bg-transparent"
            aria-label={label}
          />
        </div>
        {/* Entrada hex manual */}
        <input
          type="text"
          className="ui-input font-mono text-sm"
          value={value}
          onChange={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            onChange(v);
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
