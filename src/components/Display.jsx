import { HudCorners } from "./shared/HudCorners";

export function Display({ expression, preview, result, memoryActive }) {
  const shrink = result.length > 12;

  return (
    <>
      <div className="display hud-display">
        <HudCorners color="#e8a33d" />
        <div className="expression">{expression}</div>
        <div className={`preview hud-preview${preview ? " visible" : ""}`} aria-live="polite">
          {preview ? `RESULT ${preview}` : ""}
        </div>
        <div className={`result hud-result${shrink ? " shrink" : ""}`}>{result}</div>
      </div>
      <div className={`memory-bar hud-memory${memoryActive ? " active" : ""}`}>M</div>
    </>
  );
}
