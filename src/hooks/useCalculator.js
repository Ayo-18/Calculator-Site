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
  history: [],
};

const VALID_PLANS = ["standard", "scientific", "engineering"];

function loadPlan() {
  try {
    const saved = localStorage.getItem("calculatorPlan");
    if (VALID_PLANS.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "standard";
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem("calculatorHistory"));
    if (Array.isArray(saved)) return saved;
  } catch {
    /* ignore */
  }
  return [];
}

function normalizeResult(value) {
  if (value === "Error" || !isFinite(value) || isNaN(value)) return "Error";
  return String(value);
}

function pushHistoryEntry(history, expression, result) {
  if (result === "Error" || result === null || result === undefined) return history;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    expression,
    result: String(result),
    ts: Date.now(),
  };
  return [entry, ...history].slice(0, 30);
}

export function useCalculator(suppressKeyboard = false) {
  const [plan, setPlanState] = useState(loadPlan);
  const [state, setState] = useState(() => ({ ...INITIAL_STATE, history: loadHistory() }));

  const setPlan = useCallback((nextPlan) => {
    setPlanState(nextPlan);
    try {
      localStorage.setItem("calculatorPlan", nextPlan);
    } catch {
      /* ignore */
    }
  }, []);

  const clearAll = useCallback(() => {
    setState((prev) => ({ ...INITIAL_STATE, history: prev.history }));
  }, []);

  const inputDigit = useCallback((digit) => {
    setState((prev) => {
      if (prev.currentValue === "Error") {
        return { ...INITIAL_STATE, currentValue: digit, history: prev.history };
      }

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
      if (prev.currentValue === "Error") {
        return { ...INITIAL_STATE, currentValue: "0.", history: prev.history };
      }

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

      const expr = `${formatDisplay(prev.previousValue)} ${OP_SYMBOLS[prev.operator]} ${formatDisplay(String(currNum))}`;
      const historyLine = showHistory ? `${expr} =` : prev.historyLine;

      return {
        ...prev,
        historyLine,
        currentValue: result === "Error" ? "Error" : String(result),
        previousValue: "",
        operator: null,
        shouldResetDisplay: true,
        history: showHistory ? pushHistoryEntry(prev.history, expr, result) : prev.history,
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
        const normalized = normalizeResult(op.result);
        return {
          ...prev,
          currentValue: normalized,
          historyLine: `${op.label} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
          history: pushHistoryEntry(prev.history, op.label, normalized),
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
        const normalized = normalizeResult(op.result);
        return {
          ...prev,
          currentValue: normalized,
          historyLine: `${op.label} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
          history: pushHistoryEntry(prev.history, op.label, normalized),
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
        const normalized = normalizeResult(result);
        return {
          ...prev,
          currentValue: normalized,
          historyLine: `${expr} =`,
          shouldResetDisplay: true,
          operator: null,
          previousValue: "",
          history: pushHistoryEntry(prev.history, expr, normalized),
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

  const selectHistoryEntry = useCallback(
    (result) => {
      setState((prev) => ({
        ...prev,
        currentValue: normalizeResult(result),
        historyLine: "",
        shouldResetDisplay: true,
        operator: null,
        previousValue: "",
      }));
      setPlan("standard");
    },
    [setPlan]
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.currentValue === "Error" || prev.shouldResetDisplay) {
        return { ...INITIAL_STATE, history: prev.history };
      }

      const currentValue =
        prev.currentValue.length > 1 ? prev.currentValue.slice(0, -1) : "0";

      return { ...prev, currentValue, historyLine: "" };
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
        case "backspace":
          backspace();
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
        case "history-select":
          selectHistoryEntry(value);
          break;
        case "history-clear":
          clearHistory();
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
      backspace,
      toggleSign,
      percent,
      toggleAngleMode,
      applyFunction,
      applyUnary,
      insertParen,
      handleMemory,
      selectHistoryEntry,
      clearHistory,
    ]
  );

  useEffect(() => {
    try {
      localStorage.setItem("calculatorHistory", JSON.stringify(state.history));
    } catch {
      /* ignore */
    }
  }, [state.history]);

  useEffect(() => {
    const onKeyDown = (e) => {
      // While a History/Currency popup is open, let it own the keyboard
      // (e.g. Escape should close the popup, not clear the calculator).
      if (suppressKeyboard) return;

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
    suppressKeyboard,
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
