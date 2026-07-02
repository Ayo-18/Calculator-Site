import { useCalculator } from "../hooks/useCalculator";
import { PlanSwitch } from "./PlanSwitch";
import { Display } from "./Display";
import { ScientificPanel } from "./ScientificPanel";
import { StandardKeypad } from "./StandardKeypad";

export default function Calculator() {
  const { plan, state, formattedResult, expression, preview, handleAction } = useCalculator();

  return (
    <div className="calculator" id="calculator" data-plan={plan}>
      <div className="calculator-top">
        <PlanSwitch plan={plan} onAction={handleAction} />
        <Display
          expression={expression}
          preview={preview}
          result={formattedResult}
          memoryActive={state.memoryActive}
        />
      </div>

      <div className="calculator-body">
        <ScientificPanel
          plan={plan}
          angleMode={state.angleMode}
          operator={state.operator}
          onAction={handleAction}
        />
        <StandardKeypad operator={state.operator} onAction={handleAction} />
      </div>
    </div>
  );
}
