import { useState, useEffect, useCallback } from "react";
import { EngPanel, EngLabel, EngInput, EngSelect } from "./shared/ToolUI";
import {
  POPULAR_CURRENCIES,
  CURRENCY_CODES,
  fetchRates,
  formatRateTimestamp,
} from "../utils/currency";

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
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);

  const loadRates = useCallback(async (base, { bustCache = false } = {}) => {
    setStatus((prev) => (prev === "idle" ? "refreshing" : "loading"));
    setErrorMessage(null);

    try {
      const result = await fetchRates(base, { bustCache });
      setRates(result.rates);
      setRateUpdatedAt(result.rateUpdatedAt);
      setFetchedAt(result.fetchedAt);
      setStatus("idle");
    } catch {
      setStatus((prev) => (prev === "refreshing" ? "idle" : "error"));
      setErrorMessage("Couldn't reach the exchange rate service. Check your connection and try again.");
    }
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
  const hasRate = rates && rate !== undefined;
  const converted =
    hasRate && !isNaN(numericAmount) ? numericAmount * rate : null;

  const swap = () => setPair((prev) => ({ from: prev.to, to: prev.from }));
  const refresh = () => loadRates(from, { bustCache: true });

  const isInitialLoad = status === "loading";
  const isRefreshing = status === "refreshing";

  return (
    <div className="engineering-toolkit currency-toolkit">
      <div className="eng-header">
        <span className="eng-badge currency-badge">Currency</span>
        <p className="eng-desc">Live market exchange rates</p>
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
        {isInitialLoad && <div className="currency-status">Fetching latest rates…</div>}

        {status === "error" && !rates && (
          <div className="eng-error">{errorMessage}</div>
        )}

        {!isInitialLoad && rates && (
          <>
            {hasRate && converted !== null ? (
              <>
                <EngLabel>Converted amount</EngLabel>
                <div className="currency-result">
                  {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
                </div>
                <div className="eng-sub">
                  1 {from} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
                </div>
              </>
            ) : (
              <div className="eng-error">
                No rate available for {to}. Try another currency pair.
              </div>
            )}

            <div className="currency-meta">
              {rateUpdatedAt && (
                <div className="currency-meta-line">
                  <span className="currency-meta-label">Market rate date</span>
                  <span>{formatRateTimestamp(rateUpdatedAt)}</span>
                </div>
              )}
              {fetchedAt && (
                <div className="currency-meta-line">
                  <span className="currency-meta-label">Last refreshed</span>
                  <span className={isRefreshing ? "currency-meta-updating" : ""}>
                    {isRefreshing ? "Updating…" : formatRateTimestamp(fetchedAt)}
                  </span>
                </div>
              )}
            </div>

            {errorMessage && status === "idle" && (
              <div className="eng-error currency-refresh-error">{errorMessage}</div>
            )}
          </>
        )}
      </EngPanel>

      <button
        type="button"
        className="eng-add-btn currency-refresh-btn"
        onClick={refresh}
        disabled={isInitialLoad || isRefreshing}
      >
        ⟳ {isRefreshing ? "Refreshing…" : "Refresh rates"}
      </button>
    </div>
  );
}
