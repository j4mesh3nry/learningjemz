import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Preload } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { planets } from '../../data/space-data.js';

/*
 * 3D Solar Explorer — Real textures from Solar System Scope (educational use)
 * All textures are pre-loaded as a batch so each planet gets the correct map.
 */

const PLANET_CONFIG = {
  Mercury:  { size: 0.32, orbit: 4.2,  speed: 1.60, emissive: '#888888', emissiveIntensity: 0.0 },
  Venus:    { size: 0.50, orbit: 5.8,  speed: 1.17, emissive: '#e3bb76', emissiveIntensity: 0.0 },
  Earth:    { size: 0.55, orbit: 7.5,  speed: 1.00, emissive: '#2266aa', emissiveIntensity: 0.0 },
  Mars:     { size: 0.40, orbit: 9.2,  speed: 0.80, emissive: '#aa4422', emissiveIntensity: 0.0 },
  Jupiter:  { size: 1.40, orbit: 12.5, speed: 0.44, emissive: '#c49a6c', emissiveIntensity: 0.0 },
  Saturn:   { size: 1.15, orbit: 16.0, speed: 0.32, emissive: '#d4c07a', emissiveIntensity: 0.0 },
  Uranus:   { size: 0.80, orbit: 19.5, speed: 0.22, emissive: '#7fcfcf', emissiveIntensity: 0.0 },
  Neptune:  { size: 0.75, orbit: 22.5, speed: 0.18, emissive: '#3355bb', emissiveIntensity: 0.0 },
};

/* ─── Scene background setter ─── */
function SceneBackground() {
  const { scene } = useThree();
  useMemo(() => { scene.background = new THREE.Color('#050510'); }, [scene]);
  return null;
}

/* ─── Orbit ring ─── */
function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    return new Float32Array(pts);
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#3366aa" transparent opacity={0.3} />
    </line>
  );
}

/* ─── Glowing Sun ─── */
function Sun({ textures }) {
  const meshRef = useRef();
  useFrame((_, dt) => { if (meshRef.current) meshRef.current.rotation.y += dt * 0.04; });
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial map={textures.Sun} />
      </mesh>
      {/* corona glow layers */}
      <mesh><sphereGeometry args={[2.55, 32, 32]} /><meshBasicMaterial color="#FDB813" transparent opacity={0.12} /></mesh>
      <mesh><sphereGeometry args={[3.1, 32, 32]} /><meshBasicMaterial color="#ff8800" transparent opacity={0.05} /></mesh>
      <pointLight color="#FDB813" intensity={4} distance={100} decay={1.4} />
      <Html position={[0, -3.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#FDB813', fontSize: '0.68rem', fontWeight: 700, textShadow: '0 0 12px #FDB813', letterSpacing: 1 }}>SUN</div>
      </Html>
    </group>
  );
}

/* ─── Individual planet (receives its texture as a prop) ─── */
function Planet({ data, config, texture, ringTexture, onSelect }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();
  const angle0 = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);

  const isSaturn = data.name === 'Saturn';
  const isUranus = data.name === 'Uranus';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = angle0.current + t * config.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(a) * config.orbit;
      groupRef.current.position.z = Math.sin(a) * config.orbit;
    }
    if (meshRef.current) meshRef.current.rotation.y += 0.007;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(hovered ? 1.45 + Math.sin(t * 5) * 0.05 : 1.3);
      glowRef.current.material.opacity = hovered ? 0.28 : 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* soft glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[config.size, 16, 16]} />
        <meshBasicMaterial color={data.color || '#888'} transparent opacity={0.08} />
      </mesh>

      {/* planet body */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.size, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.0}
          emissive={hovered ? data.color || '#444' : '#000'}
          emissiveIntensity={hovered ? 0.12 : 0}
        />
      </mesh>

      {/* Saturn rings */}
      {isSaturn && (
        <mesh rotation={[Math.PI / 2.8, 0, 0.3]}>
          <ringGeometry args={[config.size * 1.38, config.size * 2.3, 80]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {/* Uranus thin ring */}
      {isUranus && (
        <mesh rotation={[0.2, 0, Math.PI / 2.1]}>
          <ringGeometry args={[config.size * 1.3, config.size * 1.52, 64]} />
          <meshStandardMaterial color="#99ccdd" side={THREE.DoubleSide} transparent opacity={0.25} />
        </mesh>
      )}

      {/* name label */}
      <Html position={[0, -(config.size + 0.5), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div style={{
          color: hovered ? '#fff' : 'rgba(255,255,255,0.65)',
          fontSize: hovered ? '0.78rem' : '0.65rem',
          fontWeight: 700,
          textShadow: `0 0 8px ${data.color || '#888'}`,
          transition: 'all 0.2s',
          userSelect: 'none',
          letterSpacing: 0.5,
        }}>
          {data.name}
        </div>
      </Html>
    </group>
  );
}

/* ─── Scene — loads ALL textures once, passes them as props ─── */
function Scene({ onSelect }) {
  const textures = useTexture({
    Sun:     '/textures/planets/sun.jpg',
    Mercury: '/textures/planets/mercury.jpg',
    Venus:   '/textures/planets/venus.jpg',
    Earth:   '/textures/planets/earth.jpg',
    Mars:    '/textures/planets/mars.jpg',
    Jupiter: '/textures/planets/jupiter.jpg',
    Saturn:  '/textures/planets/saturn.jpg',
    Uranus:  '/textures/planets/uranus.jpg',
    Neptune: '/textures/planets/neptune.jpg',
    SaturnRing: '/textures/planets/saturn_ring.png',
  });

  return (
    <>
      <SceneBackground />
      <ambientLight intensity={0.06} color="#4455aa" />
      <directionalLight position={[15, 8, 5]} intensity={0.08} color="#8899ff" />
      <Stars radius={350} depth={80} count={9000} factor={5} saturation={0.15} fade speed={0.2} />
      <OrbitControls
        enableZoom
        enablePan
        minDistance={5}
        maxDistance={120}
        autoRotate
        autoRotateSpeed={0.07}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 8}
      />
      <Sun textures={textures} />
      {planets.map((p) => {
        const cfg = PLANET_CONFIG[p.name];
        if (!cfg) return null;
        return (
          <React.Fragment key={p.id}>
            <OrbitRing radius={cfg.orbit} />
            <Planet
              data={p}
              config={cfg}
              texture={textures[p.name]}
              ringTexture={textures.SaturnRing}
              onSelect={onSelect}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ─── Info Panel ─── */
function InfoPanel({ planet, onClose, onFlashcards }) {
  if (!planet) return null;
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '0 12px 16px', animation: 'slideUp 0.3s ease' }}>
      <div style={{
        maxWidth: 420, margin: '0 auto',
        background: 'linear-gradient(145deg, rgba(12,12,38,0.97), rgba(6,6,20,0.99))',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px 20px 16px 16px',
        padding: '24px', color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 -8px 40px rgba(0,0,0,0.6), 0 0 30px ${planet.color}18`,
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}>
          <X size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, ${planet.color}dd, ${planet.color}44)`,
            boxShadow: `0 0 24px ${planet.color}55, inset 0 -4px 8px rgba(0,0,0,0.3)`,
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{planet.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{planet.type}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 16 }}>
          {[
            { label: 'Moons', value: planet.moons },
            { label: 'Temperature', value: planet.temperature?.split(' ')[0] || '—' },
            { label: 'Year Length', value: planet.yearLength },
            { label: 'Gravity', value: planet.gravity },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${planet.color}10, ${planet.color}06)`,
          borderRadius: 12, padding: '12px 16px',
          border: `1px solid ${planet.color}20`, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} style={{ color: planet.color, opacity: 0.8 }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: planet.color, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fun Fact</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.83)' }}>
            {planet.funFacts?.[0] || 'No fact available.'}
          </p>
        </div>
        <button onClick={onFlashcards} style={{
          width: '100%', padding: '12px',
          background: `linear-gradient(135deg, ${planet.color}cc, ${planet.color}88)`,
          border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: `0 4px 16px ${planet.color}40`,
        }}>
          Learn More in Flashcards <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export default function SolarSystem3D() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh',
      background: '#050510', overflow: 'hidden',
    }}>
      {/* Nav bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={() => navigate('/space')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
          padding: '6px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem',
          fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
        }}>
          🪐 Solar Explorer
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: selected ? 320 : 22, left: '50%',
        transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none',
        color: 'rgba(255,255,255,0.22)', fontSize: '0.68rem', fontWeight: 500,
        textAlign: 'center', transition: 'bottom 0.3s ease',
      }}>
        Drag to rotate · Scroll to zoom · Tap a planet
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [8, 18, 28], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene onSelect={setSelected} />
        </Suspense>
      </Canvas>

      {/* Info panel */}
      <InfoPanel planet={selected} onClose={() => setSelected(null)} onFlashcards={() => navigate('/space/flashcards')} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
