type TransitionKind = "diagonal" | "contour" | "shutter" | "simplify" | "settle" | "red" | "finish";

export function TransitionDivider({ kind, children }: { kind: TransitionKind; children?: React.ReactNode }) {
  return <div className={`section-bridge section-bridge--${kind}`} data-motion-bridge={kind} aria-hidden="true">
    <div className="bridge-surface bridge-surface--from" />
    <div className="bridge-surface bridge-surface--to" />
    <div className="bridge-ribbon" />
    {kind === "contour" && <svg className="bridge-contour" viewBox="0 0 1000 140" preserveAspectRatio="none">
      <path pathLength="1000" d="M0 108H112C166 108 191 94 219 62L250 28C263 14 276 10 296 10H531C558 10 581 21 602 45L644 85C662 102 695 108 753 108H1000" />
    </svg>}
    {children}
  </div>;
}
