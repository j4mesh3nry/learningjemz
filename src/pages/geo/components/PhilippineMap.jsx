import React, { useState } from 'react';
import '../geo.css';
import provinces from '../../../data/philippines-provinces';

export default function PhilippineMap({
  onProvinceClick = () => {},
  highlightedProvince = null,
  correctProvince = null,
  wrongProvince = null,
  showNames = false
}) {
  const [hovered, setHovered] = useState(null);
  
  const getFill = (p) => {
    if (correctProvince === p.id) return '#4caf50'; // Green flash
    if (wrongProvince === p.id) return '#f44336'; // Red flash
    if (highlightedProvince === p.id) return '#ffeb3b'; // Highlight yellow
    if (hovered === p.id) return '#e0f7fa'; // Hover light
    
    switch (p.island_group) {
      case 'Luzon': return '#4ecdc4';
      case 'Visayas': return '#45b7d1';
      case 'Mindanao': return '#96ceb4';
      default: return '#ccc';
    }
  };

  return (
    <div className="map-container">
      <svg
        viewBox="0 0 500 900"
        className="ph-map"
        preserveAspectRatio="xMidYMid meet"
      >
        {provinces.map(p => {
          const isCorrect = correctProvince === p.id;
          const isWrong = wrongProvince === p.id;
          const classNames = `province-path ${isCorrect ? 'flash-correct' : ''} ${isWrong ? 'flash-wrong' : ''}`;
          return (
            <g key={p.id}>
              <path
                d={p.path}
                fill={getFill(p)}
                stroke="#fff"
                strokeWidth="2"
                className={classNames}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onProvinceClick(p.id)}
                style={{ cursor: 'pointer', transition: 'fill 0.3s' }}
              />
              {showNames && (
                <text
                  x={p.center_x}
                  y={p.center_y}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  pointerEvents="none"
                >
                  {p.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hovered && !showNames && (
        <div className="map-tooltip">
          {provinces.find(p => p.id === hovered)?.name}
        </div>
      )}
    </div>
  );
}
