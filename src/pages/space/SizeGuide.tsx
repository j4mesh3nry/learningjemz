import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Brain, Sparkles, Compass, Search, 
  ChevronDown, ChevronUp, Sun, Globe, Moon, Check, X, RotateCcw, 
  HelpCircle, Info, Ruler, ArrowRight, Lightbulb, Target
} from 'lucide-react';
import { SPACE_OBJECTS_BY_SIZE, MNEMONIC_WORDS_LIST } from '../../data/space-objects';
import './space.css';

// Helper to render type-based Lucide icon fallback
function getTypeIcon(iconType: string, size = 20) {
  switch (iconType) {
    case 'star':
      return <Sun size={size} color="#f59e0b" />;
    case 'gas-giant':
    case 'ice-giant':
      return <Globe size={size} color="#0284c7" />;
    case 'terrestrial':
      return <Globe size={size} color="#16a34a" />;
    case 'moon':
      return <Moon size={size} color="#64748b" />;
    case 'dwarf':
      return <Sparkles size={size} color="#e11d48" />;
    default:
      return <Globe size={size} color="#0284c7" />;
  }
}

// Image component with fallback to type icon
function SafeObjectImage({ src, alt, iconType, className, size = 32 }: { src?: string; alt: string; iconType: string; className?: string; size?: number }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (!src || imgError) {
    return (
      <div style={{ 
        width: size + 16, height: size + 16, 
        borderRadius: 12, background: '#e1f0e2', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {getTypeIcon(iconType, size)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{ 
        width: size + 16, height: size + 16, 
        borderRadius: 12, objectFit: 'cover',
        border: '2px solid #b0cbaf',
        flexShrink: 0 
      }} 
      onError={() => setImgError(true)} 
    />
  );
}

// Get precise mnemonic info for each object by index
function getMnemonicForObject(index: number) {
  if (index <= 12) {
    const rawWord = MNEMONIC_WORDS_LIST[index];
    const cleanWord = rawWord.replace(/[,.]/g, '');
    return {
      word: rawWord,
      letter: cleanWord[0],
      isGroup: false,
      groupName: null
    };
  } else if (index >= 13 && index <= 15) {
    const letters = ['L', 'E', 'T'];
    return {
      word: 'LET',
      letter: letters[index - 13],
      isGroup: true,
      groupName: 'LET (Luna, Europa, Triton)'
    };
  } else if (index >= 16 && index <= 18) {
    const letters = ['P', 'E', 'T'];
    return {
      word: 'PET',
      letter: letters[index - 16],
      isGroup: true,
      groupName: 'PET (Pluto, Eris, Titania)'
    };
  } else {
    const wordIndex = index - 4;
    const rawWord = MNEMONIC_WORDS_LIST[wordIndex] || '';
    const cleanWord = rawWord.replace(/[,.]/g, '');
    return {
      word: rawWord,
      letter: cleanWord[0] || '',
      isGroup: false,
      groupName: null
    };
  }
}

export default function SizeGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'mnemonic' | 'flashcards' | 'practice'>('list');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMnemonicHint, setShowMnemonicHint] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Filtered dataset based on difficulty tab
  const activeDataset = useMemo(() => {
    if (difficultyFilter === 'easy') return SPACE_OBJECTS_BY_SIZE.slice(0, 8);
    if (difficultyFilter === 'medium') return SPACE_OBJECTS_BY_SIZE.slice(0, 15);
    return SPACE_OBJECTS_BY_SIZE;
  }, [difficultyFilter]);

  // Search filtered objects for Study List
  const searchFilteredObjects = useMemo(() => {
    if (!searchQuery.trim()) return activeDataset;
    const q = searchQuery.toLowerCase();
    return activeDataset.filter(obj => 
      obj.name.toLowerCase().includes(q) || 
      obj.type.toLowerCase().includes(q) ||
      obj.diameter.toLowerCase().includes(q)
    );
  }, [activeDataset, searchQuery]);

  // Generate quiz questions
  const generateQuiz = () => {
    const dataset = activeDataset;
    const questions: any[] = [];
    const numQuestions = Math.min(5, dataset.length);

    for (let i = 0; i < numQuestions; i++) {
      const qType = i % 3; // 0: Size Comparison, 1: Mnemonic Word, 2: Rank Order
      if (qType === 0 && dataset.length >= 2) {
        // Compare two random objects
        const idxA = Math.floor(Math.random() * dataset.length);
        let idxB = Math.floor(Math.random() * dataset.length);
        while (idxB === idxA) idxB = Math.floor(Math.random() * dataset.length);

        const realRankA = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === dataset[idxA].id);
        const realRankB = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === dataset[idxB].id);
        const largerObj = realRankA < realRankB ? dataset[idxA] : dataset[idxB];

        const options = [dataset[idxA], dataset[idxB]];

        questions.push({
          question: `Which object is LARGER in diameter?`,
          options: options.map(o => `${o.name} (${o.type})`),
          correctAnswer: options.findIndex(o => o.id === largerObj.id),
          explanation: `${largerObj.name} (${largerObj.diameter}) is larger than ${options.find(o => o.id !== largerObj.id)?.name} (${options.find(o => o.id !== largerObj.id)?.diameter}).`
        });
      } else if (qType === 1) {
        // Mnemonic word matching
        const targetObj = dataset[Math.floor(Math.random() * dataset.length)];
        const realIndex = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === targetObj.id);
        const mInfo = getMnemonicForObject(realIndex);

        // Distractors
        const distractors = ['Silly', 'Jumpy', 'Students', 'Mountain', 'Cabin', 'Hippos', 'Detectives', 'Outside']
          .filter(w => w !== mInfo.word)
          .slice(0, 3);
        
        const allOpts = [mInfo.word, ...distractors].sort(() => 0.5 - Math.random());

        questions.push({
          question: `What is the mnemonic word / key for ${targetObj.name}?`,
          options: allOpts,
          correctAnswer: allOpts.indexOf(mInfo.word),
          explanation: `${targetObj.name} (Rank #${realIndex + 1}) matches mnemonic: "${mInfo.word}" ${mInfo.isGroup ? `[part of ${mInfo.groupName}]` : ''}.`
        });
      } else {
        // Rank matching
        const targetObj = dataset[Math.floor(Math.random() * dataset.length)];
        const realIndex = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === targetObj.id);
        const correctRank = `#${realIndex + 1}`;

        const otherRanks = [`#${Math.max(1, realIndex)}`, `#${realIndex + 2}`, `#${realIndex + 3}`]
          .filter(r => r !== correctRank)
          .slice(0, 3);

        const allOpts = [correctRank, ...otherRanks].sort(() => 0.5 - Math.random());

        questions.push({
          question: `What is the exact size rank of ${targetObj.name} in the solar system?`,
          options: allOpts,
          correctAnswer: allOpts.indexOf(correctRank),
          explanation: `${targetObj.name} is the #${realIndex + 1} largest object in our solar system.`
        });
      }
    }

    setQuizQuestions(questions);
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizComplete(false);
  };

  useEffect(() => {
    if (activeTab === 'practice') {
      generateQuiz();
    }
  }, [activeTab, difficultyFilter]);

  // Flashcards reset on index/difficulty change
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setShowMnemonicHint(false);
  }, [difficultyFilter]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setShowMnemonicHint(false);
    setCardIndex(prev => (prev + 1) % activeDataset.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setShowMnemonicHint(false);
    setCardIndex(prev => (prev - 1 + activeDataset.length) % activeDataset.length);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return; // Prevent double click
    setSelectedOption(idx);
    if (idx === quizQuestions[currentQuizIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < quizQuestions.length) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizComplete(true);
    }
  };

  return (
    <div className="space-module-page">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button 
          onClick={() => navigate('/space')} 
          title="Back to Space"
          aria-label="Back to Space"
          style={{
            background: '#161936',
            border: '2px solid #385e8a',
            boxShadow: '0 3px 0 #385e8a',
            borderRadius: 14,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #161936 0%, #0e1126 100%)',
          borderRadius: 16,
          border: '2px solid #385e8a',
          boxShadow: '0 4px 0 #0b0d1e',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0, color: '#ffffff', fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)', fontWeight: 900
          }}>
            Objects by Size Guide
          </h1>
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        background: '#161936',
        padding: '4px',
        borderRadius: 14,
        border: '2px solid #385e8a',
        boxShadow: '0 3px 0 #385e8a',
        marginBottom: 16,
        gap: 4
      }}>
        {[
          { key: 'list', name: 'Study List', icon: BookOpen },
          { key: 'mnemonic', name: 'Mnemonic', icon: Brain },
          { key: 'flashcards', name: 'Flashcards', icon: Sparkles },
          { key: 'practice', name: 'Practice', icon: Compass }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '8px 2px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? '#385e8a' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3
              }}
            >
              <Icon size={16} color={isActive ? '#ffffff' : '#cbd5e1'} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Difficulty Filter Bar (Applies to List, Flashcards, Practice) */}
      {activeTab !== 'mnemonic' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 16,
          background: '#161936',
          padding: '6px 10px',
          borderRadius: 12,
          border: '2px solid #385e8a',
          boxShadow: '0 2px 0 #385e8a'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9', marginRight: 4 }}>
            Filter:
          </span>
          {[
            { key: 'all', label: 'All 35' },
            { key: 'easy', label: 'Top 8 (Easy)' },
            { key: 'medium', label: 'Top 15 (Med)' }
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setDifficultyFilter(opt.key as any)}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: 8,
                border: difficultyFilter === opt.key ? '2px solid #385e8a' : '1px solid #385e8a',
                background: difficultyFilter === opt.key ? '#385e8a' : '#0f1226',
                color: difficultyFilter === opt.key ? '#ffffff' : '#38bdf8',
                fontWeight: 800,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: STUDY LIST */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#161936',
            border: '2px solid #385e8a',
            boxShadow: '0 3px 0 #385e8a',
            borderRadius: 14,
            padding: '8px 12px'
          }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name, type, or diameter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#f1f5f9',
                background: 'transparent'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', margin: '2px 0 4px 4px' }}>
            Showing {searchFilteredObjects.length} object{searchFilteredObjects.length === 1 ? '' : 's'} (in order from largest to smallest):
          </div>

          {/* Cards List */}
          {searchFilteredObjects.map((obj) => {
            const realRank = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === obj.id) + 1;
            const isExpanded = expandedId === obj.id;
            const mInfo = getMnemonicForObject(realRank - 1);

            return (
              <div 
                key={obj.id}
                style={{
                  background: '#161936',
                  borderRadius: 16,
                  border: isExpanded ? '2px solid #38bdf8' : '2px solid #385e8a',
                  boxShadow: isExpanded ? '0 4px 0 #38bdf8' : '0 4px 0 #0b0d1e',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: '#161936'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: '#385e8a', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.8rem', flexShrink: 0,
                    boxShadow: '0 2px 0 #1e3a8a'
                  }}>
                    #{realRank}
                  </div>

                  {/* Safe Image Thumbnail */}
                  <SafeObjectImage src={obj.img} alt={obj.name} iconType={obj.iconType} size={28} />

                  {/* Name and Basic Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                        {obj.name}
                      </h3>
                      <span style={{ 
                        fontSize: '0.68rem', fontWeight: 800, 
                        background: '#232752', color: '#38bdf8', 
                        padding: '2px 6px', borderRadius: 6 
                      }}>
                        {obj.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                      Diameter: <strong style={{ color: '#f1f5f9' }}>{obj.diameter}</strong>
                    </div>
                  </div>

                  {/* Chevron Toggle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: isExpanded ? '#385e8a' : '#232752',
                    color: isExpanded ? '#ffffff' : '#38bdf8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Detail Drawer */}
                {isExpanded && (
                  <div style={{
                    background: '#0f1226',
                    borderTop: '2px solid #385e8a',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    {/* Mnemonic Banner */}
                    <div style={{
                      background: '#161936',
                      color: '#ffffff',
                      borderRadius: 12,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      border: '1.5px solid #385e8a',
                      boxShadow: '0 2px 0 #0b0d1e'
                    }}>
                      <Brain size={16} color="#38bdf8" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        Mnemonic Key: <span style={{ color: '#ffb400', fontWeight: 900 }}>"{mInfo.word}"</span> 
                        {mInfo.isGroup && ` [${mInfo.groupName}]`}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.4 }}>
                      <strong>Classification:</strong> {obj.typeDescription}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.4 }}>
                      <strong>Location / Orbit:</strong> {obj.orbitalOrder}
                    </div>

                    <div style={{
                      background: '#161936',
                      borderRadius: 12,
                      border: '1.5px solid #385e8a',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: 8
                    }}>
                      <Info size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.35 }}>
                        <strong>Fun Fact:</strong> {obj.funFact}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MNEMONIC MAP */}
      {activeTab === 'mnemonic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Explanation Banner */}
          <div style={{
            background: '#161936',
            borderRadius: 16,
            border: '2px solid #385e8a',
            boxShadow: '0 4px 0 #0b0d1e',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} color="#38bdf8" />
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#f1f5f9', fontFamily: 'var(--font-heading)' }}>
                How the Mnemonic Works
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.4 }}>
              The mnemonic sentence compresses the 35 solar objects into 31 memorable words. Notice how <strong style={{ color: '#f1f5f9' }}>Luna, Europa, and Triton</strong> are combined into <strong style={{ color: '#ffb400' }}>"LET"</strong>, and <strong style={{ color: '#f1f5f9' }}>Pluto, Eris, and Titania</strong> are combined into <strong style={{ color: '#ffb400' }}>"PET"</strong>!
            </p>
          </div>

          {/* Complete Sentence Display */}
          <div style={{
            background: '#0f1226',
            borderRadius: 16,
            border: '2px solid #385e8a',
            boxShadow: '0 4px 0 #0b0d1e',
            padding: '14px 16px',
            color: '#ffffff'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Full Mnemonic Sentence:
            </span>
            <div style={{ 
              fontSize: '0.88rem', 
              fontWeight: 700, 
              lineHeight: 1.6, 
              marginTop: 6,
              letterSpacing: '0.2px' 
            }}>
              {MNEMONIC_WORDS_LIST.slice(0, 31).map((word, idx) => {
                const isGroupWord = word === 'LET' || word === 'PET';
                return (
                  <span 
                    key={idx}
                    style={{
                      display: 'inline-block',
                      marginRight: 6,
                      background: isGroupWord ? '#ffb400' : 'rgba(255,255,255,0.12)',
                      color: isGroupWord ? '#0f3825' : '#ffffff',
                      padding: '2px 7px',
                      borderRadius: 6,
                      fontWeight: 800
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Detailed Word-to-Object Mapping Table */}
          <div style={{
            background: '#161936',
            borderRadius: 16,
            border: '2px solid #385e8a',
            boxShadow: '0 4px 0 #0b0d1e',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>
              Mnemonic Key Mapping
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPACE_OBJECTS_BY_SIZE.map((obj, idx) => {
                const mInfo = getMnemonicForObject(idx);
                const isGroupHeader = (idx === 13 || idx === 16);

                return (
                  <React.Fragment key={obj.id}>
                    {/* Special highlight box for group headers */}
                    {isGroupHeader && (
                      <div style={{
                        background: '#232752',
                        border: '1.5px solid #ffb400',
                        borderRadius: 10,
                        padding: '6px 10px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        color: '#ffb400',
                        marginTop: 4
                      }}>
                        Group Keyword "{mInfo.word}" — Combines 3 objects in order:
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: mInfo.isGroup ? '#1e2442' : '#0f1226',
                      border: '1px solid #385e8a',
                      borderRadius: 10,
                      padding: '8px 12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: 900, 
                          color: '#38bdf8', width: 26 
                        }}>
                          #{idx + 1}
                        </span>
                        <SafeObjectImage src={obj.img} alt={obj.name} iconType={obj.iconType} size={20} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
                          {obj.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowRight size={14} color="#94a3b8" />
                        <span style={{
                          background: mInfo.isGroup ? '#ffb400' : '#385e8a',
                          color: mInfo.isGroup ? '#0f3825' : '#ffffff',
                          fontSize: '0.76rem',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: 8
                        }}>
                          "{mInfo.word}" ({mInfo.letter})
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Progress Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#161936',
            borderRadius: 12,
            border: '2px solid #385e8a',
            padding: '8px 14px'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f1f5f9' }}>
              Card {cardIndex + 1} of {activeDataset.length}
            </span>
            <button
              onClick={() => setShowMnemonicHint(prev => !prev)}
              style={{
                background: showMnemonicHint ? '#385e8a' : '#232752',
                color: showMnemonicHint ? '#ffffff' : '#38bdf8',
                border: 'none',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Lightbulb size={14} /> {showMnemonicHint ? 'Hide Hint' : 'Show Mnemonic Hint'}
            </button>
          </div>

          {/* Flashcard Body */}
          {(() => {
            const obj = activeDataset[cardIndex];
            const realRank = SPACE_OBJECTS_BY_SIZE.findIndex(o => o.id === obj.id) + 1;
            const mInfo = getMnemonicForObject(realRank - 1);

            return (
              <div 
                onClick={() => setIsFlipped(prev => !prev)}
                style={{
                  minHeight: 280,
                  background: '#161936',
                  borderRadius: 20,
                  border: isFlipped ? '3px solid #38bdf8' : '3px solid #385e8a',
                  boxShadow: isFlipped ? '0 6px 0 #38bdf8' : '0 6px 0 #0b0d1e',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  position: 'absolute', top: 12, right: 14,
                  fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8',
                  background: '#232752', padding: '3px 8px', borderRadius: 8
                }}>
                  {isFlipped ? 'Back (Click to flip)' : 'Front (Click to flip)'}
                </div>

                {!isFlipped ? (
                  // FRONT OF CARD
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      background: '#385e8a', color: '#ffffff',
                      padding: '4px 12px', borderRadius: 10,
                      fontWeight: 900, fontSize: '0.85rem'
                    }}>
                      Rank #{realRank} Largest Object
                    </div>

                    <SafeObjectImage src={obj.img} alt={obj.name} iconType={obj.iconType} size={64} />

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                        {obj.type}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                        Diameter: <strong style={{ color: '#f1f5f9' }}>{obj.diameter}</strong>
                      </div>
                    </div>

                    {showMnemonicHint && (
                      <div style={{
                        marginTop: 6,
                        background: '#0f1226',
                        color: '#ffb400',
                        padding: '6px 14px',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        border: '1px solid #385e8a'
                      }}>
                        Mnemonic Hint: "{mInfo.word}" ({mInfo.letter})
                      </div>
                    )}
                  </div>
                ) : (
                  // BACK OF CARD
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'fadeIn 0.15s ease-out' }}>
                    <SafeObjectImage src={obj.img} alt={obj.name} iconType={obj.iconType} size={40} />

                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9', fontFamily: 'var(--font-heading)' }}>
                      {obj.name}
                    </h2>

                    <div style={{
                      background: '#385e8a', color: '#ffffff',
                      padding: '4px 12px', borderRadius: 10,
                      fontSize: '0.78rem', fontWeight: 800
                    }}>
                      Mnemonic Word: "{mInfo.word}"
                    </div>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                      Orbit: {obj.orbitalOrder}
                    </p>

                    <div style={{
                      background: '#0f1226',
                      border: '1.5px solid #385e8a',
                      borderRadius: 12,
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#f1f5f9',
                      fontWeight: 600,
                      maxWidth: 320
                    }}>
                      {obj.funFact}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Flashcard Navigation Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handlePrevCard}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 14,
                border: '2px solid #385e8a',
                boxShadow: '0 3px 0 #385e8a',
                background: '#161936',
                color: '#38bdf8',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextCard}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 14,
                border: '2px solid #1e3a8a',
                boxShadow: '0 3px 0 #0b0d1e',
                background: '#385e8a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRACTICE QUIZ */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!quizComplete ? (
            quizQuestions.length > 0 && (
              <div style={{
                background: '#161936',
                borderRadius: 18,
                border: '2px solid #385e8a',
                boxShadow: '0 4px 0 #0b0d1e',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
                    Question {currentQuizIdx + 1} of {quizQuestions.length}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffb400' }}>
                    Score: {score}
                  </span>
                </div>

                {/* Question Text */}
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.3 }}>
                  {quizQuestions[currentQuizIdx].question}
                </h3>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quizQuestions[currentQuizIdx].options.map((optText: string, idx: number) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizQuestions[currentQuizIdx].correctAnswer;
                    let optionBg = '#0f1226';
                    let optionBorder = '#385e8a';
                    let optionColor = '#f1f5f9';

                    if (selectedOption !== null) {
                      if (isCorrect) {
                        optionBg = '#064e3b';
                        optionBorder = '#059669';
                        optionColor = '#34d399';
                      } else if (isSelected) {
                        optionBg = '#7f1d1d';
                        optionBorder = '#e53935';
                        optionColor = '#f87171';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={selectedOption !== null}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: optionBg,
                          border: `2px solid ${optionBorder}`,
                          boxShadow: `0 3px 0 ${optionBorder}`,
                          borderRadius: 12,
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: optionColor,
                          cursor: selectedOption === null ? 'pointer' : 'default',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <span>{optText}</span>
                        {selectedOption !== null && isCorrect && <Check size={18} color="#34d399" />}
                        {selectedOption !== null && isSelected && !isCorrect && <X size={18} color="#f87171" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Next Button */}
                {selectedOption !== null && (
                  <div style={{
                    marginTop: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <div style={{
                      background: '#0f1226',
                      border: '1.5px solid #385e8a',
                      borderRadius: 10,
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#f1f5f9',
                      fontWeight: 600
                    }}>
                      {quizQuestions[currentQuizIdx].explanation}
                    </div>

                    <button
                      onClick={handleNextQuizQuestion}
                      style={{
                        padding: '10px',
                        borderRadius: 12,
                        border: '2px solid #1e3a8a',
                        boxShadow: '0 3px 0 #0b0d1e',
                        background: '#385e8a',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {currentQuizIdx + 1 < quizQuestions.length ? 'Next Question →' : 'See Summary →'}
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            // Quiz Complete Summary
            <div style={{
              background: '#161936',
              borderRadius: 20,
              border: '2px solid #385e8a',
              boxShadow: '0 4px 0 #0b0d1e',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 12
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: '#232752', color: '#38bdf8',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={32} />
              </div>

              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#f1f5f9', fontFamily: 'var(--font-heading)' }}>
                Practice Complete!
              </h2>

              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700 }}>
                You scored <strong style={{ color: '#38bdf8' }}>{score} / {quizQuestions.length}</strong>!
              </p>

              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
                <button
                  onClick={generateQuiz}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 12,
                    border: '2px solid #385e8a',
                    boxShadow: '0 3px 0 #385e8a',
                    background: '#161936',
                    color: '#38bdf8',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <RotateCcw size={16} /> Try Again
                </button>
                <button
                  onClick={() => navigate('/space/objects-by-size')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 12,
                    border: '2px solid #1e3a8a',
                    boxShadow: '0 3px 0 #0b0d1e',
                    background: '#385e8a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Play Game →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
