import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, Trash2, Library, Zap, Target, BookMarked, Brain, ChevronRight, Lock } from 'lucide-react';
import { getLibrary, getReadingProgress, getCoverUrl, removeFromLibrary } from '../../utils/bookService';
import { useGame } from '../../contexts/GameContext';
import BookSearch from './BookSearch';
import BookReader from './BookReader';
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
  const { xp, level, streak, booksReading } = useGame();

  return (
    <div className="reading-module-page">
      {/* Navigation Header */}
      <div className="reading-nav-header">
        <div className="reading-header-left">
          <button className="reading-back-btn" onClick={() => navigate('/')} title="Back to Home">
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '1.8rem', width: 46, height: 46,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #b85c1e 0%, #e07c3e 100%)', borderRadius: 12,
              boxShadow: '0 4px 10px rgba(224,124,62,0.3)'
            }}>
              📖
            </div>
            <h1 className="reading-page-title" style={{ margin: 0, color: '#d16f2c', fontSize: '1.8rem', fontWeight: 900 }}>Reading</h1>
          </div>
        </div>

        <div className="reading-badges">
          <div className="reading-badge streak">
            <span>🔥</span>
            <span>{streak}</span>
          </div>
          <div className="reading-badge level">
            <span>⭐</span>
            <span>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Active Modes */}
      <h2 className="reading-section-heading">Curriculum</h2>

      <div className="reading-card-list">
        <div className="reading-card-item" onClick={() => navigate('library')}>
          <div className="reading-card-icon">📚</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">My Library</h3>
            <p className="reading-card-subtitle">{booksReading || 0} books in progress</p>
          </div>
          <div className="reading-card-arrow">→</div>
        </div>

        <div className="reading-card-item" onClick={() => navigate('search')}>
          <div className="reading-card-icon">🔍</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">Book Search</h3>
            <p className="reading-card-subtitle">Find new books & novels</p>
          </div>
          <div className="reading-card-arrow">→</div>
        </div>
      </div>

      {/* Locked Modes */}
      <h2 className="reading-section-heading">Advanced Studies (Locked)</h2>

      <div className="reading-card-list">
        <div className="reading-card-item locked">
          <div className="reading-card-icon">⚡</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">Speed Reading</h3>
            <p className="reading-card-subtitle">Accelerate reading pace</p>
          </div>
          <div className="reading-lock-badge">🔒 Locked</div>
        </div>

        <div className="reading-card-item locked">
          <div className="reading-card-icon">🎯</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">Comprehension Quiz</h3>
            <p className="reading-card-subtitle">Test chapter understanding</p>
          </div>
          <div className="reading-lock-badge">🔒 Locked</div>
        </div>

        <div className="reading-card-item locked">
          <div className="reading-card-icon">🔖</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">Vocabulary Builder</h3>
            <p className="reading-card-subtitle">Learn context-based words</p>
          </div>
          <div className="reading-lock-badge">🔒 Locked</div>
        </div>

        <div className="reading-card-item locked">
          <div className="reading-card-icon">👥</div>
          <div className="reading-card-info">
            <h3 className="reading-card-title">Reading Clubs</h3>
            <p className="reading-card-subtitle">Join community book chats</p>
          </div>
          <div className="reading-lock-badge">🔒 Locked</div>
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
