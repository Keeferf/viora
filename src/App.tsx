import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingScreen, MainScreen, PrivacyScreen, TermsScreen } from './components/screens';
import './index.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/preflight/:roomCode" element={<MainScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;