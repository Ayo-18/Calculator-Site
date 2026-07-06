export function HudCorners({ color = "#3ddcc1" }) {
  const style = {
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: color,
  };

  return (
    <div className="hud-corners" aria-hidden="true">
      <span style={{ ...style, top: -1, left: -1, borderTop: "2px solid", borderLeft: "2px solid" }} />
      <span style={{ ...style, top: -1, right: -1, borderTop: "2px solid", borderRight: "2px solid" }} />
      <span
        style={{ ...style, bottom: -1, left: -1, borderBottom: "2px solid", borderLeft: "2px solid" }}
      />
      <span
        style={{ ...style, bottom: -1, right: -1, borderBottom: "2px solid", borderRight: "2px solid" }}
      />
    </div>
  );
}
