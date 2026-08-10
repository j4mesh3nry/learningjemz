import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Preload, useProgress } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info, Gauge, Flame, Leaf, Mountain, Globe, Sparkles, RefreshCcw, Wind, Orbit, Zap } from 'lucide-react';
import * as THREE from 'three';
import { planets, sunData, dwarfPlanets } from '../../data/space-data.js';
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
  Pluto: '/textures/objects/pluto.jpg',
  Ceres: '/textures/objects/ceres.jpg',
};

/* Planet orbital configs
   Distances: Logarithmically scaled relative orbits (Mercury 10.5 -> Pluto 68.0)
              Leaves clean room outside the Sun's grand coronal glow.
   Sizes: True comparative relative scales:
          Sun (3.6) >> Jupiter (1.6) > Saturn (1.3) > Uranus (0.85) >= Neptune (0.82)
          > Earth (0.48) >= Venus (0.45) > Mars (0.28) > Mercury (0.22) > Pluto (0.14) > Ceres (0.08) */
const PLANET_CONFIG = {
  Mercury: { size: 0.22, orbit: 10.5, speed: 1.6, emissive: '#888888', emissiveIntensity: 0, rotationSpeed: 0.0005, tilt: 0.03 },
  Venus:   { size: 0.45, orbit: 13.0, speed: 1.17, emissive: '#e3bb76', emissiveIntensity: 0, rotationSpeed: -0.0002, tilt: 3.1 },
  Earth:   { size: 0.48, orbit: 15.5, speed: 1.0, emissive: '#2266aa', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.41, moons: [
    { name: 'Luna', size: 0.13, distance: 1.1, speed: 2.0, color: '#dddddd' }
  ]},
  Mars:    { size: 0.28, orbit: 18.5, speed: 0.8, emissive: '#aa4422', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.44 },
  Ceres:   { size: 0.08, orbit: 22.5, speed: 0.6, emissive: '#c8c2b8', emissiveIntensity: 0, rotationSpeed: 0.003, tilt: 0.04 },
  Jupiter: { size: 1.60, orbit: 29.5, speed: 0.44, emissive: '#c49a6c', emissiveIntensity: 0, rotationSpeed: 0.012, tilt: 0.05, moons: [
    { name: 'Io', size: 0.13, distance: 2.2, speed: 2.5, color: '#d9a74a' },
    { name: 'Europa', size: 0.12, distance: 2.9, speed: 1.8, color: '#e6dfd1' },
    { name: 'Ganymede', size: 0.18, distance: 3.6, speed: 1.2, color: '#b5a48e' },
    { name: 'Callisto', size: 0.16, distance: 4.4, speed: 0.8, color: '#8a8074' }
  ]},
  Saturn:  { size: 1.30, orbit: 39.0, speed: 0.32, emissive: '#d4c07a', emissiveIntensity: 0, rotationSpeed: 0.011, tilt: 0.47, moons: [
    { name: 'Tethys', size: 0.08, distance: 3.4, speed: 2.2, color: '#cfc7bd' },
    { name: 'Dione', size: 0.09, distance: 4.0, speed: 1.8, color: '#d0c8be' },
    { name: 'Rhea', size: 0.11, distance: 4.6, speed: 1.4, color: '#c2b6a3' },
    { name: 'Titan', size: 0.18, distance: 5.3, speed: 0.9, color: '#d39c55' },
    { name: 'Iapetus', size: 0.10, distance: 6.2, speed: 0.5, color: '#999085' }
  ]},
  Uranus:  { size: 0.85, orbit: 49.5, speed: 0.22, emissive: '#7fcfcf', emissiveIntensity: 0, rotationSpeed: -0.007, tilt: 1.71, moons: [
    { name: 'Ariel', size: 0.09, distance: 1.5, speed: 2.2, color: '#c5bbb0' },
    { name: 'Umbriel', size: 0.09, distance: 2.0, speed: 1.7, color: '#706b63' },
    { name: 'Titania', size: 0.11, distance: 2.6, speed: 1.2, color: '#b0a599' },
    { name: 'Oberon', size: 0.10, distance: 3.2, speed: 0.8, color: '#a3978a' }
  ]},
  Neptune: { size: 0.82, orbit: 59.5, speed: 0.18, emissive: '#3355bb', emissiveIntensity: 0, rotationSpeed: 0.008, tilt: 0.49, moons: [
    { name: 'Triton', size: 0.14, distance: 1.8, speed: -1.2, color: '#b3c2c7' }
  ]},
  Pluto:   { size: 0.14, orbit: 68.0, speed: 0.16, emissive: '#a89f91', emissiveIntensity: 0, rotationSpeed: 0.001, tilt: 2.03, binary: { companionName: 'Charon', companionSize: 0.07, distance: 0.55, speed: 1.2, color: '#888888', massRatio: 0.118 } },
};

/* ─── Educational badges shown in the Info Panel ─── */
const PLANET_BADGES = {
  sun: {
    icon: Zap, title: 'Giver of Light', color: '#FDB813',
    text: "Contains 99.86% of all mass in the solar system — truly 109× Earth's width. Rendered with a commanding central presence so all orbiting worlds remain clear and easy to explore."
  },
  mercury: {
    icon: Gauge, title: 'Fastest Planet', color: '#b8b8b8',
    text: 'Zips around the Sun every 88 Earth days — the quickest orbit of any planet.'
  },
  venus: {
    icon: Flame, title: 'Hottest Planet', color: '#e3bb76',
    text: 'A runaway greenhouse effect pushes surface temperatures to a scorching 462°C.'
  },
  earth: {
    icon: Leaf, title: 'Only Known Life', color: '#2b82c9',
    text: 'The only world known to harbor life, with liquid oceans covering 71% of its surface.'
  },
  mars: {
    icon: Mountain, title: 'Red Planet', color: '#c1440e',
    text: 'Home to Olympus Mons, the tallest volcano in the solar system — nearly 3× the height of Everest.'
  },
  jupiter: {
    icon: Globe, title: 'Largest Planet', color: '#d39c7e',
    text: 'The Great Red Spot storm has raged for centuries, and 1,300 Earths could fit inside.'
  },
  saturn: {
    icon: Sparkles, title: 'Ringed Giant', color: '#ead6b8',
    text: 'The least dense planet — it could float in water if a big enough bathtub existed.'
  },
  uranus: {
    icon: RefreshCcw, title: 'Sideways Rotation', color: '#4b70dd',
    text: 'Tipped 98° on its side, it rolls around the Sun like a barrel.'
  },
  neptune: {
    icon: Wind, title: 'Windiest Planet', color: '#274687',
    text: 'Supersonic winds reach 2,100 km/h — the fastest in the solar system.'
  },
  ceres: {
    icon: Orbit, title: 'Asteroid Belt King', color: '#c8c2b8',
    text: 'The largest object in the asteroid belt and the only dwarf planet living there.'
  },
  pluto: {
    icon: Orbit, title: 'Binary Dwarf Planet System', color: '#ffcc66',
    text: "Pluto and Charon orbit a shared center of mass outside Pluto's surface."
  }
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
function AsteroidBelt({ count = 3500, innerRadius = 21.0, outerRadius = 24.0 }) {
  const points = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 1.5; // slight vertical scatter
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
      <pointsMaterial color="#c0b0a0" size={0.08} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

/* ─── Glowing Sun ─── */
const Sun = React.forwardRef(({ onSelect, labelsHidden }, ref) => {
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
        <sphereGeometry args={[3.6, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.4, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.06} />
      </mesh>
      <pointLight color="#FDB813" intensity={400} distance={400} decay={1} />
      <Html position={[0, -4.8, 0]} center style={{ pointerEvents: 'none', opacity: labelsHidden ? 0 : 1, transition: 'opacity 0.2s ease' }} zIndexRange={[5, 0]}>
        <div style={{
          color: '#FDB813', fontSize: '0.75rem', fontWeight: 700,
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
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = initialAngle.current + t * config.speed;
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(angle) * config.distance;
      moonRef.current.position.z = Math.sin(angle) * config.distance;
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
const Planet = React.forwardRef(({ data, config, onSelect, labelsHidden }, ref) => {
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
          <ringGeometry args={[config.size * 1.35, config.size * 2.3, 64]} />
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
      <Html position={[0, -(config.size + 0.4), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap', opacity: labelsHidden ? 0 : 1, transition: 'opacity 0.2s ease' }} zIndexRange={[5, 0]}>
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

/* ─── Binary Dwarf Planet System (Pluto + Charon) ───
   Both bodies orbit the group origin, which IS the barycenter (shared center
   of mass). massRatio = companion mass / primary mass; with Charon at 0.118,
   the barycenter lands outside Pluto's surface, just like the real system. */
const BinarySystem = React.forwardRef(({ data, config, onSelect, labelsHidden }, ref) => {
  const groupRef = useRef();
  React.useImperativeHandle(ref, () => groupRef.current);

  const primaryRef = useRef();
  const companionRef = useRef();
  const glowRef = useRef();
  const labelRef = useRef();
  const companionLabelRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(TEXTURE_PATHS[data.name] || TEXTURE_PATHS.Earth);

  const D = config.binary.distance;
  const ratio = config.binary.massRatio;
  const primaryOffset = (D * ratio) / (1 + ratio);
  const companionOffset = D / (1 + ratio);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // The whole system orbits the Sun on the primary's orbit path
    const angle = initialAngle.current + t * config.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * config.orbit;
      groupRef.current.position.z = Math.sin(angle) * config.orbit;
    }
    // Both bodies orbit the barycenter (group origin), on opposite sides
    const bAngle = t * config.binary.speed;
    if (primaryRef.current) {
      primaryRef.current.position.x = Math.cos(bAngle) * primaryOffset;
      primaryRef.current.position.z = Math.sin(bAngle) * primaryOffset;
      primaryRef.current.rotation.z = config.tilt || 0;
      primaryRef.current.rotation.y += config.rotationSpeed || 0.008;
    }
    if (companionRef.current) {
      companionRef.current.position.x = -Math.cos(bAngle) * companionOffset;
      companionRef.current.position.z = -Math.sin(bAngle) * companionOffset;
      companionRef.current.rotation.y += 0.005;
    }
    // Glow + labels follow the primary body
    if (glowRef.current && primaryRef.current) {
      glowRef.current.position.copy(primaryRef.current.position);
      const scale = hovered ? 1.4 + Math.sin(t * 4) * 0.1 : 1.3;
      glowRef.current.scale.setScalar(scale);
      glowRef.current.material.opacity = hovered ? 0.25 : 0.1;
    }
    if (labelRef.current && primaryRef.current) {
      labelRef.current.position.copy(primaryRef.current.position);
    }
    if (companionLabelRef.current && companionRef.current) {
      companionLabelRef.current.position.copy(companionRef.current.position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow aura around Pluto */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial color={config.emissive} transparent opacity={0.1} />
      </mesh>

      {/* Pluto body */}
      <mesh
        ref={primaryRef}
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

      {/* Charon body */}
      <mesh ref={companionRef}>
        <sphereGeometry args={[config.binary.companionSize, 32, 32]} />
        <meshStandardMaterial color={config.binary.color} roughness={0.8} />
      </mesh>

      {/* Pluto label */}
      <group ref={labelRef}>
        <Html position={[0, -(config.size + 0.4), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap', opacity: labelsHidden ? 0 : 1, transition: 'opacity 0.2s ease' }} zIndexRange={[5, 0]}>
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

      {/* Charon label */}
      <group ref={companionLabelRef}>
        <Html position={[0, -(config.binary.companionSize + 0.3), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap', opacity: labelsHidden ? 0 : 1, transition: 'opacity 0.2s ease' }} zIndexRange={[5, 0]}>
          <div style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.55rem',
            fontWeight: 600,
            userSelect: 'none',
            letterSpacing: '0.5px',
          }}>
            {config.binary.companionName}
          </div>
        </Html>
      </group>
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
        background: 'rgba(11,13,34,0.72)',
        backdropFilter: 'blur(18px)',
        borderRadius: '20px 20px 16px 16px',
        padding: '24px', color: '#fff',
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 6px 0 #07081a',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
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
            border: `2px solid ${planet.color || '#888'}`,
            flexShrink: 0,
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.3px' }}>{planet.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{planet.type}</span>
          </div>
        </div>
        {PLANET_BADGES[planet.id] && (() => {
          const badge = PLANET_BADGES[planet.id];
          const BadgeIcon = badge.icon;
          return (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 12px',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 800, color: badge.color, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                <BadgeIcon size={12} /> {badge.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{badge.text}</p>
            </div>
          );
        })()}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 16 }}>
          {[{ label: 'Moons', value: planet.moons },
            { label: 'Temperature', value: planet.temperature?.split(' ')[0] || '—' },
            { label: 'Year Length', value: planet.yearLength },
            { label: 'Gravity', value: planet.gravity }].map((stat) => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', border: '1.5px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: '12px 16px',
          border: '1.5px solid rgba(255,255,255,0.08)', marginBottom: 14,
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
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!active || progress >= 100) {
      const elapsed = Date.now() - startTimeRef.current;
      const minDisplayTime = 650;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      const timer = setTimeout(() => setLoading(false), remaining);
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
        camera={{ position: [20, 45, 75], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#050510'); }}
      >
        <ambientLight intensity={1.2} color="#6688cc" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <Stars radius={1500} depth={300} count={12000} factor={5} saturation={0.2} fade speed={0.3} />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan
          screenSpacePanning={true}
          minDistance={3}
          maxDistance={1200}
          autoRotate={!selected}
          autoRotateSpeed={0.08}
          maxPolarAngle={Math.PI - 0.05}
          minPolarAngle={0.01}
        />
        <CameraController selected={selected} planetRefs={planetRefs} controlsRef={controlsRef} />
        <Suspense fallback={null}>
          <Sun ref={(el) => planetRefs.current['Sun'] = el} onSelect={setSelected} labelsHidden={!!selected} />
          <AsteroidBelt />
          {planets.concat(dwarfPlanets).map((p) => {
            const cfg = PLANET_CONFIG[p.name];
            if (!cfg) return null;
            return (
              <React.Fragment key={p.id}>
                <OrbitRing radius={cfg.orbit} />
                {cfg.binary ? (
                  <BinarySystem 
                    ref={(el) => planetRefs.current[p.name] = el}
                    data={p} 
                    config={cfg} 
                    onSelect={setSelected} 
                    labelsHidden={!!selected}
                  />
                ) : (
                  <Planet 
                    ref={(el) => planetRefs.current[p.name] = el}
                    data={p} 
                    config={cfg} 
                    onSelect={setSelected} 
                    labelsHidden={!!selected}
                  />
                )}
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
