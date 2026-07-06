export function CalcButton({ action, value, label, className = "", onAction }) {
  const handleClick = (e) => {
    onAction(action, value);
    e.currentTarget.classList.add("btn-hud-flash");
    setTimeout(() => e.currentTarget.classList.remove("btn-hud-flash"), 180);
    e.currentTarget.blur();
  };

  return (
    <button type="button" className={`btn ${className}`} onClick={handleClick}>
      {label}
    </button>
  );
}
