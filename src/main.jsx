// App bootstrap: loads global styles, wraps the tree in the state provider and mounts it.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './state/AppContext';
import './styles/theme.css';
import './styles/components.css';
import './styles/screens.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
