import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { planets } from '../../data/space-data.js';
import './space.css';

/*
 * 3D Solar Explorer — Redesigned
 * Bigger planets, glow auras, Saturn rings, animated orbits, premium info panel.
 */

const PLANET_CONFIG = {
  Mercury:  { size: 0.35, orbit: 4.2,   speed: 1.6,  emissive: '#ffddaa', emissiveIntensity: 0.15 },
  Venus:    { size: 0.55, orbit: 5.8,    speed: 1.17, emissive: '#ffe4a0', emissiveIntensity: 0.2 },
  Earth:    { size: 0.6,  orbit: 7.5,    speed: 1.0,  emissive: '#88ccff', emissiveIntensity: 0.15 },
  Mars:     { size: 0.45, orbit: 9.2,    speed: 0.8,  emissive: '#ff8866', emissiveIntensity: 0.15 },
  Jupiter:  { size: 1.5,  orbit: 12.5,   speed: 0.44, emissive: '#ddbb88', emissiveIntensity: 0.1 },
  Saturn:   { size: 1.25, orbit: 16.0,   speed: 0.32, emissive: '#eedd99', emissiveIntensity: 0.1 },
  Uranus:   { size: 0.85, orbit: 19.5,   speed: 0.22, emissive: '#99ddee', emissiveIntensity: 0.1 },
  Neptune:  { size: 0.8,  orbit: 22.5,   speed: 0.18, emissive: '#6688ff', emissiveIntensity: 0.15 },
};

/* ─── Procedural planet texture generator ─── */
function generatePlanetTexture(name) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Seeded pseudo-random for consistency
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed += name.charCodeAt(i);
  const rand = () => { seed = (seed * 16807 + 7) % 2147483647; return (seed & 0x7fffffff) / 0x7fffffff; };

  switch (name) {
    case 'Mercury': {
      // Gray, cratered surface
      ctx.fillStyle = '#8c8c8c';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 120; i++) {
        const x = rand() * size, y = rand() * size, r = rand() * 8 + 2;
        const shade = Math.floor(rand() * 40 + 90);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${shade},${shade},${shade + 5})`;
        ctx.fill();
      }
      // Subtle noise
      for (let i = 0; i < 600; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.fillStyle = `rgba(${rand() > 0.5 ? 180 : 60},${rand() > 0.5 ? 170 : 60},${rand() > 0.5 ? 160 : 60},0.15)`;
        ctx.fillRect(x, y, 2, 2);
      }
      break;
    }
    case 'Venus': {
      // Yellowish with swirly clouds
      const grd = ctx.createLinearGradient(0, 0, size, size);
      grd.addColorStop(0, '#e3c37a');
      grd.addColorStop(0.5, '#d4a84f');
      grd.addColorStop(1, '#c99540');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      // Cloud swirls
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const y = rand() * size;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(rand() * size, y + (rand() - 0.5) * 40, rand() * size, y + (rand() - 0.5) * 40, size, y + (rand() - 0.5) * 20);
        ctx.strokeStyle = `rgba(255,240,200,${rand() * 0.15 + 0.05})`;
        ctx.lineWidth = rand() * 10 + 4;
        ctx.stroke();
      }
      break;
    }
    case 'Earth': {
      // Ocean blue base
      ctx.fillStyle = '#1a5276';
      ctx.fillRect(0, 0, size, size);
      // Ocean variation
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.ellipse(rand() * size, rand() * size, rand() * 60 + 20, rand() * 30 + 10, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26,${Math.floor(rand() * 30 + 70)},${Math.floor(rand() * 40 + 100)},0.3)`;
        ctx.fill();
      }
      // Continents (green/brown blobs)
      const continents = [
        { x: 0.3, y: 0.3, rx: 35, ry: 25 }, // North America-ish
        { x: 0.55, y: 0.55, rx: 20, ry: 30 }, // South America-ish
        { x: 0.75, y: 0.35, rx: 30, ry: 20 }, // Eurasia-ish
        { x: 0.78, y: 0.55, rx: 18, ry: 15 }, // Africa-ish
        { x: 0.9, y: 0.7, rx: 22, ry: 15 },  // Australia-ish
      ];
      continents.forEach(c => {
        ctx.beginPath();
        ctx.ellipse(c.x * size, c.y * size, c.rx, c.ry, rand() * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.floor(rand() * 30 + 50)},${Math.floor(rand() * 50 + 110)},${Math.floor(rand() * 30 + 40)})`;
        ctx.fill();
        // Some brown highlands
        ctx.beginPath();
        ctx.ellipse(c.x * size + 5, c.y * size - 3, c.rx * 0.5, c.ry * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,100,60,0.4)`;
        ctx.fill();
      });
      // White cloud wisps
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(rand() * size, rand() * size, rand() * 30 + 10, rand() * 8 + 3, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${rand() * 0.2 + 0.05})`;
        ctx.fill();
      }
      // Polar caps
      ctx.beginPath();
      ctx.ellipse(size / 2, 8, size / 2, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,248,255,0.6)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 8, size / 2, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,248,255,0.7)';
      ctx.fill();
      break;
    }
    case 'Mars': {
      // Rusty red/brown base
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(0, 0, size, size);
      // Surface variation
      for (let i = 0; i < 200; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.beginPath();
        ctx.arc(x, y, rand() * 12 + 2, 0, Math.PI * 2);
        const r = Math.floor(rand() * 50 + 130), g = Math.floor(rand() * 30 + 50), b = Math.floor(rand() * 20 + 25);
        ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
        ctx.fill();
      }
      // Craters
      for (let i = 0; i < 25; i++) {
        const x = rand() * size, y = rand() * size, r = rand() * 8 + 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80,30,15,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(120,55,30,0.2)';
        ctx.fill();
      }
      // Polar ice cap
      ctx.beginPath();
      ctx.ellipse(size / 2, 6, size * 0.3, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,230,240,0.5)';
      ctx.fill();
      break;
    }
    case 'Jupiter': {
      // Horizontal bands
      const bands = [
        '#d4a56a', '#c98e4a', '#e8c88a', '#b87838',
        '#c9944a', '#ddb870', '#a86828', '#d4a56a',
        '#e0c080', '#c98e4a', '#b87838', '#d4a56a',
      ];
      const bandH = size / bands.length;
      bands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bandH, size, bandH + 1);
      });
      // Wavy band edges
      for (let i = 1; i < bands.length; i++) {
        ctx.beginPath();
        const y = i * bandH;
        ctx.moveTo(0, y);
        for (let x = 0; x <= size; x += 4) {
          ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
        }
        ctx.strokeStyle = `rgba(0,0,0,0.1)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Great Red Spot
      ctx.beginPath();
      ctx.ellipse(size * 0.65, size * 0.58, 18, 12, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#c05030';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size * 0.65, size * 0.58, 12, 7, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#d06040';
      ctx.fill();
      break;
    }
    case 'Saturn': {
      // Softer horizontal bands
      const bands = [
        '#e8d8a0', '#d4c488', '#c8b070', '#ddd098',
        '#c8b878', '#e0d090', '#ccc080', '#d8c890',
      ];
      const bandH = size / bands.length;
      bands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bandH, size, bandH + 1);
      });
      for (let i = 1; i < bands.length; i++) {
        ctx.beginPath();
        const y = i * bandH;
        ctx.moveTo(0, y);
        for (let x = 0; x <= size; x += 4) {
          ctx.lineTo(x, y + Math.sin(x * 0.03 + i * 2) * 2);
        }
        ctx.strokeStyle = `rgba(180,160,100,0.15)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    case 'Uranus': {
      // Smooth cyan/teal gradient
      const grd = ctx.createLinearGradient(0, 0, 0, size);
      grd.addColorStop(0, '#7ec8d8');
      grd.addColorStop(0.3, '#6cb8cc');
      grd.addColorStop(0.7, '#5aa8bc');
      grd.addColorStop(1, '#4898ac');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      // Subtle haze bands
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const y = rand() * size;
        ctx.fillStyle = `rgba(200,240,255,${rand() * 0.08 + 0.02})`;
        ctx.fillRect(0, y, size, rand() * 12 + 4);
      }
      break;
    }
    case 'Neptune': {
      // Deep blue with bands and storm
      const grd = ctx.createLinearGradient(0, 0, 0, size);
      grd.addColorStop(0, '#3050c0');
      grd.addColorStop(0.5, '#2040a0');
      grd.addColorStop(1, '#1830a0');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      // Bands
      for (let i = 0; i < 6; i++) {
        const y = rand() * size;
        ctx.fillStyle = `rgba(80,120,220,${rand() * 0.15 + 0.05})`;
        ctx.fillRect(0, y, size, rand() * 10 + 5);
      }
      // Great Dark Spot
      ctx.beginPath();
      ctx.ellipse(size * 0.4, size * 0.45, 14, 10, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15,20,70,0.6)';
      ctx.fill();
      // White cloud streaks
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(rand() * size, rand() * size, rand() * 20 + 8, rand() * 3 + 1, rand(), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,220,255,0.15)';
        ctx.fill();
      }
      break;
    }
    default: {
      ctx.fillStyle = '#888';
      ctx.fillRect(0, 0, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/* ─── Sun texture ─── */
function generateSunTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, '#fff8e0');
  grd.addColorStop(0.3, '#FDB813');
  grd.addColorStop(0.7, '#f59e0b');
  grd.addColorStop(1, '#e87800');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  // Solar granulation
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 80 + 180)},0,${Math.random() * 0.2 + 0.05})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

/* ─── Glowing Sun ─── */
function Sun() {
  const meshRef = useRef();
  const sunTexture = useMemo(() => generateSunTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      {/* Core sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.06} />
      </mesh>
      {/* Sun light */}
      <pointLight color="#FDB813" intensity={3} distance={80} decay={1.5} />
      {/* Sun label */}
      <Html position={[0, -3, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#FDB813', fontSize: '0.7rem', fontWeight: 700,
          textShadow: '0 0 10px rgba(253,184,19,0.8)', userSelect: 'none', letterSpacing: '1px',
        }}>
          SUN
        </div>
      </Html>
    </group>
  );
}

/* ─── Orbit ring ─── */
function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const pts = [];
    const segs = 180;
    for (let i = 0; i <= segs; i++) {
      const angle = (i / segs) * Math.PI * 2;
      pts.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }
    return new Float32Array(pts);
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#4488cc" transparent opacity={0.25} />
    </line>
  );
}

/* ─── Planet ─── */
function Planet({ data, config, onSelect, isSelected }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => generatePlanetTexture(data.name), [data.name]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = initialAngle.current + t * config.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * config.orbit;
      groupRef.current.position.z = Math.sin(angle) * config.orbit;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
    // Pulse glow on hover
    if (glowRef.current) {
      const scale = hovered ? 1.4 + Math.sin(t * 4) * 0.1 : 1.3;
      glowRef.current.scale.setScalar(scale);
      glowRef.current.material.opacity = hovered ? 0.25 : 0.1;
    }
  });

  const isSaturn = data.name === 'Saturn';
  const isUranus = data.name === 'Uranus';

  return (
    <group ref={groupRef}>
      {/* Glow aura */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial color={config.emissive} transparent opacity={0.1} />
      </mesh>

      {/* Planet body */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.size, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          emissive={config.emissive}
          emissiveIntensity={hovered ? config.emissiveIntensity * 3 : config.emissiveIntensity}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Saturn rings */}
      {isSaturn && (
        <mesh rotation={[Math.PI / 3, 0.2, 0]}>
          <ringGeometry args={[config.size * 1.4, config.size * 2.2, 64]} />
          <meshStandardMaterial
            color="#d4c58a"
            emissive="#d4c58a"
            emissiveIntensity={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Uranus thin ring */}
      {isUranus && (
        <mesh rotation={[0.3, 0, Math.PI / 2]}>
          <ringGeometry args={[config.size * 1.3, config.size * 1.5, 64]} />
          <meshStandardMaterial
            color="#88bbcc"
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Label */}
      <Html
        position={[0, -(config.size + 0.5), 0]}
        center
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
      >
        <div style={{
          color: hovered ? '#fff' : 'rgba(255,255,255,0.7)',
          fontSize: hovered ? '0.75rem' : '0.65rem',
          fontWeight: 700,
          textShadow: `0 0 8px ${data.color || '#888'}`,
          transition: 'all 0.2s ease',
          userSelect: 'none',
          letterSpacing: '0.5px',
        }}>
          {data.name}
        </div>
      </Html>
    </group>
  );
}

/* ─── Info Panel Component ─── */
function InfoPanel({ planet, onClose, onFlashcards }) {
  if (!planet) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 50, padding: '0 12px 16px',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{
        maxWidth: 420, margin: '0 auto',
        background: 'linear-gradient(145deg, rgba(15,15,40,0.95), rgba(8,8,25,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px 20px 16px 16px',
        padding: '24px',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 0 30px ${planet.color}22`,
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
        }}>
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${planet.color}cc, ${planet.color}44)`,
            boxShadow: `0 0 24px ${planet.color}66, inset 0 -4px 8px rgba(0,0,0,0.3)`,
            flexShrink: 0,
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
              {planet.name}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              {planet.type}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '10px', marginBottom: 16,
        }}>
          {[
            { label: 'Moons', value: planet.moons },
            { label: 'Temperature', value: planet.temperature?.split(' ')[0] || '—' },
            { label: 'Year Length', value: planet.yearLength },
            { label: 'Gravity', value: planet.gravity },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Fun fact */}
        <div style={{
          background: `linear-gradient(135deg, ${planet.color}11, ${planet.color}08)`,
          borderRadius: 12, padding: '12px 16px',
          border: `1px solid ${planet.color}22`,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} style={{ color: planet.color, opacity: 0.8 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: planet.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fun Fact
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
            {planet.funFacts?.[0] || 'No fact available.'}
          </p>
        </div>

        {/* CTA */}
        <button onClick={onFlashcards} style={{
          width: '100%', padding: '12px',
          background: `linear-gradient(135deg, ${planet.color}cc, ${planet.color}88)`,
          border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 700, fontSize: '0.85rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: `0 4px 16px ${planet.color}44`,
          transition: 'transform 0.15s ease',
        }}>
          Learn More in Flashcards <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SolarSystem3D() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #050510 60%, #020208 100%)',
      overflow: 'hidden',
    }}>
      {/* Overlay nav */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          onClick={() => navigate('/space')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '8px 14px',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '6px 14px',
          color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 600,
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          🪐 Solar Explorer
        </div>
      </div>

      {/* Pinch / zoom hint */}
      <div style={{
        position: 'absolute', bottom: selected ? 320 : 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 5,
        color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', fontWeight: 500,
        textAlign: 'center', transition: 'bottom 0.3s ease',
        pointerEvents: 'none',
      }}>
        Drag to rotate · Scroll to zoom · Click a planet
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [8, 18, 28], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#050510'); }}
      >
        <ambientLight intensity={0.08} color="#4466aa" />
        <directionalLight position={[10, 10, 5]} intensity={0.1} color="#8888ff" />

        <Stars radius={300} depth={80} count={8000} factor={5} saturation={0.2} fade speed={0.3} />

        <OrbitControls
          enableZoom
          enablePan
          minDistance={6}
          maxDistance={55}
          autoRotate
          autoRotateSpeed={0.08}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
        />

        <Sun />

        {planets.map((p) => {
          const cfg = PLANET_CONFIG[p.name];
          if (!cfg) return null;
          return (
            <React.Fragment key={p.id}>
              <OrbitRing radius={cfg.orbit} />
              <Planet
                data={p}
                config={cfg}
                onSelect={setSelected}
                isSelected={selected?.id === p.id}
              />
            </React.Fragment>
          );
        })}
      </Canvas>

      {/* Info Panel */}
      <InfoPanel
        planet={selected}
        onClose={() => setSelected(null)}
        onFlashcards={() => navigate('/space/flashcards')}
      />

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
