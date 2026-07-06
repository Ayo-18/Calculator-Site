import { useState } from "react";
import { useCalculator } from "../hooks/useCalculator";
import { PlanSwitch } from "./PlanSwitch";
import { Display } from "./Display";
import { ScientificPanel } from "./ScientificPanel";
import { StandardKeypad } from "./StandardKeypad";
import { EngineeringToolkit } from "./engineering/EngineeringToolkit";
import { CurrencyConverter } from "./CurrencyConverter";
import { HistoryPanel } from "./HistoryPanel";
import { ToolOverlay } from "./shared/ToolOverlay";
import { HistoryIcon, CurrencyIcon } from "./shared/Icons";
import { HudCorners } from "./shared/HudCorners";

const MODE_BADGE = {
  standard: "STANDARD",
  scientific: "SCIENTIFIC",
  engineering: "ENGINEERING",
};

export default function Calculator() {
  const [overlay, setOverlay] = useState(null);
  const { plan, state, formattedResult, expression, preview, handleAction } = useCalculator(
    overlay !== null
  );
  const isCalcMode = plan === "standard" || plan === "scientific";

  const closeOverlay = () => setOverlay(null);

  const handleHistoryAction = (action, value) => {
    handleAction(action, value);
    if (action === "history-select") closeOverlay();
  };

  return (
    <div className="hud-shell">
      <div className="hud-circuit-bg" aria-hidden="true" />
      <div className="hud-vignette" aria-hidden="true" />

      <div className="calculator hud-panel" id="calculator" data-plan={plan}>
        <HudCorners color="#3ddcc1" />

        <div className="calculator-top">
          <div className="hud-status-bar">
            <button
              type="button"
              className="hud-sys-btn"
              onClick={(e) => {
                setOverlay("history");
                e.currentTarget.blur();
              }}
              aria-label="Calculation history"
              title="History"
            >
              <HistoryIcon />
              <span>SYS://HISTORY</span>
            </button>
            <span className="hud-mode-badge">{MODE_BADGE[plan] ?? "STANDARD"}</span>
            <button
              type="button"
              className="hud-sys-btn"
              onClick={(e) => {
                setOverlay("currency");
                e.currentTarget.blur();
              }}
              aria-label="Currency converter"
              title="Currency converter"
            >
              <span>SYS://FX</span>
              <CurrencyIcon />
            </button>
          </div>

          <PlanSwitch plan={plan} onAction={handleAction} />

          {isCalcMode && (
            <Display
              expression={expression}
              preview={preview}
              result={formattedResult}
              memoryActive={state.memoryActive}
            />
          )}
        </div>

        {plan === "engineering" && <EngineeringToolkit />}

        {isCalcMode && (
          <div className="calculator-body">
            <ScientificPanel plan={plan} angleMode={state.angleMode} onAction={handleAction} />
            <StandardKeypad onAction={handleAction} />
          </div>
        )}

        {overlay === "history" && (
          <ToolOverlay onClose={closeOverlay}>
            <HistoryPanel history={state.history} onAction={handleHistoryAction} />
          </ToolOverlay>
        )}
        {overlay === "currency" && (
          <ToolOverlay onClose={closeOverlay}>
            <CurrencyConverter />
          </ToolOverlay>
        )}
      </div>
    </div>
  );
}
