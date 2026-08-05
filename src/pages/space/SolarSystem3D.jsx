import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { Header } from '../../components/Header';
import { planets } from '../../data/space-data.js';
import '../../index.css';

// Simple mapping of planet data to visual properties
const planetColors = {
  Mercury: '#a3a3a3',
  Venus: '#e5c07b',
  Earth: '#2e8b57',
  Mars: '#b22222',
  Jupiter: '#d2b48c',
  Saturn: '#c2b280',
  Uranus: '#6ca0dc',
  Neptune: '#4169e1',
  Sun: '#ffcc00',
};

function Planet({ data, onSelect }) {
  const radius = data.diameter ? parseInt(data.diameter.replace(/[^0-9]/g, ''), 10) / 2000 : 0.5; // scale down
  const color = planetColors[data.name] || '#777';
  const position = data.orbitRadius ? [data.orbitRadius / 10, 0, 0] : [0, 0, 0];
  return (
    <mesh position={position} onClick={() => onSelect(data)}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
      {data.name !== 'Sun' && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#fff', fontSize: '0.6rem', textShadow: '0 0 4px #000' }}>{data.name}</div>
        </Html>
      )}
    </mesh>
  );
}

export default function SolarSystem3D() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: '80px', boxSizing: 'border-box' }}>
      <Header />
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight intensity={1.2} position={[0, 0, 0]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls enableZoom={true} enablePan={false} />
        {planets.map((p) => (
          <Planet key={p.id} data={p} onSelect={setSelected} />
        ))}
      </Canvas>
      {/* Info panel */}
      {selected && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          maxWidth: '90%',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selected.name}</h3>
          <p style={{ margin: '4px 0' }}>{selected.funFacts?.[0] || 'No fact available.'}</p>
          <button
            onClick={() => setSelected(null)}
            style={{
              marginTop: '6px',
              background: '#1c7c54',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
