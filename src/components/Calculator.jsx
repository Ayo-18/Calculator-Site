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

export default function Calculator() {
  const [overlay, setOverlay] = useState(null); // null | "history" | "currency"
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
    <div className="calculator" id="calculator" data-plan={plan}>
      <div className="calculator-top">
        <div className="calculator-toolbar">
          <button
            type="button"
            className="toolbar-icon-btn"
            onClick={(e) => {
              setOverlay("history");
              e.currentTarget.blur();
            }}
            aria-label="Calculation history"
            title="History"
          >
            <HistoryIcon />
          </button>
          <button
            type="button"
            className="toolbar-icon-btn"
            onClick={(e) => {
              setOverlay("currency");
              e.currentTarget.blur();
            }}
            aria-label="Currency converter"
            title="Currency converter"
          >
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
          <ScientificPanel
            plan={plan}
            angleMode={state.angleMode}
            onAction={handleAction}
          />
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
  );
}
