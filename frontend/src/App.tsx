import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

import { SocketProvider } from './contexts/SocketContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Board } from './pages/Board';
import { Settings } from './pages/Settings';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import './index.css';

console.log('App starting...');

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <SettingsProvider>
            <BrowserRouter>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/settings/*" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </BrowserRouter>
          </SettingsProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
