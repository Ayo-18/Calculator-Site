import { useState, useEffect, useCallback } from "react";
import { EngPanel, EngLabel, EngInput, EngSelect } from "./shared/ToolUI";
import { POPULAR_CURRENCIES, CURRENCY_CODES, fetchRates } from "../utils/currency";

const CURRENCY_OPTIONS = POPULAR_CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.code} — ${c.name}`,
}));

function loadPair() {
  try {
    const saved = JSON.parse(localStorage.getItem("calculatorCurrencyPair"));
    if (saved && CURRENCY_CODES.includes(saved.from) && CURRENCY_CODES.includes(saved.to)) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return { from: "USD", to: "NGN" };
}

export function CurrencyConverter() {
  const [{ from, to }, setPair] = useState(loadPair);
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState(null);
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("loading");

  const loadRates = useCallback((base) => {
    setStatus("loading");
    fetchRates(base)
      .then(({ rates: r, date: d }) => {
        setRates(r);
        setDate(d);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadRates(from);
  }, [from, loadRates]);

  useEffect(() => {
    try {
      localStorage.setItem("calculatorCurrencyPair", JSON.stringify({ from, to }));
    } catch {
      /* ignore */
    }
  }, [from, to]);

  const numericAmount = parseFloat(amount);
  const rate = rates ? rates[to] : null;
  const converted =
    rates && rate !== undefined && !isNaN(numericAmount) ? numericAmount * rate : null;

  const swap = () => setPair((prev) => ({ from: prev.to, to: prev.from }));

  return (
    <div className="engineering-toolkit currency-toolkit">
      <div className="eng-header">
        <span className="eng-badge currency-badge">Currency</span>
        <p className="eng-desc">Live market exchange rates, updated daily</p>
      </div>

      <div className="eng-field">
        <EngLabel>Amount</EngLabel>
        <EngInput value={amount} onChange={setAmount} placeholder="0" />
      </div>

      <div className="currency-pair-row">
        <div className="eng-field">
          <EngLabel>From</EngLabel>
          <EngSelect
            value={from}
            onChange={(v) => setPair((prev) => ({ ...prev, from: v }))}
            options={CURRENCY_OPTIONS}
          />
        </div>
        <button
          type="button"
          className="currency-swap-btn"
          onClick={swap}
          aria-label="Swap currencies"
        >
          ⇄
        </button>
        <div className="eng-field">
          <EngLabel>To</EngLabel>
          <EngSelect
            value={to}
            onChange={(v) => setPair((prev) => ({ ...prev, to: v }))}
            options={CURRENCY_OPTIONS}
          />
        </div>
      </div>

      <EngPanel>
        {status === "loading" && <div className="currency-status">Fetching latest rates…</div>}
        {status === "error" && (
          <div className="eng-error">
            Couldn't reach the exchange rate service. Check your connection and try again.
          </div>
        )}
        {status === "idle" && converted !== null && (
          <>
            <EngLabel>Converted amount</EngLabel>
            <div className="currency-result">
              {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
            </div>
            <div className="eng-sub">
              1 {from} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
              {date ? ` · updated ${date}` : ""}
            </div>
          </>
        )}
      </EngPanel>

      <button
        type="button"
        className="eng-add-btn currency-refresh-btn"
        onClick={() => loadRates(from)}
      >
        ⟳ Refresh rates
      </button>
    </div>
  );
}
