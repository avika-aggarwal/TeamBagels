// Selectable pill used for category and radius filters. `color` tints its glow.
export default function Chip({ active, color, children, ...rest }) {
  return (
    <button className={`chip ${active ? 'active' : ''}`} style={{ '--chip': color }} aria-pressed={active} {...rest}>
      {children}
    </button>
  );
}
