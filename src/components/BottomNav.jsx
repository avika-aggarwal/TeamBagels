// Bottom tab bar with a floating gold wand in the middle for Capture
// (the Scan screen is part of the capture flow, so the wand stays lit on it too).
import { useApp } from '../state/AppContext';

const TABS = [
  { id: 'realm', icon: '🔮', label: 'Realm' },
  { id: 'ghost', icon: '👻', label: 'Haunts' },
  { id: 'capture', icon: '🪄', label: 'Capture', center: true },
  { id: 'community', icon: '🧙', label: 'Circle' },
  { id: 'profile', icon: '👑', label: 'Me' },
];

export default function BottomNav() {
  const { route, navigate } = useApp();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(({ id, icon, label, center }) => {
        const active = route === id || (center && route === 'scan');
        return (
          <button key={id} className={`nav-tab ${center ? 'center' : ''} ${active ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={active ? 'page' : undefined}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
