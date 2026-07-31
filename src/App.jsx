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
import Leaderboard from './pages/Leaderboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import './index.css';

// Placeholder components for new routes
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>Coming Soon!</p>
  </div>
);

import { Home as HomeIcon, Trophy, Store, User } from 'lucide-react';

function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const showNavPaths = ['/', '/leaderboards', '/store', '/profile'];
  if (!user || !showNavPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={location.pathname === '/' ? 'active' : ''}>
        <HomeIcon size={24} />
        <span style={{ marginTop: '4px' }}>Home</span>
      </NavLink>
      <NavLink to="/leaderboards" className={location.pathname === '/leaderboards' ? 'active' : ''}>
        <Trophy size={24} />
        <span style={{ marginTop: '4px' }}>Rank</span>
      </NavLink>
      <NavLink to="/store" className={location.pathname === '/store' ? 'active' : ''}>
        <Store size={24} />
        <span style={{ marginTop: '4px' }}>Store</span>
      </NavLink>
      <NavLink to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
        <User size={24} />
        <span style={{ marginTop: '4px' }}>Me</span>
      </NavLink>
    </nav>
  );
}

function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const showNavPaths = ['/', '/leaderboards', '/store', '/profile'];
  const showNav = user && showNavPaths.includes(location.pathname);

  return (
    <div style={{ paddingBottom: showNav ? '65px' : '0', minHeight: '100vh', boxSizing: 'border-box' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/leaderboards" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><Placeholder title="Jemz Store" /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chess/*" element={<ProtectedRoute><ChessHome /></ProtectedRoute>} />
        <Route path="/geo/*" element={<ProtectedRoute><GeoHome /></ProtectedRoute>} />
        <Route path="/reading/*" element={<ProtectedRoute><ReadingHome /></ProtectedRoute>} />
        <Route path="/space/*" element={<ProtectedRoute><SpaceHome /></ProtectedRoute>} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Layout />
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
