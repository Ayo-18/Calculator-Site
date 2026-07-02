export function CalcButton({ action, value, label, className = "", active = false, title, onAction }) {
  return (
    <button
      type="button"
      className={`btn ${className}${active ? " active" : ""}`}
      title={title}
      onClick={() => onAction(action, value)}
    >
      {label}
    </button>
  );
}
