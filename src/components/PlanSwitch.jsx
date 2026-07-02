const TABS = [
  { id: "standard", label: "Standard" },
  { id: "scientific", label: "Scientific" },
  { id: "engineering", label: "Eng", fullLabel: "Engineering" },
];

export function PlanSwitch({ plan, onAction }) {
  const activeIndex = TABS.findIndex((t) => t.id === plan);
  const sliderGap = 8 / TABS.length;

  return (
    <div
      className="plan-switch"
      role="tablist"
      aria-label="Calculator mode"
      style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`plan-btn${plan === tab.id ? " active" : ""}`}
          role="tab"
          aria-selected={plan === tab.id}
          aria-label={tab.fullLabel ?? tab.label}
          title={tab.fullLabel ?? tab.label}
          onClick={() => onAction("set-plan", tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <span
        className="plan-slider"
        style={{
          width: `calc(${100 / TABS.length}% - ${sliderGap}px)`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
