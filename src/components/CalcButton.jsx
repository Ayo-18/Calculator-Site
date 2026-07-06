export function CalcButton({ action, value, label, className = "", onAction }) {
  const flashPress = (el) => {
    el.classList.add("btn-press-flash");
    setTimeout(() => el.classList.remove("btn-press-flash"), 120);
    el.blur();
  };

  const handleClick = (e) => {
    onAction(action, value);
    flashPress(e.currentTarget);
  };

  return (
    <button
      type="button"
      className={`btn ${className}`}
      onClick={handleClick}
      onPointerUp={(e) => e.currentTarget.blur()}
      onPointerLeave={(e) => e.currentTarget.blur()}
      onPointerCancel={(e) => e.currentTarget.blur()}
    >
      {label}
    </button>
  );
}
