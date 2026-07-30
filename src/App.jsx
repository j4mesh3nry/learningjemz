/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import ChessHome from './pages/chess/ChessHome.jsx';
import GeoHome from './pages/geo/GeoHome.jsx';
import ReadingHome from './pages/reading/ReadingHome.jsx';
import SpaceHome from './pages/space/SpaceHome.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import './index.css';

function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={location.pathname === '/' ? 'active' : ''}>
        <span role="img" aria-label="home">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/chess" className={location.pathname.startsWith('/chess') ? 'active' : ''}>
        <span role="img" aria-label="chess">♟️</span>
        <span>Chess</span>
      </NavLink>
      <NavLink to="/geo" className={location.pathname.startsWith('/geo') ? 'active' : ''}>
        <span role="img" aria-label="geo">🌍</span>
        <span>Geo</span>
      </NavLink>
      <NavLink to="/reading" className={location.pathname.startsWith('/reading') ? 'active' : ''}>
        <span role="img" aria-label="reading">📖</span>
        <span>Read</span>
      </NavLink>
      <NavLink to="/space" className={location.pathname.startsWith('/space') ? 'active' : ''}>
        <span role="img" aria-label="space">🪐</span>
        <span>Space</span>
      </NavLink>
      <NavLink to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
        <span role="img" aria-label="profile">👤</span>
        <span>Me</span>
      </NavLink>
    </nav>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <div style={{ paddingBottom: '56px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chess/*" element={<ProtectedRoute><ChessHome /></ProtectedRoute>} />
          <Route path="/geo/*" element={<ProtectedRoute><GeoHome /></ProtectedRoute>} />
          <Route path="/reading/*" element={<ProtectedRoute><ReadingHome /></ProtectedRoute>} />
          <Route path="/space/*" element={<ProtectedRoute><SpaceHome /></ProtectedRoute>} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

import { GameProvider } from './contexts/GameContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}
