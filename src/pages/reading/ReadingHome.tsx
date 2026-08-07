// src/pages/reading/ReadingHome.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Flame, Star, Gamepad2, ArrowLeft, Lock } from 'lucide-react';
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
    <div className="library-view" style={{ background: 'var(--color-bg-page)', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => navigate('/reading')}
          title="Back to Reading"
          aria-label="Back to Reading"
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
            flexShrink: 0
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.4rem', color: '#0f3825', fontWeight: 800 }}>My Library</h2>
      </div>

      <div className="filter-chips" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {['All', 'Reading', 'Completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              border: filter === f ? '2px solid #16653e' : '2px solid #b0cbaf',
              background: filter === f ? '#16653e' : '#ffffff',
              color: filter === f ? '#ffffff' : '#4e7361',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {f} {f === 'All' ? `(${library.length})` : f === 'Reading' ? `(${readingCount})` : `(${completedCount})`}
          </button>
        ))}
      </div>

      <div className="book-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filteredLibrary.map(book => (
          <div
            key={book.key}
            onClick={() => navigate(`/reading/read/${encodeURIComponent(book.key)}`)}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '2px solid #b0cbaf',
              boxShadow: '0 4px 0 #b0cbaf',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <div style={{ height: 120, background: '#e1f0e2', borderRadius: 10, overflow: 'hidden', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={getCoverUrl(book.cover_i)}
                alt={book.title}
                style={{ height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <BookOpen size={32} color="#16653e" />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f3825', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#4e7361', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16653e' }}>
                {book.progress || 0}% Read
              </span>
              <button
                onClick={(e) => handleRemove(e, book.key)}
                style={{ background: 'transparent', border: 'none', color: '#e53935', cursor: 'pointer', padding: 4 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReadingDashboard = () => {
  const navigate = useNavigate();
  const { level, streak, booksReading, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'play' | 'learn'>('play');

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
        marginBottom: 18
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
            margin: '0 0 12px 0', color: '#0f3825', fontWeight: 800
          }}>
            Books & Library
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card 
              className="reading-card-item" 
              onClick={() => navigate('library')} 
              ariaLabel="My Library"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
                textDecoration: 'none', color: '#fff',
                background: '#d16f2c', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #8c4212',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '1.6rem', width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                📚
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>My Library</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Books in progress</p>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>→</div>
            </Card>

            <Card 
              className="reading-card-item" 
              onClick={() => navigate('search')} 
              ariaLabel="Book Search"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
                textDecoration: 'none', color: '#fff',
                background: '#d16f2c', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #8c4212',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '1.6rem', width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                🔍
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Book Search</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Find classic novels</p>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>→</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Placeholder Play & Earn Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 12px 0', color: '#0f3825', fontWeight: 800
          }}>
            Earn XP & Streaks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#ffffff', borderRadius: 16,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '12px 16px', position: 'relative', overflow: 'hidden',
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
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.6rem', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 12, flexShrink: 0
                }}>
                  📖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>Reading Quiz</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Answer story questions for XP</p>
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
