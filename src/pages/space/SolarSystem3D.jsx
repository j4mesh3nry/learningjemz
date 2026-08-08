import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Preload, useProgress } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info } from 'lucide-react';
import * as THREE from 'three';
import { planets, sunData } from '../../data/space-data.js';
import JemzLoader from '../../components/JemzLoader';
import './space.css';

/* Texture paths (served from public/) */
const TEXTURE_PATHS = {
  Sun: '/textures/planets/sun.jpg',
  Mercury: '/textures/planets/mercury.jpg',
  Venus: '/textures/planets/venus.jpg',
  Earth: '/textures/planets/earth.jpg',
  Mars: '/textures/planets/mars.jpg',
  Jupiter: '/textures/planets/jupiter.jpg',
  Saturn: '/textures/planets/saturn.jpg',
  Uranus: '/textures/planets/uranus.jpg',
  Neptune: '/textures/planets/neptune.jpg',
  SaturnRing: '/textures/planets/saturn_ring.png',
};

/* Planet orbital configs */
const PLANET_CONFIG = {
  Mercury: { size: 0.32, orbit: 4.2, speed: 1.6, emissive: '#888888', emissiveIntensity: 0, rotationSpeed: 0.0005, tilt: 0.03 },
  Venus:   { size: 0.5,  orbit: 5.8, speed: 1.17, emissive: '#e3bb76', emissiveIntensity: 0, rotationSpeed: -0.0002, tilt: 3.1 },
  Earth:   { size: 0.55, orbit: 7.5, speed: 1.0, emissive: '#2266aa', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.41, moons: [{ name: 'Moon', size: 0.12, distance: 1.0, speed: 2.0, color: '#dddddd' }] },
  Mars:    { size: 0.4,  orbit: 9.2, speed: 0.8, emissive: '#aa4422', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.44 },
  Jupiter: { size: 1.4,  orbit: 12.5, speed: 0.44, emissive: '#c49a6c', emissiveIntensity: 0, rotationSpeed: 0.012, tilt: 0.05, moons: [{ name: 'Europa', size: 0.15, distance: 1.9, speed: 1.5, color: '#e6dfd1' }] },
  Saturn:  { size: 1.15, orbit: 16.0, speed: 0.32, emissive: '#d4c07a', emissiveIntensity: 0, rotationSpeed: 0.011, tilt: 0.47, moons: [{ name: 'Titan', size: 0.22, distance: 2.8, speed: 0.8, color: '#d39c55' }] },
  Uranus:  { size: 0.8,  orbit: 19.5, speed: 0.22, emissive: '#7fcfcf', emissiveIntensity: 0, rotationSpeed: -0.007, tilt: 1.71 },
  Neptune: { size: 0.75, orbit: 22.5, speed: 0.18, emissive: '#3355bb', emissiveIntensity: 0, rotationSpeed: 0.008, tilt: 0.49 },
};

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
      <lineBasicMaterial color="#3366cc" transparent opacity={0.25} />
    </line>
  );
}

/* ─── Asteroid Belt ─── */
function AsteroidBelt({ count = 4000, innerRadius = 10.0, outerRadius = 11.2 }) {
  const points = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 0.4; // slight vertical scatter
      pts[i * 3] = Math.cos(angle) * radius;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pts;
  }, [count, innerRadius, outerRadius]);

  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#c0b0a0" size={0.08} sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

/* ─── Glowing Sun ─── */
const Sun = React.forwardRef(({ onSelect }, ref) => {
  const groupRef = useRef();
  React.useImperativeHandle(ref, () => groupRef.current);
  
  const meshRef = useRef();
  const sunTexture = useTexture(TEXTURE_PATHS.Sun);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(sunData); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.06} />
      </mesh>
      <pointLight color="#FDB813" intensity={200} distance={200} decay={1.5} />
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
});

/* ─── Camera Controller ─── */
function CameraController({ selected, planetRefs, controlsRef }) {
  const target = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(() => {
    if (!controlsRef.current) return;
    if (selected && planetRefs.current[selected.name]) {
      planetRefs.current[selected.name].getWorldPosition(target);
      controlsRef.current.target.lerp(target, 0.05);
    }
  });
  return null;
}

/* ─── Moon component ─── */
function Moon({ config }) {
  const moonRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(t * config.speed) * config.distance;
      moonRef.current.position.z = Math.sin(t * config.speed) * config.distance;
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[config.size, 16, 16]} />
      <meshStandardMaterial color={config.color} roughness={0.8} />
    </mesh>
  );
}

/* ─── Planet component ─── */
const Planet = React.forwardRef(({ data, config, onSelect }, ref) => {
  const groupRef = useRef();
  
  React.useImperativeHandle(ref, () => groupRef.current);

  const meshRef = useRef();
  const glowRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(TEXTURE_PATHS[data.name] || TEXTURE_PATHS.Earth);
  const saturnRingTex = useTexture(TEXTURE_PATHS.SaturnRing);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = initialAngle.current + t * config.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * config.orbit;
      groupRef.current.position.z = Math.sin(angle) * config.orbit;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = config.tilt || 0;
      meshRef.current.rotation.y += config.rotationSpeed || 0.008;
    }
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
        <mesh rotation={[Math.PI / 2 + (config.tilt || 0), 0, 0]}>
          <ringGeometry args={[config.size * 1.4, config.size * 2.2, 64]} />
          <meshStandardMaterial
            map={saturnRingTex}
            emissive="#d4c58a"
            emissiveIntensity={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Orbiting Moons */}
      {config.moons && config.moons.map((m, i) => <Moon key={i} config={m} />)}

      {/* Uranus thin ring */}
      {isUranus && (
        <mesh rotation={[0.3, 0, Math.PI / 2]}>
          <ringGeometry args={[config.size * 1.3, config.size * 1.5, 64]} />
          <meshStandardMaterial color="#88bbcc" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, -(config.size + 0.5), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
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
});

/* ─── Info Panel Component ─── */
function InfoPanel({ planet, onClose }) {
  if (!planet) return null;
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '0 12px 16px', animation: 'slideUp 0.3s ease' }}>
      <div style={{
        maxWidth: 420, margin: '0 auto',
        background: 'linear-gradient(145deg, rgba(15,15,40,0.95), rgba(8,8,25,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px 20px 16px 16px',
        padding: '24px', color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 0 30px ${planet.color}22`,
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
        }}>
          <X size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundImage: `url(${TEXTURE_PATHS[planet.name] || TEXTURE_PATHS.Earth})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            boxShadow: `0 0 20px ${planet.color}55, inset -4px -4px 12px rgba(0,0,0,0.6)`,
            flexShrink: 0,
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.3px' }}>{planet.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{planet.type}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 16 }}>
          {[{ label: 'Moons', value: planet.moons },
            { label: 'Temperature', value: planet.temperature?.split(' ')[0] || '—' },
            { label: 'Year Length', value: planet.yearLength },
            { label: 'Gravity', value: planet.gravity }].map((stat) => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${planet.color}11, ${planet.color}08)`,
          borderRadius: 12, padding: '12px 16px',
          border: `1px solid ${planet.color}22`, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} style={{ color: planet.color, opacity: 0.8 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: planet.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fun Fact</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>{planet.funFacts?.[0] || 'No fact available.'}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── 3D Loading Overlay ─── */
function SolarLoadingOverlay() {
  const { active, progress } = useProgress();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active || progress >= 100) {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    } else {
      setLoading(true);
    }
  }, [active, progress]);

  if (!loading) return null;

  return (
    <JemzLoader
      message="Loading 3D Solar System..."
      subtext={`Downloading 2K planet textures & orbits... ${Math.round(progress)}%`}
      darkTheme={true}
      fullScreen={true}
    />
  );
}

/* ─── Main Component ─── */
export default function SolarSystem3D() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const planetRefs = useRef({});
  const controlsRef = useRef();

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #050510 60%, #020208 100%)',
      overflow: 'hidden',
    }}>
      <SolarLoadingOverlay />
      {/* Nav */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={() => navigate('/space')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '8px 14px',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem',
          cursor: 'pointer', transition: 'background 0.2s',
        }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
          padding: '6px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 600,
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          🪐 Solar Explorer
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: selected ? 320 : 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none',
        color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', fontWeight: 500,
        textAlign: 'center', transition: 'bottom 0.3s ease',
      }}>
        Swipe to rotate · Pinch to zoom · Tap a planet
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [8, 18, 28], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#050510'); }}
      >
        <ambientLight intensity={1.5} color="#6688cc" />
        <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
        <Stars radius={300} depth={80} count={8000} factor={5} saturation={0.2} fade speed={0.3} />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan
          minDistance={6}
          maxDistance={120}
          autoRotate={!selected}
          autoRotateSpeed={0.08}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
        />
        <CameraController selected={selected} planetRefs={planetRefs} controlsRef={controlsRef} />
        <Suspense fallback={null}>
          <Sun ref={(el) => planetRefs.current['Sun'] = el} onSelect={setSelected} />
          <AsteroidBelt />
          {planets.map((p) => {
            const cfg = PLANET_CONFIG[p.name];
            if (!cfg) return null;
            return (
              <React.Fragment key={p.id}>
                <OrbitRing radius={cfg.orbit} />
                <Planet 
                  ref={(el) => planetRefs.current[p.name] = el}
                  data={p} 
                  config={cfg} 
                  onSelect={setSelected} 
                />
              </React.Fragment>
            );
          })}
        </Suspense>
        <Preload all />
      </Canvas>

      <InfoPanel planet={selected} onClose={() => setSelected(null)} />

      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
