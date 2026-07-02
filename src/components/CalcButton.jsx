export function CalcButton({ action, value, label, className = "", onAction }) {
  return (
    <button
      type="button"
      className={`btn ${className}`}
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
