import React from 'react';

export default function Gemstone({ className }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients for a 3D faceted look */}
        <linearGradient id="gem-top-center" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        
        <linearGradient id="gem-top-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        
        <linearGradient id="gem-top-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        
        <linearGradient id="gem-bottom-center" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="gem-bottom-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        
        <linearGradient id="gem-bottom-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      {/* Top Facets */}
      <polygon points="30,20 70,20 60,40 40,40" fill="url(#gem-top-center)" />
      <polygon points="10,40 30,20 40,40" fill="url(#gem-top-left)" />
      <polygon points="90,40 70,20 60,40" fill="url(#gem-top-right)" />

      {/* Bottom Facets */}
      <polygon points="40,40 60,40 50,90" fill="url(#gem-bottom-center)" />
      <polygon points="10,40 40,40 50,90" fill="url(#gem-bottom-left)" />
      <polygon points="90,40 60,40 50,90" fill="url(#gem-bottom-right)" />
      
      {/* Specular Highlights for extra shine */}
      <polygon points="30,20 70,20 66,24 34,24" fill="rgba(255,255,255,0.6)" />
      <polygon points="10,40 30,20 34,24 16,40" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
