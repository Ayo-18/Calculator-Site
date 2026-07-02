export function Display({ expression, preview, result, memoryActive }) {
  const shrink = result.length > 12;

  return (
    <>
      <div className="display">
        <div className="expression">{expression}</div>
        <div className={`preview${preview ? " visible" : ""}`} aria-live="polite">
          {preview}
        </div>
        <div className={`result${shrink ? " shrink" : ""}`}>{result}</div>
      </div>
      <div className={`memory-bar${memoryActive ? " active" : ""}`}>M</div>
    </>
  );
}
