export function PlanSwitch({ plan, onAction }) {
  return (
    <div className="plan-switch" role="tablist" aria-label="Calculator mode">
      <button
        type="button"
        className={`plan-btn${plan === "standard" ? " active" : ""}`}
        role="tab"
        aria-selected={plan === "standard"}
        aria-controls="scientificPanel"
        onClick={() => onAction("set-plan", "standard")}
      >
        Standard
      </button>
      <button
        type="button"
        className={`plan-btn${plan === "scientific" ? " active" : ""}`}
        role="tab"
        aria-selected={plan === "scientific"}
        aria-controls="scientificPanel"
        onClick={() => onAction("set-plan", "scientific")}
      >
        Scientific
      </button>
      <span className="plan-slider" aria-hidden="true" />
    </div>
  );
}
