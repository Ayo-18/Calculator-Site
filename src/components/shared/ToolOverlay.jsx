import { useEffect } from "react";
import { createPortal } from "react-dom";

// Renders as a centered modal on desktop and as a slide-up bottom sheet on
// phones — the breakpoint is handled entirely in CSS so it always matches
// whatever layout the rest of the calculator is using.
//
// This is rendered via a portal straight into <body>. The calculator card
// has `backdrop-filter` on it, and CSS makes any element with a filter the
// positioning container for `position: fixed` descendants — so without the
// portal this overlay would get trapped inside the calculator's own layout
// instead of floating above it as a true full-screen popup.
export function ToolOverlay({ onClose, children }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="tool-overlay-backdrop" onClick={onClose}>
      <div
        className="tool-overlay"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tool-overlay-handle" aria-hidden="true" />
        <button
          type="button"
          className="tool-overlay-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="tool-overlay-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
