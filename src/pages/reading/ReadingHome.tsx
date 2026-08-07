// src/pages/reading/ReadingHome.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Flame, Star, Gamepad2 } from 'lucide-react';
import { getLibrary, getReadingProgress, getCoverUrl, removeFromLibrary } from '../../utils/bookService';
import { useGame } from '../../contexts/GameContext';
import BookSearch from './BookSearch';
import BookReader from './BookReader';
import { Card } from '../../components/Card';
import './reading.css';

const LibraryView = () => {
  const [library, setLibrary] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const loadLibrary = () => {
    const books = getLibrary();
    const booksWithProgress = books.map(book => ({
      ...book,
      progress: getReadingProgress(book.key)
    }));
    setLibrary(booksWithProgress);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleRemove = (e, key) => {
    e.stopPropagation();
    if (window.confirm('Remove this book from your library?')) {
      removeFromLibrary(key);
      loadLibrary();
    }
  };

  const filteredLibrary = library.filter(book => {
    if (filter === 'All') return true;
    if (filter === 'Reading') return book.progress > 0 && book.progress < 100;
    if (filter === 'Completed') return book.progress >= 100;
    return true;
  });

  const readingCount = library.filter(b => b.progress > 0 && b.progress < 100).length;
  const completedCount = library.filter(b => b.progress >= 100).length;

  return (
    <div className="library-view" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/reading')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
        <h2 style={{ margin: 0 }}>My Library</h2>
      </div>

      <div className="reading-stats">
        <div className="stat-card">
          <span className="stat-value">{readingCount}</span>
          <span className="stat-label">Reading</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="filter-tabs">
        {['All', 'Reading', 'Completed'].map(tab => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredLibrary.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-icon" size={64} />
          <p>Your library is empty!</p>
          <p className="empty-subtitle">Tap + to find books</p>
        </div>
      ) : (
        <div className="books-grid">
          {filteredLibrary.map(book => (
            <Card
              key={book.key}
              className="book-card"
              onClick={() => navigate(`/reading/read/${encodeURIComponent(book.key)}`)}
              ariaLabel={`Read ${book.title}`}
            >
              <button
                className="remove-btn"
                onClick={(e) => handleRemove(e, book.key)}
                title="Remove book"
              >
                <Trash2 size={16} />
              </button>
              <div className="book-cover">
                {book.coverId ? (
                  <img src={getCoverUrl(book.coverId, 'M') || undefined} alt={book.title} />
                ) : (
                  <div className="cover-placeholder"><span>{book.title}</span></div>
                )}
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                {book.progress > 0 && (
                  <div className="progress-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(book.progress, 100)}%` }} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => navigate('/reading/search')}>
        <Plus size={24} />
      </button>
    </div>
  );
};

const ReadingDashboard = () => {
  const navigate = useNavigate();
  const { level, streak, booksReading, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'learn' | 'play'>('play');

  return (
    <div className="reading-module-page">
      {/* Navigation Header */}
      <div className="reading-nav-header">
        <div className="reading-header-left">
          <button className="reading-back-btn" onClick={() => navigate('/')} title="Back to Home">←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #b85c1e 0%, #e07c3e 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(224,124,62,0.3)'
            }}>
              📖
            </div>
            <h1 className="reading-page-title" style={{ margin: 0, color: '#d16f2c', fontSize: '1.4rem', fontWeight: 900 }}>
              Reading
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#fafafa', padding: '5px 9px', borderRadius: 12,
          border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak ?? 0}</span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#f57f17' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#f1f3f5',
        padding: '4px',
        borderRadius: 14,
        marginBottom: 20
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#ffffff' : 'transparent',
            color: tab === 'play' ? '#d16f2c' : '#6c757d',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: tab === 'play' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Gamepad2 size={16} color={tab === 'play' ? '#d16f2c' : '#6c757d'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#ffffff' : 'transparent',
            color: tab === 'learn' ? '#d16f2c' : '#6c757d',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: tab === 'learn' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={16} color={tab === 'learn' ? '#d16f2c' : '#6c757d'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learn Modes */}
          <h2 className="reading-section-heading">Books & Library</h2>
          <div className="reading-card-list">
            <Card className="reading-card-item" onClick={() => navigate('library')} ariaLabel="My Library">
              <div className="reading-card-icon">📚</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">My Library</h3>
                <p className="reading-card-subtitle">{booksReading || 0} books in progress</p>
              </div>
              <div className="reading-card-arrow">→</div>
            </Card>

            <Card className="reading-card-item" onClick={() => navigate('search')} ariaLabel="Book Search">
              <div className="reading-card-icon">🔍</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">Book Search</h3>
                <p className="reading-card-subtitle">Find new books & classic novels to read</p>
              </div>
              <div className="reading-card-arrow">→</div>
            </Card>
          </div>

          {/* Locked Learn Modes */}
          <h2 className="reading-section-heading">Community (Locked)</h2>
          <div className="reading-card-list">
            <Card className="reading-card-item locked" ariaLabel="Reading Clubs (Locked)" onClick={() => {}}>
              <div className="reading-card-icon">👥</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">Reading Clubs</h3>
                <p className="reading-card-subtitle">Join community book chats & discussions</p>
              </div>
              <div className="reading-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Locked Play & Earn Modes */}
          <h2 className="reading-section-heading">Earn XP & Reading Challenges (Locked)</h2>
          <div className="reading-card-list">
            <Card className="reading-card-item locked" ariaLabel="Comprehension Quiz (Locked)" onClick={() => {}}>
              <div className="reading-card-icon">🎯</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">Comprehension Quiz</h3>
                <p className="reading-card-subtitle">Test chapter understanding & earn XP</p>
              </div>
              <div className="reading-lock-badge">🔒 Locked</div>
            </Card>

            <Card className="reading-card-item locked" ariaLabel="Speed Reading (Locked)" onClick={() => {}}>
              <div className="reading-card-icon">⚡</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">Speed Reading</h3>
                <p className="reading-card-subtitle">Accelerate reading pace under time limit</p>
              </div>
              <div className="reading-lock-badge">🔒 Locked</div>
            </Card>

            <Card className="reading-card-item locked" ariaLabel="Vocabulary Builder (Locked)" onClick={() => {}}>
              <div className="reading-card-icon">🔖</div>
              <div className="reading-card-info">
                <h3 className="reading-card-title">Vocabulary Builder</h3>
                <p className="reading-card-subtitle">Learn context-based words & solve challenges</p>
              </div>
              <div className="reading-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const ReadingHome = () => {
  return (
    <Routes>
      <Route path="/" element={<ReadingDashboard />} />
      <Route path="/library" element={<LibraryView />} />
      <Route path="/search" element={<BookSearch />} />
      <Route path="/read/:bookKey" element={<BookReader />} />
    </Routes>
  );
};

export default ReadingHome;
