/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import ChessHome from './pages/chess/ChessHome.jsx';
import GeoHome from './pages/geo/GeoHome.jsx';
import ReadingHome from './pages/reading/ReadingHome.jsx';
import SpaceHome from './pages/space/SpaceHome.jsx';
import './index.css';

function BottomNav() {
  const location = useLocation();
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

export default function App() {
  return (
    <Router>
      <div style={{ paddingBottom: '56px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chess/*" element={<ChessHome />} />
          <Route path="/geo/*" element={<GeoHome />} />
          <Route path="/reading/*" element={<ReadingHome />} />
          <Route path="/space/*" element={<SpaceHome />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}
