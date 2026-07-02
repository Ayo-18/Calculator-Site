export function EngPanel({ children }) {
  return <div className="eng-panel">{children}</div>;
}

export function EngLabel({ children }) {
  return <div className="eng-label">{children}</div>;
}

export function EngMono({ children, className = "" }) {
  return <div className={`eng-mono ${className}`.trim()}>{children}</div>;
}

export function EngInput({ value, onChange, placeholder, invalid }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`eng-input${invalid ? " eng-input-invalid" : ""}`}
    />
  );
}

export function EngSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="eng-select">
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
