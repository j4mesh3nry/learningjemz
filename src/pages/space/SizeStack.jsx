import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SPACE_OBJECTS_BY_SIZE } from '../../data/space-objects';
import './space.css';

// A single sortable item component
function SortableItem({ id, item, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`size-stack-item ${isOverlay ? 'overlay' : ''}`}
      {...attributes} 
      {...listeners}
    >
      <div className="size-stack-drag-handle">≡</div>
      <div className="size-stack-item-img">
        {item.img ? (
          <img src={item.img} alt={item.name} />
        ) : (
          <div className="size-stack-item-fallback">{item.fallback}</div>
        )}
      </div>
      <div className="size-stack-item-info">
        <h4>{item.name}</h4>
        <span>{item.type}</span>
      </div>
    </div>
  );
}

export default function SizeStack() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null); // 'beginner', 'easy', 'medium', 'hard'
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const startGame = (difficulty) => {
    setLevel(difficulty);
    let count = 5;
    if (difficulty === 'easy') count = 10;
    if (difficulty === 'medium') count = 20;
    if (difficulty === 'hard') count = 35;
    
    // Take the top N objects, but shuffle them for the user to sort
    const slice = SPACE_OBJECTS_BY_SIZE.slice(0, count);
    const shuffled = [...slice].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setIsVictory(false);
    setIsChecking(false);
    setErrorMsg("");
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsChecking(false);
    setErrorMsg("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const checkOrder = () => {
    // Check if current items order matches the official order
    const count = items.length;
    const correctOrder = SPACE_OBJECTS_BY_SIZE.slice(0, count);
    
    let isCorrect = true;
    for (let i = 0; i < count; i++) {
      if (items[i].id !== correctOrder[i].id) {
        isCorrect = false;
        break;
      }
    }
    
    if (isCorrect) {
      setIsVictory(true);
    } else {
      setIsChecking(true);
      setErrorMsg("Not quite right yet. Largest should be at the top!");
    }
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  if (!level) {
    return (
      <div className="space-module">
        <div className="starfield">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="star" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div 
                onClick={() => navigate('/space/objects-by-size')}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                ←
              </div>
              <h1 className="space-page-title" style={{ margin: 0, color: '#fff', WebkitTextFillColor: '#fff', textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}>
                Size Stack
              </h1>
            </div>
          </div>

          <div style={{ padding: '0 4px', marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>Select Difficulty</h2>
            <p style={{ color: '#d1c4e9', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Drag and drop the objects in order from LARGEST to SMALLEST.
            </p>
          </div>
          
          <div className="space-card-list">
            <div className="space-card-item light-card" onClick={() => startGame('beginner')}>
              <div className="space-card-info">
                <h3 className="space-card-title">Beginner</h3>
                <p className="space-card-subtitle">Top 5 objects</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
            <div className="space-card-item light-card" onClick={() => startGame('easy')}>
              <div className="space-card-info">
                <h3 className="space-card-title">Easy</h3>
                <p className="space-card-subtitle">Top 10 objects</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
            <div className="space-card-item light-card" onClick={() => startGame('medium')}>
              <div className="space-card-info">
                <h3 className="space-card-title">Medium</h3>
                <p className="space-card-subtitle">Top 20 objects</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
            <div className="space-card-item light-card" onClick={() => startGame('hard')}>
              <div className="space-card-info">
                <h3 className="space-card-title">Hard</h3>
                <p className="space-card-subtitle">All 35 objects</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-module-page ss-dark-theme">
      <div className="space-nav-header ss-header">
        <button className="space-back-btn" onClick={() => setLevel(null)}>←</button>
        <h1 className="space-page-title">Sort: Largest to Smallest</h1>
      </div>

      <div className="size-stack-container">
        {isVictory ? (
          <div className="ss-victory-card">
            <h2>🎉 Stellar Job! 🎉</h2>
            <p>You have successfully ordered {items.length} objects by size.</p>
            
            <div className="ss-mnemonic-box">
              <h3>Mnemonic Hint Placeholder</h3>
              <p>Your mnemonic will go here!</p>
            </div>
            
            <button className="ss-btn-primary" onClick={() => setLevel(null)}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="ss-list-wrapper">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableItem key={item.id} id={item.id} item={item} />
                  ))}
                </SortableContext>
                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
                  {activeItem ? <SortableItem id={activeItem.id} item={activeItem} isOverlay /> : null}
                </DragOverlay>
              </DndContext>
            </div>
            
            {isChecking && errorMsg && (
              <div className="ss-error-msg">{errorMsg}</div>
            )}
            
            <button className="ss-btn-primary ss-check-btn" onClick={checkOrder}>
              Check Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}
