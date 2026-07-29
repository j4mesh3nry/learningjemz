import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bookmark } from 'lucide-react';
import { getBookContent, getLibrary, updateReadingProgress, getReadingProgress } from '../../utils/bookService';
import { useGame } from '../../contexts/GameContext';
import './reading.css';

const fallbackText = `
Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."

"Is that his design in settling here?"

"Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes."
`;

const BookReader = () => {
  const { bookKey } = useParams();
  const navigate = useNavigate();
  const decodedKey = decodeURIComponent(bookKey);
  const { addXp } = useGame();
  
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('serif');
  const [theme, setTheme] = useState('light');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [progress, setProgress] = useState(0);

  const readerRef = useRef(null);

  useEffect(() => {
    // Load book details from library
    const library = getLibrary();
    const foundBook = library.find(b => b.key === decodedKey);
    setBook(foundBook);

    // Try to get content
    const loadContent = async () => {
      const fetchedContent = await getBookContent(decodedKey);
      if (fetchedContent) {
        setContent(fetchedContent);
      } else {
        setContent(fallbackText);
      }
      setLoading(false);
      
      // Load saved progress
      const savedProgress = getReadingProgress(decodedKey);
      setProgress(savedProgress);
      
      // We will scroll to progress after render
      setTimeout(() => {
        if (readerRef.current && savedProgress > 0) {
          const scrollHeight = readerRef.current.scrollHeight - readerRef.current.clientHeight;
          readerRef.current.scrollTop = (savedProgress / 100) * scrollHeight;
        }
      }, 100);
    };

    loadContent();

    // Setup reading timer (15 XP after 5 mins = 300000ms)
    const timer = setTimeout(() => {
      addXp(15);
      // Could show a toast here if we had one
    }, 300000);

    return () => clearTimeout(timer);
  }, [decodedKey, addXp]);

  const handleScroll = () => {
    if (!readerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = readerRef.current;
    const currentProgress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    
    // Only update state if change is significant to avoid too many renders
    if (Math.abs(currentProgress - progress) > 1) {
      setProgress(Math.max(0, Math.min(100, currentProgress)));
    }
  };

  const handleBookmark = () => {
    updateReadingProgress(decodedKey, progress);
    alert('Bookmark saved!');
  };

  if (loading) return <div className="loading-reader">Loading book...</div>;

  return (
    <div className={`book-reader theme-${theme}`}>
      <div className="reader-toolbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="reader-title">{book?.title || 'Unknown Title'}</div>
        <button className="icon-btn" onClick={() => setSettingsOpen(!settingsOpen)}>
          <Settings size={24} />
        </button>
      </div>

      <div 
        className={`reader-content font-${fontFamily} size-${fontSize} spacing-${lineSpacing}`}
        ref={readerRef}
        onScroll={handleScroll}
      >
        <div className="content-inner">
          <p className="fallback-notice">
            Full text may not be available. Displaying sample content.
          </p>
          {content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div className="reader-footer">
        <div className="progress-text">{Math.round(progress)}%</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <button className="bookmark-btn" onClick={handleBookmark}>
          <Bookmark size={20} />
        </button>
      </div>

      {settingsOpen && (
        <div className="settings-panel-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <h3>Reader Settings</h3>
            
            <div className="setting-group">
              <label>Theme</label>
              <div className="setting-options">
                {['light', 'sepia', 'dark'].map(t => (
                  <button 
                    key={t}
                    className={`setting-btn ${theme === t ? 'active' : ''}`}
                    onClick={() => setTheme(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label>Font Family</label>
              <div className="setting-options">
                {['serif', 'sans-serif', 'monospace'].map(f => (
                  <button 
                    key={f}
                    className={`setting-btn ${fontFamily === f ? 'active' : ''}`}
                    onClick={() => setFontFamily(f)}
                  >
                    {f.split('-')[0].charAt(0).toUpperCase() + f.split('-')[0].slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label>Font Size</label>
              <div className="setting-options">
                {['small', 'medium', 'large', 'xlarge'].map(s => (
                  <button 
                    key={s}
                    className={`setting-btn ${fontSize === s ? 'active' : ''}`}
                    onClick={() => setFontSize(s)}
                  >
                    {s.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="setting-group">
              <label>Line Spacing</label>
              <div className="setting-options">
                {['compact', 'normal', 'relaxed'].map(l => (
                  <button 
                    key={l}
                    className={`setting-btn ${lineSpacing === l ? 'active' : ''}`}
                    onClick={() => setLineSpacing(l)}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BookReader;
