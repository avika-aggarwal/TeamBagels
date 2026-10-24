// Frosted "glass slipper" panel. With `tilt`, it leans toward the pointer and a soft
// highlight follows it (driven by CSS variables --rx / --ry / --mx / --my).
export default function GlassCard({ as: Tag = 'section', tilt = false, className = '', children, ...rest }) {
  const onMove = (event) => {
    const { currentTarget: el, clientX, clientY } = event;
    const box = el.getBoundingClientRect();
    const px = (clientX - box.left) / box.width;
    const py = (clientY - box.top) / box.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };
  const onLeave = ({ currentTarget: el }) => ['--rx', '--ry'].forEach((name) => el.style.removeProperty(name));

  return (
    <Tag className={`glass ${tilt ? 'tilt' : ''} ${className}`} onPointerMove={tilt ? onMove : undefined} onPointerLeave={tilt ? onLeave : undefined} {...rest}>
      {children}
    </Tag>
  );
}
