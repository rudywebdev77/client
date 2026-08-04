import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CompanyProvider } from './context/CompanyContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

const ThemedToaster = () => {
  const { isDarkMode } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: isDarkMode
          ? {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
          }
          : {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
            fontSize: '13px',
            fontWeight: 500,
          },
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <AuthProvider>
          <BrowserRouter>
            <WebSocketProvider>
              <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased">
                <ThemedToaster />
                <AppRoutes />
              </div>
            </WebSocketProvider>
          </BrowserRouter>
        </AuthProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}

export default App;
