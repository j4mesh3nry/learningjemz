import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';
import { searchBooks, getCoverUrl, saveToLibrary, getLibrary } from '../../utils/bookService';
import './reading.css';

const BookSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [libraryKeys, setLibraryKeys] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Load library to check which books are already added
    const library = getLibrary();
    setLibraryKeys(new Set(library.map(book => book.key)));
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    const books = await searchBooks(searchQuery);
    setResults(books);
    setLoading(false);
  };

  const handleAdd = (book) => {
    saveToLibrary(book);
    setLibraryKeys(prev => new Set(prev).add(book.key));
  };

  return (
    <div className="book-search-view">
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate('/reading')}>
          <ArrowLeft size={24} />
        </button>
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search books, authors..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>
      </div>

      <div className="search-results">
        {loading && <div className="loading-spinner">Searching...</div>}
        
        {!loading && query && results.length === 0 && (
          <div className="empty-state">
            <p>No results found for "{query}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="results-list">
            {results.map(book => {
              const isAdded = libraryKeys.has(book.key);
              return (
                <div key={book.key} className="search-result-card">
                  <div className="result-cover">
                    {book.coverId ? (
                      <img src={getCoverUrl(book.coverId, 'S')} alt={book.title} />
                    ) : (
                      <div className="cover-placeholder-small" />
                    )}
                  </div>
                  <div className="result-info">
                    <h4 className="result-title">{book.title}</h4>
                    <p className="result-author">{book.author}</p>
                    {book.year && <p className="result-year">{book.year}</p>}
                  </div>
                  <button 
                    className={`add-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => !isAdded && handleAdd(book)}
                    disabled={isAdded}
                  >
                    {isAdded ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSearch;
