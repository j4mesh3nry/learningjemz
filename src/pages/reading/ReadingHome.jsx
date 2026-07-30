import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, Trash2 } from 'lucide-react';
import { getLibrary, getReadingProgress, getCoverUrl, removeFromLibrary } from '../../utils/bookService';
import { useGame } from '../../contexts/GameContext';
import BookSearch from './BookSearch';
import BookReader from './BookReader';
import { BookOpen, Search, Library, Zap, Target, BookMarked, Brain, ChevronRight } from 'lucide-react';
import './reading.css';

const LibraryView = () => {
  const [library, setLibrary] = useState([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const loadLibrary = () => {
    const books = getLibrary();
    // Attach progress to books
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
            <div 
              key={book.key} 
              className="book-card" 
              onClick={() => navigate(`/reading/read/${encodeURIComponent(book.key)}`)}
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
                  <img src={getCoverUrl(book.coverId, 'M')} alt={book.title} />
                ) : (
                  <div className="cover-placeholder">
                    <span>{book.title}</span>
                  </div>
                )}
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                {book.progress > 0 && (
                  <div className="progress-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min(book.progress, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
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
  const { xp, level, streak, booksReading, readingMinutes } = useGame();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1f1c2c, #928dab)',
      minHeight: '100vh',
      color: '#fff',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0 8px 0 0' }}>←</button>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>📖 Reading Hub</h1>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        marginBottom: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🔥</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{streak}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Streak</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🎓</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Lv.{level}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Level</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>✨</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{xp}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>XP</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
        <h2 style={{ color: '#fff', margin: '0', fontSize: '1.2rem', fontWeight: 600 }}>Curriculum</h2>

        <div onClick={() => navigate('library')} style={{ background: 'linear-gradient(135deg, #8e2de2, #4a00e0)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 10px 20px rgba(74, 0, 224, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Library size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>My Library</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{booksReading} books in progress</div></div>
          </div>
          <ChevronRight size={28} />
        </div>

        <div onClick={() => navigate('search')} style={{ background: 'linear-gradient(135deg, #00b4db, #0083b0)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0, 131, 176, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Search size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Book Search</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Find new stories</div></div>
          </div>
          <ChevronRight size={28} />
        </div>

        {/* Dummy options for scrolling */}
        <div style={{ background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Zap size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Speed Reading</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Target size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Comprehension Quiz</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><BookMarked size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Vocabulary Builder</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fc4a1a, #f7b733)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Brain size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Daily Challenge</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>
      </div>
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
