// Round emoji avatar with a gold ring; verified users get a sparkling check.
export default function Avatar({ emoji, verified = false, size = 44 }) {
  return (
    <span className="avatar" style={{ '--size': `${size}px` }}>
      {emoji}
      {verified && <i className="avatar-check" title="Community verified">✓</i>}
    </span>
  );
}
