import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.jsx'
import './i18n'

const reactRootElementId = window.reactRootId || 'root'; // Get the dynamic ID or fallback to 'root'

const rootElement = document.getElementById(reactRootElementId);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error(`Root element with ID '${reactRootElementId}' not found.`);
}
