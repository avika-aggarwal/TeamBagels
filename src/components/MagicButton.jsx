// Shimmering call-to-action button. variant: "primary" (gold) | "ghost" (outlined).
export default function MagicButton({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button className={`magic-btn ${variant} ${className}`} {...rest}>
      <span>{children}</span>
    </button>
  );
}
