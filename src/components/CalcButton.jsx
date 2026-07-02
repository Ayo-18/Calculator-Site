export function CalcButton({ action, value, label, className = "", active = false, onAction }) {
  return (
    <button
      type="button"
      className={`btn ${className}${active ? " active" : ""}`}
      onClick={(e) => {
        onAction(action, value);
        // Release the mobile :active/:focus press-state immediately so the
        // button visually "lets go" instead of appearing stuck/held down.
        e.currentTarget.blur();
      }}
    >
      {label}
    </button>
  );
}
