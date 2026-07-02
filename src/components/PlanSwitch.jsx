export function PlanSwitch({ plan, onAction }) {
  const tabs = [
    { id: "standard", label: "Standard" },
    { id: "scientific", label: "Scientific" },
    { id: "engineering", label: "Engineering" },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === plan);

  return (
    <div className="plan-switch plan-switch-3" role="tablist" aria-label="Calculator mode">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`plan-btn${plan === tab.id ? " active" : ""}`}
          role="tab"
          aria-selected={plan === tab.id}
          onClick={() => onAction("set-plan", tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <span
        className="plan-slider"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
        aria-hidden="true"
      />
    </div>
  );
}
