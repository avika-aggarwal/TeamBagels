// Shared screen title block: shimmering display title, subtitle and optional right-side slot.
export default function ScreenHeader({ title, subtitle, children }) {
  return (
    <header className="screen-header">
      <div>
        <h2 className="shimmer-text">{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </header>
  );
}
