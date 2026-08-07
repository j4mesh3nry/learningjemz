/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext.jsx';
import { GameProvider } from './contexts/GameContext.jsx';
import Home from './pages/Home.tsx';
import SplashScreen from './components/SplashScreen.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './index.css';

import { Home as HomeIcon, Trophy, Store, User } from 'lucide-react';

// Lazy-loaded heavy routes for code-splitting
const Profile = lazy(() => import('./pages/Profile.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Leaderboard = lazy(() => import('./pages/Leaderboard.tsx'));
const StorePage = lazy(() => import('./pages/Store.tsx'));
const ChessHome = lazy(() => import('./pages/chess/ChessHome.tsx'));
const GeoHome = lazy(() => import('./pages/geo/GeoHome.tsx'));
const ReadingHome = lazy(() => import('./pages/reading/ReadingHome.tsx'));
const SpaceHome = lazy(() => import('./pages/space/SpaceHome.tsx'));



// Loading spinner for Suspense fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', color: 'var(--color-primary)', fontWeight: 'bold',
    fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
  }}>
    Loading...
  </div>
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const showNavPaths = ['/', '/leaderboards', '/store', '/profile'];
  const showNav = user && showNavPaths.includes(location.pathname);



  return (
    <div style={{ paddingBottom: showNav ? '74px' : '0', minHeight: '100vh', boxSizing: 'border-box' }}>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/leaderboards" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/chess/*" element={<ProtectedRoute><ChessHome /></ProtectedRoute>} />
            <Route path="/geo/*" element={<ProtectedRoute><GeoHome /></ProtectedRoute>} />
            <Route path="/reading/*" element={<ProtectedRoute><ReadingHome /></ProtectedRoute>} />
            <Route path="/space/*" element={<ProtectedRoute><SpaceHome /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
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

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}
