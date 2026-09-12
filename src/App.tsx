import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingScreen, PreflightScreen, SessionScreen, PrivacyScreen, TermsScreen } from './components/screens';
import { useSettingsStore } from './store/useSettingsStore';
import './index.css';

function App() {
  const theme = useSettingsStore(state => state.theme);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/preflight/:roomId" element={<PreflightScreen />} />
        <Route path="/session/:roomCode" element={<SessionScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;