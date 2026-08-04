import { useEffect, useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggle = () => setDarkMode(prev => !prev);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h2 className="text-center" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h2>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={toggle}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
