import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planets } from '../../data/space-data.js';
import { ArrowLeft, X, Info, Globe } from 'lucide-react';
import './space.css';

export default function SolarSystem() {
  const navigate = useNavigate();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [scale, setScale] = useState(1);

  // Mark planet explored when opened
  useEffect(() => {
    if (selectedPlanet) {
      const savedStats = JSON.parse(localStorage.getItem('learningjemz-space-stats') || '{"cardsMastered":0,"quizHighScore":0,"planetsExplored":0,"exploredIds":[]}');
      const exploredIds = savedStats.exploredIds || [];
      if (!exploredIds.includes(selectedPlanet.id)) {
        exploredIds.push(selectedPlanet.id);
        savedStats.exploredIds = exploredIds;
        savedStats.planetsExplored = exploredIds.length;
        localStorage.setItem('learningjemz-space-stats', JSON.stringify(savedStats));
      }
    }
  }, [selectedPlanet]);

  // Orbit sizing and calculation
  const orbits = planets.map((p, index) => {
    const radius = 60 + (index * 40); // base + spacing
    return { ...p, radius, duration: (index + 1) * 10 + 5 }; // slower as it gets further
  });

  return (
    <div className="space-module solar-system-mode">
      <div className="starfield">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random()
          }}></div>
        ))}
      </div>

      <div className="space-nav overlay-nav">
        <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Back</button>
        <div className="zoom-controls">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>-</button>
          <button onClick={() => setScale(s => Math.min(2, s + 0.2))}>+</button>
        </div>
      </div>

      <div className="solar-system-container" style={{ transform: `scale(${scale})` }}>
        <div className="sun"></div>
        
        {orbits.map((planet) => (
          <div 
            key={planet.id} 
            className="orbit" 
            style={{ 
              width: `${planet.radius * 2}px`, 
              height: `${planet.radius * 2}px`,
              animationDuration: `${planet.duration}s`
            }}
          >
            <div 
              className={`planet ${selectedPlanet?.id === planet.id ? 'selected' : ''}`}
              style={{ backgroundColor: planet.color }}
              onClick={() => setSelectedPlanet(planet)}
              title={planet.name}
            >
              <span className="planet-label">{planet.name}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedPlanet && (
        <div className="planet-info-card">
          <button className="close-btn" onClick={() => setSelectedPlanet(null)}><X size={24} /></button>
          <div className="planet-header">
            <div className="planet-icon" style={{ backgroundColor: selectedPlanet.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={24} color="#ffffff" />
            </div>
            <div>
              <h2>{selectedPlanet.name}</h2>
              <span className="planet-type">{selectedPlanet.type}</span>
            </div>
          </div>
          
          <div className="planet-stats-grid">
            <div className="p-stat">
              <span className="label">Moons</span>
              <span className="value">{selectedPlanet.moons}</span>
            </div>
            <div className="p-stat">
              <span className="label">Temp</span>
              <span className="value">{selectedPlanet.temperature.split(' ')[0]}</span>
            </div>
            <div className="p-stat">
              <span className="label">Year</span>
              <span className="value">{selectedPlanet.yearLength}</span>
            </div>
            <div className="p-stat">
              <span className="label">Gravity</span>
              <span className="value">{selectedPlanet.gravity}</span>
            </div>
          </div>

          <div className="planet-facts">
            <h3><Info size={16} /> Fun Fact</h3>
            <p>{selectedPlanet.funFacts[0]}</p>
          </div>
          
          <button 
            className="space-btn w-full mt-4"
            onClick={() => navigate('/space/flashcards')}
          >
            Learn More in Flashcards
          </button>
        </div>
      )}
    </div>
  );
}
