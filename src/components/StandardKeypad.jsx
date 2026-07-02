import { CalcButton } from "./CalcButton";

const STANDARD_BUTTONS = [
  { action: "clear", label: "AC", className: "btn-fn" },
  { action: "backspace", label: "⌫", className: "btn-fn" },
  { action: "percent", label: "%", className: "btn-fn" },
  { action: "operator", value: "/", label: "÷", className: "btn-op" },
  { action: "digit", value: "7", label: "7", className: "btn-num" },
  { action: "digit", value: "8", label: "8", className: "btn-num" },
  { action: "digit", value: "9", label: "9", className: "btn-num" },
  { action: "operator", value: "*", label: "×", className: "btn-op" },
  { action: "digit", value: "4", label: "4", className: "btn-num" },
  { action: "digit", value: "5", label: "5", className: "btn-num" },
  { action: "digit", value: "6", label: "6", className: "btn-num" },
  { action: "operator", value: "-", label: "−", className: "btn-op" },
  { action: "digit", value: "1", label: "1", className: "btn-num" },
  { action: "digit", value: "2", label: "2", className: "btn-num" },
  { action: "digit", value: "3", label: "3", className: "btn-num" },
  { action: "operator", value: "+", label: "+", className: "btn-op" },
  { action: "toggle-sign", label: "±", className: "btn-num" },
  { action: "digit", value: "0", label: "0", className: "btn-num" },
  { action: "decimal", label: ".", className: "btn-num" },
  { action: "equals", label: "=", className: "btn-equals" },
];

export function StandardKeypad({ operator, onAction }) {
  return (
    <div className="standard-panel">
      <div className="keypad" id="keypad">
        {STANDARD_BUTTONS.map((btn) => (
          <CalcButton
            key={`${btn.action}-${btn.value ?? btn.label}`}
            action={btn.action}
            value={btn.value}
            label={btn.label}
            className={btn.className}
            active={btn.action === "operator" && operator === btn.value}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}
