import { CalcButton } from "./CalcButton";

const SCI_BUTTONS = [
  { action: "function", value: "sin", label: "sin" },
  { action: "function", value: "cos", label: "cos" },
  { action: "function", value: "tan", label: "tan" },
  { action: "function", value: "log", label: "log" },
  { action: "function", value: "asin", label: "sin⁻¹" },
  { action: "function", value: "acos", label: "cos⁻¹" },
  { action: "function", value: "atan", label: "tan⁻¹" },
  { action: "function", value: "ln", label: "ln" },
  { action: "unary", value: "square", label: "x²" },
  { action: "operator", value: "^", label: "xʸ" },
  { action: "function", value: "sqrt", label: "√" },
  { action: "unary", value: "reciprocal", label: "1/x" },
  { action: "memory", value: "mc", label: "MC" },
  { action: "memory", value: "mr", label: "MR" },
  { action: "memory", value: "m-plus", label: "M+" },
  { action: "memory", value: "m-minus", label: "M−" },
  { action: "paren", value: "(", label: "(" },
  { action: "paren", value: ")", label: ")" },
  { action: "unary", value: "factorial", label: "n!" },
  { action: "toggle-angle", value: "deg", label: "DEG", isDeg: true },
];

export function ScientificPanel({ plan, angleMode, onAction }) {
  return (
    <aside
      className="scientific-panel"
      id="scientificPanel"
      role="tabpanel"
      aria-hidden={plan !== "scientific"}
    >
      <div className="sci-keypad">
        {SCI_BUTTONS.map((btn) => {
          if (btn.isDeg) {
            return (
              <button
                key="deg"
                type="button"
                className={`btn btn-sci btn-deg${angleMode === "rad" ? " rad" : ""}`}
                title="Switch Degrees / Radians"
                onClick={(e) => {
                  onAction("toggle-angle");
                  e.currentTarget.classList.add("btn-press-flash");
                  setTimeout(() => e.currentTarget.classList.remove("btn-press-flash"), 120);
                  e.currentTarget.blur();
                }}
              >
                {angleMode.toUpperCase()}
              </button>
            );
          }

          return (
            <CalcButton
              key={`${btn.action}-${btn.value}`}
              action={btn.action}
              value={btn.value}
              label={btn.label}
              className="btn-sci"
              onAction={onAction}
            />
          );
        })}
      </div>
    </aside>
  );
}
