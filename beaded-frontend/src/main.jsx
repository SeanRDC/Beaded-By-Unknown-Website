import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { startAnalytics } from './analytics.js';
import ErrorBoundary from './ErrorBoundary.jsx';
import './index.css';
import { installFieldErrors } from './lib/fieldErrors.js';
import Site from './Site.jsx';

const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'));

function savedTheme() {
  try {
    return JSON.parse(localStorage.getItem('beaded_settings') || '{}').theme || 'brown';
  } catch {
    return 'brown';
  }
}

/* Set before the first paint, so a returning visitor never sees the wrong theme flash. */
document.documentElement.dataset.theme = savedTheme();

startAnalytics();
installFieldErrors();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
          <Route path="/*" element={<Site />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
