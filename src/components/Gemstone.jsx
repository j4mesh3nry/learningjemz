import React from 'react';

export default function Gemstone({ className }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Facets */}
      <polygon points="30,20 70,20 60,40 40,40" fill="#6ee7b7" />
      <polygon points="10,40 30,20 40,40" fill="#34d399" />
      <polygon points="90,40 70,20 60,40" fill="#10b981" />

      {/* Bottom Facets */}
      <polygon points="40,40 60,40 50,90" fill="#059669" />
      <polygon points="10,40 40,40 50,90" fill="#047857" />
      <polygon points="90,40 60,40 50,90" fill="#064e3b" />
      
      {/* Specular Highlights for extra shine */}
      <polygon points="30,20 70,20 66,24 34,24" fill="rgba(255,255,255,0.6)" />
      <polygon points="10,40 30,20 34,24 16,40" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
