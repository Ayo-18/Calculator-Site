import { useState, useCallback, useEffect } from "react";
import {
  formatDisplay,
  computeOperation,
  OP_SYMBOLS,
  evaluateExpression,
  applyUnaryOp,
  applyFunctionOp,
  getDisplayTexts,
} from "../utils/calculatorMath";

const INITIAL_STATE = {
  currentValue: "0",
  previousValue: "",
  operator: null,
  shouldResetDisplay: false,
  angleMode: "deg",
  memory: 0,
  memoryActive: false,
  historyLine: "",
};

function loadPlan() {
  try {
    const saved = localStorage.getItem("calculatorPlan");
    if (saved === "scientific" || saved === "standard") return saved;
  } catch {
    /* ignore */
  }
  return "standard";
}

function normalizeResult(value) {
  if (value === "Error" || !isFinite(value) || isNaN(value)) return "Error";
  return String(value);
}

export function useCalculator() {
  const [plan, setPlanState] = useState(loadPlan);
  const [state, setState] = useState(INITIAL_STATE);

  const setPlan = useCallback((nextPlan) => {
    setPlanState(nextPlan);
    try {
      localStorage.setItem("calculatorPlan", nextPlan);
    } catch {
      /* ignore */
    }
  }, []);

  const setResult = useCallback((value, history = "") => {
    setState((prev) => ({
      ...prev,
      currentValue: normalizeResult(value),
      historyLine: history,
      shouldResetDisplay: true,
      operator: null,
      previousValue: "",
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const inputDigit = useCallback((digit) => {
    setState((prev) => {
      if (prev.currentValue === "Error") return { ...INITIAL_STATE, currentValue: digit };

      if (prev.shouldResetDisplay) {
        return { ...prev, historyLine: "", currentValue: digit, shouldResetDisplay: false };
      }

      return {
        ...prev,
        currentValue: prev.currentValue === "0" ? digit : prev.currentValue + digit,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.currentValue === "Error") return { ...INITIAL_STATE, currentValue: "0." };

      if (prev.shouldResetDisplay) {
        return { ...prev, historyLine: "", currentValue: "0.", shouldResetDisplay: false };
      }

      if (!prev.currentValue.includes(".")) {
        return { ...prev, currentValue: prev.currentValue + "." };
      }

      return prev;
    });
  }, []);

  const setOperator = useCallback((op) => {
    setState((prev) => {
      if (prev.currentValue === "Error") return prev;

      let next = { ...prev };

      if (next.operator && !next.shouldResetDisplay) {
        const prevNum = parseFloat(next.previousValue);
        const currNum = parseFloat(next.currentValue);
        const result = computeOperation(prevNum, currNum, next.operator);
        if (result === null) return prev;
        if (result === "Error") {
          return { ...next, currentValue: "Error", operator: null, previousValue: "" };
        }
        next.currentValue = String(result);
      }

      return {
        ...next,
        historyLine: "",
        previousValue: next.currentValue,
        operator: op,
        shouldResetDisplay: true,
      };
    });
  }, []);

  const calculate = useCallback((showHistory = true) => {
    setState((prev) => {
      if (!prev.operator || prev.previousValue === "") return prev;

      const prevNum = parseFloat(prev.previousValue);
      const currNum = parseFloat(prev.currentValue);
      const result = computeOperation(prevNum, currNum, prev.operator);
      if (result === null) return prev;

      const historyLine = showHistory
        ? `${formatDisplay(prev.previousValue)} ${OP_SYMBOLS[prev.operator]} ${formatDisplay(String(currNum))} =`
        : prev.historyLine;

      return {
        ...prev,
        historyLine,
        currentValue: result === "Error" ? "Error" : String(result),
        previousValue: "",
        operator: null,
        shouldResetDisplay: true,
      };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.currentValue === "0" || prev.currentValue === "Error") return prev;
      return {
        ...prev,
        currentValue: prev.currentValue.startsWith("-")
          ? prev.currentValue.slice(1)
          : "-" + prev.currentValue,
      };
    });
  }, []);

  const percent = useCallback(() => {
    setState((prev) => {
      if (prev.currentValue === "Error") return prev;
      return { ...prev, currentValue: String(parseFloat(prev.currentValue) / 100) };
    });
  }, []);

  const toggleAngleMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      angleMode: prev.angleMode === "deg" ? "rad" : "deg",
    }));
  }, []);

  const applyUnary = useCallback(
    (fnName) => {
      setState((prev) => {
        if (prev.currentValue === "Error") return prev;
        const value = parseFloat(prev.currentValue);
        const op = applyUnaryOp(fnName, value);
        if (!op) return prev;
        return {
          ...prev,
          currentValue: normalizeResult(op.result),
          historyLine: `${op.label} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
        };
      });
    },
    []
  );

  const applyFunction = useCallback(
    (fnName) => {
      setState((prev) => {
        if (prev.currentValue === "Error") return prev;
        const value = parseFloat(prev.currentValue);
        const op = applyFunctionOp(fnName, value, prev.angleMode);
        if (!op) return prev;
        return {
          ...prev,
          currentValue: normalizeResult(op.result),
          historyLine: `${op.label} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
        };
      });
    },
    []
  );

  const insertParen = useCallback((value) => {
    setState((prev) => {
      if (prev.currentValue === "Error") return prev;

      if (value === "(") {
        const historyLine =
          prev.shouldResetDisplay || prev.currentValue === "0"
            ? "("
            : `${formatDisplay(prev.currentValue)} × (`;
        return {
          ...prev,
          historyLine,
          currentValue: "(",
          shouldResetDisplay: false,
        };
      }

      const expr = prev.historyLine.includes("(")
        ? `${prev.historyLine}${prev.currentValue})`
        : `(${prev.currentValue})`;

      try {
        const inner = expr.replace(/^.*\(/, "").replace(/\)$/, "");
        const result = evaluateExpression(inner);
        return {
          ...prev,
          currentValue: normalizeResult(result),
          historyLine: `${expr} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
        };
      } catch {
        return {
          ...prev,
          currentValue: "Error",
          historyLine: expr,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
        };
      }
    });
  }, []);

  const handleMemory = useCallback((action) => {
    setState((prev) => {
      if (prev.currentValue === "Error" && action !== "mc" && action !== "mr") return prev;

      const value = parseFloat(prev.currentValue);

      switch (action) {
        case "mc":
          return { ...prev, memory: 0, memoryActive: false };
        case "mr":
          return {
            ...prev,
            currentValue: String(prev.memory),
            shouldResetDisplay: true,
            historyLine: "MR",
          };
        case "m-plus":
          return {
            ...prev,
            memory: prev.memory + value,
            memoryActive: true,
            shouldResetDisplay: true,
            historyLine: "M+",
          };
        case "m-minus":
          return {
            ...prev,
            memory: prev.memory - value,
            memoryActive: true,
            shouldResetDisplay: true,
            historyLine: "M−",
          };
        default:
          return prev;
      }
    });
  }, []);

  const handleAction = useCallback(
    (action, value) => {
      switch (action) {
        case "set-plan":
          setPlan(value);
          break;
        case "digit":
          inputDigit(value);
          break;
        case "decimal":
          inputDecimal();
          break;
        case "operator":
          setOperator(value);
          break;
        case "equals":
          calculate();
          break;
        case "clear":
          clearAll();
          break;
        case "toggle-sign":
          toggleSign();
          break;
        case "percent":
          percent();
          break;
        case "toggle-angle":
          toggleAngleMode();
          break;
        case "function":
          applyFunction(value);
          break;
        case "unary":
          applyUnary(value);
          break;
        case "paren":
          insertParen(value);
          break;
        case "memory":
          handleMemory(value);
          break;
        default:
          break;
      }
    },
    [
      setPlan,
      inputDigit,
      inputDecimal,
      setOperator,
      calculate,
      clearAll,
      toggleSign,
      percent,
      toggleAngleMode,
      applyFunction,
      applyUnary,
      insertParen,
      handleMemory,
    ]
  );

  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.currentValue === "Error" || prev.shouldResetDisplay) {
        return INITIAL_STATE;
      }

      const currentValue =
        prev.currentValue.length > 1 ? prev.currentValue.slice(0, -1) : "0";

      return { ...prev, currentValue, historyLine: "" };
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        if (state.currentValue === "Error") clearAll();
        inputDigit(e.key);
      } else if (e.key === ".") {
        if (state.currentValue === "Error") clearAll();
        inputDecimal();
      } else if (e.key === "+" || e.key === "-") {
        if (state.currentValue === "Error") return;
        setOperator(e.key);
      } else if (e.key === "*") {
        if (state.currentValue === "Error") return;
        setOperator("*");
      } else if (e.key === "/") {
        e.preventDefault();
        if (state.currentValue === "Error") return;
        setOperator("/");
      } else if (e.key === "^") {
        if (state.currentValue === "Error") return;
        setOperator("^");
      } else if (e.key === "Enter" || e.key === "=") {
        if (state.currentValue === "Error") return;
        calculate();
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "Backspace") {
        backspace();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    state.currentValue,
    inputDigit,
    inputDecimal,
    setOperator,
    calculate,
    clearAll,
    backspace,
  ]);

  const formattedResult = formatDisplay(state.currentValue);
  const { expression, preview } = getDisplayTexts(state);

  return {
    plan,
    state,
    formattedResult,
    expression,
    preview,
    handleAction,
  };
}
