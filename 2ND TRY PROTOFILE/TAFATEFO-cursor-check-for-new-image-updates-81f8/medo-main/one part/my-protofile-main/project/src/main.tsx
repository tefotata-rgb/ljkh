import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import DocumentTitle from './components/DocumentTitle';
import AppRoutes from './AppRoutes';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <DocumentTitle />
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
