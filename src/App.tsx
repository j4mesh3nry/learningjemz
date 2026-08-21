/* src/App.tsx */
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext.jsx';
import { GameProvider } from './contexts/GameContext.jsx';
import Home from './pages/Home.tsx';
import SplashScreen from './components/SplashScreen.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './index.css';

import { Home as HomeIcon, Trophy, Store, User } from 'lucide-react';

// Lazy-loaded heavy routes for code-splitting
const Profile = lazy(() => import('./pages/Profile.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Leaderboard = lazy(() => import('./pages/Leaderboard.tsx'));
const StorePage = lazy(() => import('./pages/Store.tsx'));
const ChessHome = lazy(() => import('./pages/chess/ChessHome.tsx'));
const SpaceHome = lazy(() => import('./pages/space/SpaceHome.tsx'));

import JemzLoader from './components/JemzLoader';
import { preloadSpaceObjectImages } from './data/space-objects';

// Loading spinner for Suspense fallback
const LoadingFallback = () => (
  <JemzLoader message="Loading LearningJemz..." subtext="Preparing your experience" fullScreen={true} />
);

function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const showNavPaths = ['/', '/leaderboards', '/store', '/profile'];
  if (!user || !showNavPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const showNavPaths = ['/', '/leaderboards', '/store', '/profile'];
  const showNav = user && showNavPaths.includes(location.pathname);

  useEffect(() => {
    const isChess = location.pathname.startsWith('/chess');
    const isSpace = location.pathname.startsWith('/space');
    const theme = isChess ? 'chess' : isSpace ? 'space' : 'home';

    document.body.dataset.moduleTheme = theme;
    document.documentElement.dataset.moduleTheme = theme;

    if (!isChess && !isSpace) {
      document.body.dataset.homeDark = 'true';
      document.documentElement.dataset.homeDark = 'true';
    } else {
      delete document.body.dataset.homeDark;
      delete document.documentElement.dataset.homeDark;
    }
  }, [location.pathname]);

  return (
    <div style={{ paddingBottom: showNav ? 'calc(88px + env(safe-area-inset-bottom, 12px))' : '0', minHeight: '100vh', boxSizing: 'border-box' }}>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/leaderboards" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/chess/*" element={<ProtectedRoute><ChessHome /></ProtectedRoute>} />
          <Route path="/space/*" element={<ProtectedRoute><SpaceHome /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen only on fresh session
    const hasSeenSplash = sessionStorage.getItem('learningjemz_splash_shown');
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('learningjemz_splash_shown', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    preloadSpaceObjectImages();
  }, []);

  return (
    <AuthProvider>
      <GameProvider>
        {showSplash ? (
          <SplashScreen onFinish={handleSplashComplete} />
        ) : (
          <Router>
            <Layout />
          </Router>
        )}
      </GameProvider>
    </AuthProvider>
  );
}
