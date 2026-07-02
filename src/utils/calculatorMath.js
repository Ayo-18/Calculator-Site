export const OP_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };

export function formatDisplay(value) {
  if (value === "" || value === "-") return value || "0";
  if (value === "Error") return "Error";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
    return num.toExponential(6);
  }
  const str = String(num);
  if (str.includes(".")) {
    return str.replace(/\.?0+$/, "");
  }
  return str;
}

export function computeOperation(prev, curr, op) {
  switch (op) {
    case "+":
      return prev + curr;
    case "-":
      return prev - curr;
    case "*":
      return prev * curr;
    case "/":
      return curr === 0 ? "Error" : prev / curr;
    case "^":
      return Math.pow(prev, curr);
    default:
      return null;
  }
}

export function toRadians(value, angleMode) {
  return angleMode === "deg" ? (value * Math.PI) / 180 : value;
}

export function fromRadians(value, angleMode) {
  return angleMode === "deg" ? (value * 180) / Math.PI : value;
}

export function getLivePreview(state) {
  const { operator, previousValue, currentValue, shouldResetDisplay } = state;
  if (!operator || previousValue === "" || shouldResetDisplay) return null;
  if (currentValue === "Error" || currentValue === "-" || currentValue === ".") return null;

  const prev = parseFloat(previousValue);
  const curr = parseFloat(currentValue);
  if (isNaN(prev) || isNaN(curr)) return null;

  return computeOperation(prev, curr, operator);
}

export function evaluateExpression(expr) {
  let sanitized = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, String(Math.PI))
    .replace(/\be\b/g, String(Math.E))
    .replace(/(\d+(?:\.\d+)?)\s*!/g, (_, n) => {
      const num = parseFloat(n);
      if (num < 0 || num > 170 || !Number.isInteger(num)) throw new Error("Invalid factorial");
      let fact = 1;
      for (let i = 2; i <= num; i++) fact *= i;
      return String(fact);
    });

  const allowed = /^[0-9+\-*/().\s^eE]+$/;
  if (!allowed.test(sanitized.replace(/e/g, "").replace(/E/g, ""))) {
    throw new Error("Invalid expression");
  }

  const result = Function(`"use strict"; return (${sanitized})`)();
  if (!isFinite(result) || isNaN(result)) throw new Error("Invalid result");
  return result;
}

export function applyUnaryOp(fnName, value) {
  switch (fnName) {
    case "square":
      return { result: value * value, label: `sqr(${formatDisplay(String(value))})` };
    case "reciprocal":
      return {
        result: value === 0 ? "Error" : 1 / value,
        label: `1/(${formatDisplay(String(value))})`,
      };
    case "factorial": {
      if (value < 0 || value > 170 || !Number.isInteger(value)) {
        return { result: "Error", label: "n!" };
      }
      let result = 1;
      for (let i = 2; i <= value; i++) result *= i;
      return { result, label: `${formatDisplay(String(value))}!` };
    }
    default:
      return null;
  }
}

export function applyFunctionOp(fnName, value, angleMode) {
  switch (fnName) {
    case "sin":
      return { result: Math.sin(toRadians(value, angleMode)), label: `sin(${formatDisplay(String(value))})` };
    case "cos":
      return { result: Math.cos(toRadians(value, angleMode)), label: `cos(${formatDisplay(String(value))})` };
    case "tan":
      return { result: Math.tan(toRadians(value, angleMode)), label: `tan(${formatDisplay(String(value))})` };
    case "asin":
      if (value < -1 || value > 1) return { result: "Error", label: "sin⁻¹" };
      return {
        result: fromRadians(Math.asin(value), angleMode),
        label: `sin⁻¹(${formatDisplay(String(value))})`,
      };
    case "acos":
      if (value < -1 || value > 1) return { result: "Error", label: "cos⁻¹" };
      return {
        result: fromRadians(Math.acos(value), angleMode),
        label: `cos⁻¹(${formatDisplay(String(value))})`,
      };
    case "atan":
      return {
        result: fromRadians(Math.atan(value), angleMode),
        label: `tan⁻¹(${formatDisplay(String(value))})`,
      };
    case "log":
      return {
        result: value <= 0 ? "Error" : Math.log10(value),
        label: `log(${formatDisplay(String(value))})`,
      };
    case "ln":
      return {
        result: value <= 0 ? "Error" : Math.log(value),
        label: `ln(${formatDisplay(String(value))})`,
      };
    case "sqrt":
      return {
        result: value < 0 ? "Error" : Math.sqrt(value),
        label: `√(${formatDisplay(String(value))})`,
      };
    case "exp":
      return {
        result: Math.exp(value),
        label: `e^(${formatDisplay(String(value))})`,
      };
    default:
      return null;
  }
}

export function getDisplayTexts(state) {
  const { historyLine, previousValue, operator, currentValue, shouldResetDisplay } = state;

  let expression = "";
  let preview = "";

  if (historyLine) {
    expression = historyLine;
  } else if (previousValue && operator) {
    expression = `${formatDisplay(previousValue)} ${OP_SYMBOLS[operator]}`;
    if (!shouldResetDisplay) {
      expression += ` ${formatDisplay(currentValue)}`;
      const live = getLivePreview(state);
      if (live !== null) {
        preview = live === "Error" ? "= Error" : `= ${formatDisplay(String(live))}`;
      }
    }
  }

  return { expression, preview };
}
