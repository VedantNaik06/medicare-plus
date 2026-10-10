import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import './i18n/index.js';
import './utils/textSize.js';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const toastStyle = {
  borderRadius: '999px',
  padding: '12px 18px',
  fontWeight: 600,
  color: '#0f2a2e',
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #d3f3ed',
  boxShadow: '0 10px 30px rgba(15,42,46,0.12)',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* reducedMotion="user": animations switch off for people who asked their device for less motion */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: toastStyle,
              success: { iconTheme: { primary: '#14807a', secondary: '#fff' } },
              error: { iconTheme: { primary: '#c0392b', secondary: '#fff' }, duration: 5000 },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
);
