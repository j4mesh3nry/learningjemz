import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Preload, useProgress } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info, Gauge, Flame, Leaf, Mountain, Globe, Sparkles, RefreshCcw, Wind, Orbit, Zap, Circle } from 'lucide-react';
import * as THREE from 'three';
import { planets, sunData, dwarfPlanets, moons } from '../../data/space-data.js';
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

/* Planet & Moon orbital configs
   Distances: Logarithmically scaled relative orbits (Mercury 10.5 -> Pluto 68.0)
              Leaves clean room outside the Sun's grand coronal glow.
   Sizes: True 1:1 proportional comparative scales (relative to Mercury 0.22 = 4,879 km):
          Sun (3.6) >> Jupiter (1.60) > Saturn (1.30) > Uranus (0.85) >= Neptune (0.82)
          > Earth (0.48) >= Venus (0.45) > Mars (0.28)
          > Ganymede (0.237) > Titan (0.232) > Mercury (0.220) >= Callisto (0.217)
          > Io (0.164) >= Luna (0.156) > Europa (0.140) > Triton (0.122) > Pluto (0.107) > Ceres (0.042) */
const PLANET_CONFIG = {
  Mercury: { size: 0.22, orbit: 10.5, speed: 1.6, emissive: '#888888', emissiveIntensity: 0, rotationSpeed: 0.0005, tilt: 0.03 },
  Venus:   { size: 0.45, orbit: 13.0, speed: 1.17, emissive: '#e3bb76', emissiveIntensity: 0, rotationSpeed: -0.0002, tilt: 3.1 },
  Earth:   { size: 0.48, orbit: 15.5, speed: 1.0, emissive: '#2266aa', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.41, moons: [
    { name: 'Luna', size: 0.156, distance: 1.1, speed: 2.0, color: '#dddddd' }
  ]},
  Mars:    { size: 0.28, orbit: 18.5, speed: 0.8, emissive: '#aa4422', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.44 },
  Ceres:   { size: 0.042, orbit: 22.5, speed: 0.6, emissive: '#c8c2b8', emissiveIntensity: 0, rotationSpeed: 0.003, tilt: 0.04 },
  Jupiter: { size: 1.60, orbit: 29.5, speed: 0.44, emissive: '#c49a6c', emissiveIntensity: 0, rotationSpeed: 0.012, tilt: 0.05, moons: [
    { name: 'Io', size: 0.164, distance: 2.2, speed: 2.5, color: '#d9a74a' },
    { name: 'Europa', size: 0.140, distance: 2.9, speed: 1.8, color: '#e6dfd1' },
    { name: 'Ganymede', size: 0.237, distance: 3.7, speed: 1.2, color: '#b5a48e' },
    { name: 'Callisto', size: 0.217, distance: 4.5, speed: 0.8, color: '#8a8074' }
  ]},
  Saturn:  { size: 1.30, orbit: 39.0, speed: 0.32, emissive: '#d4c07a', emissiveIntensity: 0, rotationSpeed: 0.011, tilt: 0.47, moons: [
    { name: 'Tethys', size: 0.048, distance: 3.4, speed: 2.2, color: '#cfc7bd' },
    { name: 'Dione', size: 0.050, distance: 4.0, speed: 1.8, color: '#d0c8be' },
    { name: 'Rhea', size: 0.069, distance: 4.6, speed: 1.4, color: '#c2b6a3' },
    { name: 'Titan', size: 0.232, distance: 5.4, speed: 0.9, color: '#d39c55' },
    { name: 'Iapetus', size: 0.066, distance: 6.3, speed: 0.5, color: '#999085' }
  ]},
  Uranus:  { size: 0.85, orbit: 49.5, speed: 0.22, emissive: '#7fcfcf', emissiveIntensity: 0, rotationSpeed: -0.007, tilt: 1.71, moons: [
    { name: 'Ariel', size: 0.052, distance: 1.5, speed: 2.2, color: '#c5bbb0' },
    { name: 'Umbriel', size: 0.052, distance: 2.0, speed: 1.7, color: '#706b63' },
    { name: 'Titania', size: 0.071, distance: 2.6, speed: 1.2, color: '#b0a599' },
    { name: 'Oberon', size: 0.069, distance: 3.2, speed: 0.8, color: '#a3978a' }
  ]},
  Neptune: { size: 0.82, orbit: 59.5, speed: 0.18, emissive: '#3355bb', emissiveIntensity: 0, rotationSpeed: 0.008, tilt: 0.49, moons: [
    { name: 'Triton', size: 0.122, distance: 1.8, speed: -1.2, color: '#b3c2c7' }
  ]},
  Pluto:   { size: 0.107, orbit: 68.0, speed: 0.16, emissive: '#a89f91', emissiveIntensity: 0, rotationSpeed: 0.001, tilt: 2.03, binary: { companionName: 'Charon', companionSize: 0.055, distance: 0.55, speed: 1.2, color: '#888888', massRatio: 0.118 } },
};

/* ─── Educational badges shown in the Info Panel ─── */
const PLANET_BADGES = {
  sun: {
    icon: Zap, title: 'Giver of Light', color: '#FDB813',
    text: "Contains 99.86% of all mass in the solar system — powers every planet with nuclear light and heat."
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
    text: 'Covered in rusty iron oxide dust, creating its signature crimson surface and pinkish sky.'
  },
  jupiter: {
    icon: Globe, title: 'Largest Planet', color: '#d39c7e',
    text: 'The Great Red Spot storm has raged for centuries, and 1,300 Earths could fit inside.'
  },
  saturn: {
    icon: Sparkles, title: 'Ringed Giant', color: '#ead6b8',
    text: 'Famous for its magnificent ring system spanning 282,000 km across, composed of billions of icy particles.'
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
  const planetPos = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredCamPos = useMemo(() => new THREE.Vector3(), []);

  // Saved state before opening a planet panel
  const savedCamPos = useRef(null);
  const savedCamTarget = useRef(null);
  const prevSelected = useRef(null);
  const isRestoring = useRef(false);
  const restoreTime = useRef(0);

  useFrame(({ camera, clock }, delta) => {
    if (!controlsRef.current) return;

    // Detect transition from unselected to selected: save pre-click view state!
    if (selected && !prevSelected.current) {
      savedCamPos.current = camera.position.clone();
      savedCamTarget.current = controlsRef.current.target.clone();
      isRestoring.current = false;
    }

    // Detect transition from selected to unselected: trigger bounded restoration animation!
    if (!selected && prevSelected.current && savedCamPos.current) {
      isRestoring.current = true;
      restoreTime.current = 0;
    }
    prevSelected.current = selected;

    if (selected) {
      const targetObj = selected.isMoon ? selected.hostPlanet : selected;
      const ref = planetRefs.current[targetObj.name];
      if (ref) {
        ref.getWorldPosition(planetPos);

        // Tailored close-up zoom distance based on host planet size
        const cfg = PLANET_CONFIG[targetObj.name];
        let zoomDist = 7.0;
        if (targetObj.id === 'sun') {
          zoomDist = 15.0;
        } else if (cfg) {
          if (cfg.size >= 1.3) zoomDist = 9.5;       // Jupiter, Saturn
          else if (cfg.size >= 0.8) zoomDist = 6.2;   // Uranus, Neptune
          else if (cfg.size >= 0.25) zoomDist = 4.2;  // Earth, Venus, Mars
          else zoomDist = 3.2;                         // Mercury, Pluto, Ceres
        }

        // Camera view direction
        const camDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
        if (camDir.lengthSq() === 0) camDir.set(0, 0.5, 1).normalize();

        // Compute vertical offset so target sits gently below host planet,
        // positioning it in the open upper-middle viewport above InfoPanel!
        const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        const verticalOffset = cameraUp.clone().multiplyScalar(-zoomDist * 0.14);

        desiredTarget.copy(planetPos).add(verticalOffset);
        desiredCamPos.copy(planetPos).add(camDir.multiplyScalar(zoomDist)).add(verticalOffset);

        controlsRef.current.target.lerp(desiredTarget, 0.08);
        camera.position.lerp(desiredCamPos, 0.08);
        controlsRef.current.update();
      }
    } else if (isRestoring.current && savedCamPos.current && savedCamTarget.current) {
      // Smoothly lerp back to pre-selection view over max 0.4 seconds, then release control to user!
      restoreTime.current += delta;
      
      controlsRef.current.target.lerp(savedCamTarget.current, 0.12);
      camera.position.lerp(savedCamPos.current, 0.12);
      controlsRef.current.update();

      if (
        restoreTime.current >= 0.45 ||
        (camera.position.distanceTo(savedCamPos.current) < 0.15 &&
         controlsRef.current.target.distanceTo(savedCamTarget.current) < 0.15)
      ) {
        isRestoring.current = false;
        savedCamPos.current = null;
        savedCamTarget.current = null;
      }
    }
  });

  return null;
}

/* ─── Moon component ─── */
function Moon({ config, labelsHidden, onSelect, hostPlanet }) {
  const groupRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = initialAngle.current + t * config.speed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * config.distance;
      groupRef.current.position.z = Math.sin(angle) * config.distance;
    }
  });

  // Look up full moon data from moons dataset
  const moonData = useMemo(() => {
    const found = moons.find((m) => m.name.toLowerCase() === config.name.toLowerCase());
    return found || {
      name: config.name,
      planet: hostPlanet?.name || 'Solar System',
      diameter: '—',
      orbitalPeriod: '—',
      funFact: `A natural satellite orbiting ${hostPlanet?.name || 'its parent body'}.`
    };
  }, [config.name, hostPlanet]);

  return (
    <group ref={groupRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            ...moonData,
            ...config,
            isMoon: true,
            hostPlanet,
            initialAngle: initialAngle.current
          });
        }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.size, 16, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.8}
        />
      </mesh>
      {config.name && (
        <Html position={[0, -(config.size + 0.25), 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap', opacity: labelsHidden ? 0 : 1, transition: 'opacity 0.2s ease' }} zIndexRange={[5, 0]}>
          <div style={{
            color: hovered ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: hovered ? '0.62rem' : '0.55rem',
            fontWeight: 600,
            userSelect: 'none',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}>
            {config.name}
          </div>
        </Html>
      )}
    </group>
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
      {config.moons && config.moons.map((m, i) => (
        <Moon key={i} config={m} labelsHidden={labelsHidden} onSelect={onSelect} hostPlanet={data} />
      ))}

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
  const [companionHovered, setCompanionHovered] = useState(false);
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

  const charonData = useMemo(() => {
    const found = moons.find((m) => m.name.toLowerCase() === 'charon');
    return found || {
      name: 'Charon',
      planet: 'Pluto',
      diameter: '1,212 km',
      orbitalPeriod: '6.4 days',
      funFact: 'So large compared to Pluto that they orbit a shared barycenter outside Pluto.'
    };
  }, []);

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
      <mesh
        ref={companionRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            ...charonData,
            name: 'Charon',
            size: config.binary.companionSize,
            distance: config.binary.distance,
            speed: config.binary.speed,
            color: config.binary.color,
            isMoon: true,
            hostPlanet: data
          });
        }}
        onPointerOver={(e) => { e.stopPropagation(); setCompanionHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setCompanionHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.binary.companionSize, 32, 32]} />
        <meshStandardMaterial
          color={config.binary.color}
          emissive={config.binary.color}
          emissiveIntensity={companionHovered ? 0.3 : 0}
          roughness={0.8}
        />
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
            color: companionHovered ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: companionHovered ? '0.62rem' : '0.55rem',
            fontWeight: 600,
            userSelect: 'none',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}>
            {config.binary.companionName}
          </div>
        </Html>
      </group>
    </group>
  );
});

/* ─── Educational Badges for Moons ─── */
const MOON_BADGES = {
  ganymede: { icon: Globe, title: 'Largest Moon in Solar System', color: '#b5a48e', text: 'Bigger than the planet Mercury and dwarf planet Pluto.' },
  titan: { icon: Wind, title: 'Atmosphere & Methane Lakes', color: '#d39c55', text: 'The only moon in the solar system with a dense atmosphere and rivers/lakes of liquid methane.' },
  io: { icon: Flame, title: 'Volcanic Powerhouse', color: '#d9a74a', text: 'Over 400 active volcanoes make Io the most volcanically active world in the solar system.' },
  europa: { icon: Sparkles, title: 'Subsurface Water Ocean', color: '#e6dfd1', text: "Conceals a global liquid ocean beneath its icy shell holding twice as much water as Earth's oceans combined." },
  callisto: { icon: Mountain, title: 'Cratered Veteran', color: '#8a8074', text: 'The most heavily cratered surface in the solar system, virtually unchanged for 4 billion years.' },
  triton: { icon: RefreshCcw, title: 'Retrograde Orbit', color: '#b3c2c7', text: "Orbits Neptune backwards relative to the planet's rotation — a captured Kuiper Belt object." },
  moon: { icon: Sparkles, title: "Earth's Partner", color: '#dddddd', text: "Stabilizes Earth's axial tilt and drives ocean tides; the only celestial world humans have stepped on." },
  luna: { icon: Sparkles, title: "Earth's Partner", color: '#dddddd', text: "Stabilizes Earth's axial tilt and drives ocean tides; the only celestial world humans have stepped on." },
  charon: { icon: Orbit, title: 'Double Dwarf Partner', color: '#888888', text: 'Tidally locked with Pluto so both worlds forever show the exact same face to each other.' },
  phobos: { icon: Gauge, title: 'Ultra-Close Orbit', color: '#aa7766', text: 'Orbits Mars closer than any other moon orbits its planet — completing an orbit in just 7.6 hours.' },
  deimos: { icon: Mountain, title: 'Tiny Outer Satellite', color: '#bbaa99', text: 'Small, potato-shaped outer Martian moon measuring only 12 km across.' },
  enceladus: { icon: Sparkles, title: 'Cryovolcano Geysers', color: '#e6f2ff', text: 'Erupts towering geysers of water ice and organic compounds from warm fracture zones at its south pole.' },
  mimas: { icon: Orbit, title: 'Herschel Crater World', color: '#aaaaaa', text: 'Dominated by the colossal 130 km wide Herschel impact crater.' },
  rhea: { icon: Globe, title: 'Icy Rings Candidate', color: '#cccccc', text: "Saturn's second-largest moon, composed predominantly of dense water ice." },
  iapetus: { icon: Sparkles, title: 'Two-Tone World', color: '#d4af37', text: 'Features a dramatic contrast with one coal-dark hemisphere and one snow-white hemisphere.' },
  dione: { icon: Mountain, title: 'Fractured Ice Cliffs', color: '#b0c4de', text: 'Crisscrossed by bright, miles-high ice cliffs formed by ancient tectonic fracturing.' },
  tethys: { icon: Mountain, title: 'Odysseus Crater Giant', color: '#c0c0c0', text: 'Cut by the massive 2,000 km long Ithaca Chasma trench and the giant Odysseus crater.' },
  titania: { icon: Globe, title: 'Fairyland Queen', color: '#b0e0e6', text: "The largest moon of Uranus, carved by massive fault lines and rift valleys." },
  oberon: { icon: Mountain, title: 'Ancient Outer Titan', color: '#a9a9a9', text: 'Outermost major moon of Uranus, heavily pitted by ancient asteroid bombardments.' },
  umbriel: { icon: Orbit, title: 'Dark Ice World', color: '#708090', text: "The darkest of Uranus's major moons, reflecting only half as much light as Ariel." },
  ariel: { icon: Sparkles, title: 'Bright Slush Valleys', color: '#afeeee', text: "Features the youngest and brightest surface of Uranus's moons, flooded by ancient ice volcanoes." }
};

/* ─── Info Panel Component ─── */
function InfoPanel({ planet, onSelect, onClose }) {
  if (!planet) return null;

  // Mouse drag-scroll handlers for Satellite Explorer strip
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    if (!scrollRef.current) return;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  // Determine host planet and active target (planet vs moon)
  const hostPlanet = planet.isMoon ? planet.hostPlanet : planet;
  const activeTarget = planet;

  // Gather available moons for the host planet
  const availableMoons = useMemo(() => {
    if (!hostPlanet) return [];
    const cfg = PLANET_CONFIG[hostPlanet.name];
    const moonList = [];

    if (cfg && cfg.moons) {
      cfg.moons.forEach((m) => {
        const found = moons.find((item) => item.name.toLowerCase() === m.name.toLowerCase());
        moonList.push({
          ...found,
          ...m,
          name: m.name
        });
      });
    }

    if (cfg && cfg.binary && cfg.binary.companionName) {
      const found = moons.find((item) => item.name.toLowerCase() === cfg.binary.companionName.toLowerCase());
      moonList.push({
        ...found,
        name: cfg.binary.companionName,
        size: cfg.binary.companionSize,
        distance: cfg.binary.distance,
        speed: cfg.binary.speed,
        color: cfg.binary.color
      });
    }

    return moonList;
  }, [hostPlanet]);

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '0 12px 16px', animation: 'slideUp 0.3s ease' }}>
      <div style={{
        maxWidth: 420, margin: '0 auto',
        maxHeight: '52vh', overflowY: 'auto',
        background: 'rgba(11,13,34,0.92)',
        backdropFilter: 'blur(18px)',
        borderRadius: '20px 20px 16px 16px',
        padding: '18px 20px 16px', color: '#fff',
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 6px 0 #07081a',
      }}>
        {/* Close Button - dedicated top-right position */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', transition: 'background 0.2s', zIndex: 10
        }}>
          <X size={16} />
        </button>

        {/* Top Header: Avatar + Title (has right padding to clear X button) */}
        {activeTarget.isMoon ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, paddingRight: 44 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: activeTarget.color || '#aaa',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Circle size={24} style={{ color: '#fff', fill: 'rgba(255,255,255,0.4)' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px' }}>{activeTarget.name}</h3>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                Natural Satellite of {hostPlanet.name}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, paddingRight: 44 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
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
        )}

        {/* Dedicated Satellite Explorer Bar (Below Header, full width, smooth swipe + mouse drag!) */}
        {availableMoons.length > 0 && (
          <div style={{
            marginBottom: 14, padding: '8px 10px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <div style={{
              fontSize: '0.62rem', fontWeight: 800, color: '#FDB813',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <Orbit size={12} color="#FDB813" /> SATELLITES OF {hostPlanet.name.toUpperCase()} ({availableMoons.length})
            </div>
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
                touchAction: 'pan-x', WebkitOverflowScrolling: 'touch',
                cursor: 'grab', userSelect: 'none'
              }}
            >
              <button
                onClick={() => onSelect(hostPlanet)}
                style={{
                  background: !activeTarget.isMoon ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                  border: !activeTarget.isMoon ? `1.5px solid ${hostPlanet.color || '#fff'}` : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '4px 10px', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.2s ease', flexShrink: 0
                }}
              >
                <Globe size={11} /> {hostPlanet.name}
              </button>
              {availableMoons.map((m) => {
                const isSelected = activeTarget.isMoon && activeTarget.name.toLowerCase() === m.name.toLowerCase();
                return (
                  <button
                    key={m.name}
                    onClick={() => onSelect({ ...m, isMoon: true, hostPlanet })}
                    style={{
                      background: isSelected ? 'rgba(253,184,19,0.25)' : 'rgba(255,255,255,0.06)',
                      border: isSelected ? '1.5px solid #FDB813' : '1.5px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '4px 10px',
                      color: isSelected ? '#FDB813' : 'rgba(255,255,255,0.75)',
                      fontSize: '0.7rem', fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.2s ease', flexShrink: 0
                    }}
                  >
                    <Circle size={8} style={{ fill: isSelected ? '#FDB813' : 'rgba(255,255,255,0.6)' }} /> {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Card Details (Moon vs Planet) */}
        {activeTarget.isMoon ? (
          <div>
            {/* Moon Educational Badge */}
            {MOON_BADGES[activeTarget.name.toLowerCase()] && (() => {
              const badge = MOON_BADGES[activeTarget.name.toLowerCase()];
              const BadgeIcon = badge.icon;
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 12px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 800, color: badge.color, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    <BadgeIcon size={12} /> {badge.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{badge.text}</p>
                </div>
              );
            })()}

            {/* Moon Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 14 }}>
              {[
                { label: 'Diameter', value: activeTarget.diameter || '—' },
                { label: 'Orbital Period', value: activeTarget.orbitalPeriod || '—' },
                { label: 'Discovered By', value: activeTarget.discoveredBy || 'Antiquity' },
                { label: 'Discovery Year', value: activeTarget.discoveredYear || 'Ancient' }
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Moon Fun Fact */}
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px',
              border: '1.5px solid rgba(255,255,255,0.08)', marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Info size={13} style={{ color: '#FDB813', opacity: 0.8 }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FDB813', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fun Fact</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
                {activeTarget.funFact || `A natural satellite orbiting ${hostPlanet.name} in our solar system.`}
              </p>
            </div>
          </div>
        ) : (
          <div>
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
        )}
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
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(11, 13, 34, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, transition: 'opacity 0.4s ease'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(253, 184, 19, 0.2)',
        borderTopColor: '#FDB813',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
        Loading 3D Solar System ({Math.round(progress)}%)
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main 3D Solar Explorer Page ─── */
export default function SolarSystem3D() {
  const navigate = useNavigate();
  const controlsRef = useRef();
  const planetRefs = useRef({});
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#07081a', overflow: 'hidden' }}>
      {/* Loading Overlay */}
      <SolarLoadingOverlay />

      {/* Navigation Bar */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 40,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <button
          onClick={() => navigate('/space')}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 24,
            background: 'rgba(11,13,34,0.72)', backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 0 #07081a',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 20,
          background: 'rgba(11,13,34,0.72)', backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          boxShadow: '0 4px 0 #07081a',
        }}>
          🪐 SOLAR EXPLORER
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [20, 45, 75], fov: 45, near: 0.1, far: 2500 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050614']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3.5} distance={500} decay={0.3} color="#fff8e7" />

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

      <InfoPanel planet={selected} onSelect={setSelected} onClose={() => setSelected(null)} />

      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
