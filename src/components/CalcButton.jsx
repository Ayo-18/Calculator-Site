export function CalcButton({ action, value, label, className = "", active = false, onAction }) {
  return (
    <button
      type="button"
      className={`btn ${className}${active ? " active" : ""}`}
      onClick={() => onAction(action, value)}
    >
      {label}
    </button>
  );
}
