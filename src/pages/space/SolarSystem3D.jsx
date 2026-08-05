import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Ring } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info } from 'lucide-react';
import { planets } from '../../data/space-data.js';
import './space.css';

/*
 * 3D Solar Explorer
 * Uses the planet data from space-data.js.
 * Key fields: name, diameter (number, km), distanceFromSun (number, km), color, funFacts[], etc.
 */

// Scaled visual sizes for each planet so they look good in the scene
const VISUAL = {
  Mercury:  { size: 0.25, orbit: 3,   speed: 4.15,  tilt: 0 },
  Venus:    { size: 0.45, orbit: 4.5,  speed: 1.62,  tilt: 2.6 },
  Earth:    { size: 0.5,  orbit: 6,    speed: 1.0,   tilt: 23.4 },
  Mars:     { size: 0.35, orbit: 7.8,  speed: 0.53,  tilt: 25.2 },
  Jupiter:  { size: 1.2,  orbit: 10.5, speed: 0.084, tilt: 3.1 },
  Saturn:   { size: 1.0,  orbit: 13.5, speed: 0.034, tilt: 26.7 },
  Uranus:   { size: 0.7,  orbit: 16,   speed: 0.012, tilt: 82.2 },
  Neptune:  { size: 0.65, orbit: 18.5, speed: 0.006, tilt: 28.3 },
};

/* ─── Sun ─── */
function Sun() {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.1; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshBasicMaterial color="#ffcc00" />
      <pointLight intensity={2} distance={50} decay={2} />
    </mesh>
  );
}

/* ─── Orbit ring (visual only) ─── */
function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const pts = [];
    const segs = 128;
    for (let i = 0; i <= segs; i++) {
      const angle = (i / segs) * Math.PI * 2;
      pts.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }
    return new Float32Array(pts);
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={points}
          count={points.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#334" transparent opacity={0.35} />
    </line>
  );
}

/* ─── Planet sphere that orbits the sun ─── */
function PlanetMesh({ data, vis, onSelect }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = initialAngle.current + t * vis.speed * 0.3;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * vis.orbit;
      groupRef.current.position.z = Math.sin(angle) * vis.orbit;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const hasSaturnRings = data.name === 'Saturn';

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      >
        <sphereGeometry args={[vis.size, 32, 32]} />
        <meshStandardMaterial color={data.color || '#888'} roughness={0.7} metalness={0.1} />
      </mesh>
      {hasSaturnRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[vis.size * 1.3, vis.size * 2, 64]} />
          <meshStandardMaterial color="#c2b280" side={2} transparent opacity={0.6} />
        </mesh>
      )}
      <Html distanceFactor={12} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{
          color: '#fff', fontSize: '0.65rem', fontWeight: 600,
          textShadow: '0 0 6px rgba(0,0,0,0.9)', userSelect: 'none',
        }}>
          {data.name}
        </div>
      </Html>
    </group>
  );
}

/* ─── Main component ─── */
export default function SolarSystem3D() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="space-module solar-system-mode" style={{ position: 'relative' }}>
      {/* Overlay nav */}
      <div className="space-nav overlay-nav" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Back</button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 12, 22], fov: 55 }}
        style={{ width: '100%', height: '100vh', background: '#050510' }}
      >
        <ambientLight intensity={0.15} />
        <Stars radius={200} depth={60} count={6000} factor={5} saturation={0} fade speed={0.5} />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={5}
          maxDistance={45}
          autoRotate
          autoRotateSpeed={0.15}
        />
        <Sun />
        {planets.map((p) => {
          const vis = VISUAL[p.name];
          if (!vis) return null;
          return (
            <React.Fragment key={p.id}>
              <OrbitRing radius={vis.orbit} />
              <PlanetMesh data={p} vis={vis} onSelect={setSelected} />
            </React.Fragment>
          );
        })}
      </Canvas>

      {/* Planet info card */}
      {selected && (
        <div className="planet-info-card" style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          width: '90%', maxWidth: 380, zIndex: 20,
          background: 'rgba(10,10,30,0.92)', backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '20px 24px', color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: selected.color || '#888',
              boxShadow: `0 0 16px ${selected.color || '#888'}`,
            }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{selected.name}</h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{selected.type}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
            <div><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Moons</span><br/><span style={{ fontWeight: 700 }}>{selected.moons}</span></div>
            <div><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Temperature</span><br/><span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selected.temperature}</span></div>
            <div><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Year</span><br/><span style={{ fontWeight: 700 }}>{selected.yearLength}</span></div>
            <div><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Gravity</span><br/><span style={{ fontWeight: 700 }}>{selected.gravity}</span></div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Info size={14} style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>Fun Fact</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
              {selected.funFacts?.[0] || 'No fact available.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
