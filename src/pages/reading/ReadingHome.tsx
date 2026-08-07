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
          <button 
            onClick={() => navigate('/')} 
            title="Back to Home"
            aria-label="Back to Home"
            style={{
              background: '#ffffff',
              border: '2px solid #b0cbaf',
              boxShadow: '0 3px 0 #b0cbaf',
              borderRadius: 14,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16653e',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#d16f2c', borderRadius: 10,
              boxShadow: '0 2px 0 #8c4212'
            }}>
              📖
            </div>
            <h1 className="reading-page-title" style={{ margin: 0, color: '#0f3825', fontSize: '1.4rem', fontWeight: 900 }}>
              Reading
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#ffffff', padding: '5px 9px', borderRadius: 12,
          border: '2px solid #b0cbaf', boxShadow: '0 2px 0 #b0cbaf',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#4e7361' }}>{streak ?? 0}</span>
          </div>
          <div style={{ height: 1, background: '#b0cbaf', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#d97706' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#ffffff',
        padding: '4px',
        borderRadius: 14,
        border: '2px solid #b0cbaf',
        boxShadow: '0 3px 0 #b0cbaf',
        marginBottom: 20
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#16653e' : 'transparent',
            color: tab === 'play' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Gamepad2 size={16} color={tab === 'play' ? '#ffffff' : '#4e7361'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#16653e' : 'transparent',
            color: tab === 'learn' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={16} color={tab === 'learn' ? '#ffffff' : '#4e7361'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learn Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 14px 0', color: '#0f3825', fontWeight: 800
          }}>
            Books & Library
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card 
              className="reading-card-item" 
              onClick={() => navigate('library')} 
              ariaLabel="My Library"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
                textDecoration: 'none', color: '#fff',
                background: '#d16f2c', borderRadius: 20,
                padding: '18px 18px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 5px 0 #8c4212',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '2rem', width: 50, height: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 14,
                flexShrink: 0
              }}>
                📚
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>My Library</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', opacity: 0.9, fontWeight: 500 }}>{booksReading || 0} books in progress</p>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>→</div>
            </Card>

            <Card 
              className="reading-card-item" 
              onClick={() => navigate('search')} 
              ariaLabel="Book Search"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
                textDecoration: 'none', color: '#fff',
                background: '#d16f2c', borderRadius: 20,
                padding: '18px 18px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 5px 0 #8c4212',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '2rem', width: 50, height: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 14,
                flexShrink: 0
              }}>
                🔍
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Book Search</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', opacity: 0.9, fontWeight: 500 }}>Find new books & classic novels to read</p>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>→</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Placeholder Play & Earn Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 14px 0', color: '#0f3825', fontWeight: 800
          }}>
            Earn XP & Streaks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#ffffff', borderRadius: 20,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '18px', position: 'relative', overflow: 'hidden',
              cursor: 'not-allowed'
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 10, background: '#16653e', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800,
                padding: '6px 12px', borderRadius: 12, border: '1.5px solid #0e4329', boxShadow: '0 3px 0 #0e4329',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
              }}>
                <Lock size={12} color="#ffffff" /> Locked
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.8rem', width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 14, flexShrink: 0
                }}>
                  📖
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825' }}>Reading Comprehension Quiz</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500 }}>Answer story questions for XP</p>
                </div>
              </div>
            </div>
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
