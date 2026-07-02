import { useCalculator } from "../hooks/useCalculator";
import { PlanSwitch } from "./PlanSwitch";
import { Display } from "./Display";
import { ScientificPanel } from "./ScientificPanel";
import { StandardKeypad } from "./StandardKeypad";
import { EngineeringToolkit } from "./engineering/EngineeringToolkit";

export default function Calculator() {
  const { plan, state, formattedResult, expression, preview, handleAction } = useCalculator();
  const isEngineering = plan === "engineering";

  return (
    <div className="calculator" id="calculator" data-plan={plan}>
      <div className="calculator-top">
        <PlanSwitch plan={plan} onAction={handleAction} />
        {!isEngineering && (
          <Display
            expression={expression}
            preview={preview}
            result={formattedResult}
            memoryActive={state.memoryActive}
          />
        )}
      </div>

      {isEngineering ? (
        <EngineeringToolkit />
      ) : (
        <div className="calculator-body">
          <ScientificPanel
            plan={plan}
            angleMode={state.angleMode}
            operator={state.operator}
            onAction={handleAction}
          />
          <StandardKeypad operator={state.operator} onAction={handleAction} />
        </div>
      )}
    </div>
  );
}
