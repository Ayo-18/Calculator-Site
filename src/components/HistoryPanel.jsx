import { EngPanel } from "./shared/ToolUI";

function formatTime(ts) {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPanel({ history, onAction }) {
  return (
    <div className="engineering-toolkit history-toolkit">
      <div className="eng-header">
        <span className="eng-badge history-badge">History</span>
        <p className="eng-desc">Your recent calculations — tap one to reuse it</p>
      </div>

      {history.length === 0 ? (
        <EngPanel>
          <div className="history-empty">No calculations yet. Your history will appear here.</div>
        </EngPanel>
      ) : (
        <>
          <div className="history-list">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                className="history-item"
                onClick={() => onAction("history-select", item.result)}
              >
                <div className="history-expr">{item.expression}</div>
                <div className="history-result">= {item.result}</div>
                <div className="history-time">{formatTime(item.ts)}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="eng-add-btn history-clear-btn"
            onClick={() => onAction("history-clear")}
          >
            Clear history
          </button>
        </>
      )}
    </div>
  );
}
