import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Preload, useProgress } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Info, Gauge, Flame, Leaf, Mountain, Globe, Sparkles, RefreshCcw, Wind, Orbit, Zap, Circle, Pause, Play, FastForward, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Rocket } from 'lucide-react';
import * as THREE from 'three';
import { planets, sunData, dwarfPlanets, moons, parkerSolarProbe } from '../../data/space-data.js';
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
  Orcus: '/textures/objects/orcus.jpg',

  // Custom Moon/Satellite textures
  Luna: '/textures/objects/moon.jpg',
  Moon: '/textures/objects/moon.jpg',
  Io: '/textures/objects/io.jpg',
  Europa: '/textures/objects/europa.jpg',
  Ganymede: '/textures/objects/ganymede.jpg',
  Callisto: '/textures/objects/callisto.jpg',
  Titan: '/textures/objects/titan.jpg',
  Tethys: '/textures/objects/tethys.jpg',
  Dione: '/textures/objects/dione.jpg',
  Rhea: '/textures/objects/rhea.jpg',
  Iapetus: '/textures/objects/iapetus.jpg',
  Ariel: '/textures/objects/ariel.jpg',
  Oberon: '/textures/objects/oberon.jpg',
  Titania: '/textures/objects/titania.jpg',
  Triton: '/textures/objects/triton.jpg',
  Charon: '/textures/objects/charon.jpg',

  // Fallbacks for moons/companions without explicit texture files
  Phobos: '/textures/objects/moon.jpg',
  Deimos: '/textures/objects/moon.jpg',
  Enceladus: '/textures/objects/europa.jpg',
  Mimas: '/textures/objects/moon.jpg',
  Umbriel: '/textures/objects/moon.jpg',
  Vanth: '/textures/objects/moon.jpg',
  'Parker Solar Probe': '/textures/objects/parker_solar_probe.png',
};

/* Planet & Moon orbital configs
   Distances: Logarithmically scaled relative orbits (Mercury 10.5 -> Pluto 68.0 -> Orcus 74.0)
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
  Mars:    { size: 0.28, orbit: 18.5, speed: 0.8, emissive: '#aa4422', emissiveIntensity: 0, rotationSpeed: 0.005, tilt: 0.44, moons: [
    { name: 'Phobos', size: 0.04, distance: 0.65, speed: 3.5, color: '#aa7766' },
    { name: 'Deimos', size: 0.03, distance: 0.95, speed: 2.2, color: '#bbaa99' }
  ]},
  Ceres:   { size: 0.042, orbit: 22.5, speed: 0.6, emissive: '#c8c2b8', emissiveIntensity: 0, rotationSpeed: 0.003, tilt: 0.04 },
  Jupiter: { size: 1.60, orbit: 29.5, speed: 0.44, emissive: '#c49a6c', emissiveIntensity: 0, rotationSpeed: 0.012, tilt: 0.05, moons: [
    { name: 'Io', size: 0.164, distance: 2.2, speed: 2.5, color: '#d9a74a' },
    { name: 'Europa', size: 0.140, distance: 2.9, speed: 1.8, color: '#e6dfd1' },
    { name: 'Ganymede', size: 0.237, distance: 3.7, speed: 1.2, color: '#b5a48e' },
    { name: 'Callisto', size: 0.217, distance: 4.5, speed: 0.8, color: '#8a8074' }
  ]},
  Saturn:  { size: 1.30, orbit: 39.0, speed: 0.32, emissive: '#d4c07a', emissiveIntensity: 0, rotationSpeed: 0.011, tilt: 0.47, moons: [
    { name: 'Enceladus', size: 0.035, distance: 3.1, speed: 2.6, color: '#e6f2ff' },
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
  Orcus:   { size: 0.041, orbit: 72.0, speed: 0.16, emissive: '#94a3b8', emissiveIntensity: 0, rotationSpeed: 0.002, tilt: 0.36, binary: { companionName: 'Vanth', companionSize: 0.020, distance: 0.45, speed: 1.0, color: '#78869b', massRatio: 0.12 } },
};

/* ─── Educational badges shown in the Info Panel ─── */
const PLANET_BADGES = {
  sun: {
    icon: Zap, title: 'Galactic Voyager', color: '#FDB813',
    text: "The Sun orbits the center of the Milky Way at roughly 230 km/s (about 828,000 km/h), taking approximately 225\u2013250 million years to complete a single galactic orbit."
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
    icon: Globe, title: 'Densest Planet', color: '#2b82c9',
    text: 'With an average density of 5.51 g/cm\u00b3, Earth is the densest planet in the Solar System \u2014 compressed by its massive iron-nickel core deep beneath the surface.'
  },
  mars: {
    icon: Mountain, title: 'Red Planet', color: '#c1440e',
    text: 'Covered in rusty iron oxide dust, creating its signature crimson surface and pinkish sky.'
  },
  jupiter: {
    icon: Globe, title: 'Sun Wobbler', color: '#d39c7e',
    text: 'Jupiter is so massive that the Sun-Jupiter barycenter \u2014 their shared center of mass \u2014 sits about 46,000 km above the Sun\u2019s surface, making the Sun visibly wobble.'
  },
  saturn: {
    icon: Sparkles, title: 'Lighter Than Water', color: '#ead6b8',
    text: 'Saturn\u2019s average density is just 0.687 g/cm\u00b3 \u2014 lower than liquid water. In a hypothetical ocean large enough, Saturn would float.'
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
    icon: Orbit, title: 'Barycenter Pair', color: '#ffcc66',
    text: "Every orbiting pair shares a barycenter \u2014 a gravitational balance point. Pluto\u2019s barycenter with Charon lies in open space between them, making both bodies visibly orbit each other."
  },
  'parker-solar-probe': {
    icon: Rocket, title: 'Gravity Assist Pioneer', color: '#c0c0c0',
    text: 'Uses repeated Venus flybys to shed orbital energy and fall closer to the Sun \u2014 a technique called a gravity assist, where a spacecraft borrows or surrenders speed by flying near a planet\u2019s gravitational field.'
  },
  orcus: {
    icon: Orbit, title: 'Anti-Pluto Pair', color: '#94a3b8',
    text: "Orbits the Sun in a 247-year resonance mirroring Pluto; paired with its massive binary moon Vanth."
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
function AsteroidBelt({ count = 3500, innerRadius = 21.0, outerRadius = 24.0, simTimeRef }) {
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
  useFrame(() => {
    if (ref.current && simTimeRef) ref.current.rotation.y = simTimeRef.current * 0.015;
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
const Sun = React.forwardRef(({ onSelect, labelsHidden, simTimeRef, simSpeed }, ref) => {
  const groupRef = useRef();
  React.useImperativeHandle(ref, () => groupRef.current);
  
  const meshRef = useRef();
  const sunTexture = useTexture(TEXTURE_PATHS.Sun);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05 * simSpeed;
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

      <pointLight color="#FDB813" intensity={400} distance={400} decay={1} />
      {!labelsHidden && (
        <Html position={[0, -4.8, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
          <div style={{
            color: '#FDB813', fontSize: '0.75rem', fontWeight: 700,
            textShadow: '0 0 10px rgba(253,184,19,0.8)', userSelect: 'none', letterSpacing: '1px',
          }}>
            SUN
          </div>
        </Html>
      )}
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
  
  const currentZoomDist = useRef(7.0);
  const isTransitioning = useRef(false);

  useFrame(({ camera, clock }, delta) => {
    if (!controlsRef.current) return;

    // Detect transition from unselected to selected: save pre-click view state!
    if (selected && (!prevSelected.current || prevSelected.current.name !== selected.name)) {
      savedCamPos.current = camera.position.clone();
      savedCamTarget.current = controlsRef.current.target.clone();
      isRestoring.current = false;
      isTransitioning.current = true;

      // Compute defaultZoomDist immediately to initialize currentZoomDist
      const targetObj = selected.isMoon ? selected.hostPlanet : selected;
      const cfg = PLANET_CONFIG[targetObj.name];
      let defaultZoomDist = 7.0;
      if (targetObj.id === 'sun') {
        defaultZoomDist = 15.0;
      } else if (targetObj.id === 'parker-solar-probe') {
        defaultZoomDist = 3.0;
      } else if (cfg) {
        if (cfg.size >= 1.3) defaultZoomDist = 9.5;
        else if (cfg.size >= 0.8) defaultZoomDist = 6.2;
        else if (cfg.size >= 0.25) defaultZoomDist = 4.2;
        else defaultZoomDist = 3.2;
      }
      currentZoomDist.current = defaultZoomDist;
    }

    // Detect transition from selected to unselected: keep view as is!
    if (!selected && prevSelected.current) {
      isRestoring.current = false;
      savedCamPos.current = null;
      savedCamTarget.current = null;
      isTransitioning.current = false;
    }
    prevSelected.current = selected;

    if (selected) {
      const targetObj = selected.isMoon ? selected.hostPlanet : selected;
      const ref = planetRefs.current[targetObj.name];
      if (ref) {
        ref.getWorldPosition(planetPos);

        // Tailored close-up zoom distance based on host planet size
        const cfg = PLANET_CONFIG[targetObj.name];
        let defaultZoomDist = 7.0;
        if (targetObj.id === 'sun') {
          defaultZoomDist = 15.0;
        } else if (targetObj.id === 'parker-solar-probe') {
          defaultZoomDist = 3.0;
        } else if (cfg) {
          if (cfg.size >= 1.3) defaultZoomDist = 9.5;       // Jupiter, Saturn
          else if (cfg.size >= 0.8) defaultZoomDist = 6.2;   // Uranus, Neptune
          else if (cfg.size >= 0.25) defaultZoomDist = 4.2;  // Earth, Venus, Mars
          else defaultZoomDist = 3.2;                         // Mercury, Pluto, Ceres
        }

        // Camera view direction
        const camDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
        if (camDir.lengthSq() === 0) camDir.set(0, 0.5, 1).normalize();

        let targetZoom = currentZoomDist.current;
        const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

        if (isTransitioning.current) {
          targetZoom = defaultZoomDist;
          const verticalOffset = cameraUp.clone().multiplyScalar(-targetZoom * 0.34);
          desiredTarget.copy(planetPos).add(verticalOffset);
          desiredCamPos.copy(planetPos).add(camDir.multiplyScalar(targetZoom)).add(verticalOffset);

          const distToDesired = camera.position.distanceTo(desiredCamPos);
          if (distToDesired < 0.25) {
            isTransitioning.current = false;
            currentZoomDist.current = defaultZoomDist;
          }
        } else {
          // Transition complete: track manual zoom actions from OrbitControls
          const actualDist = camera.position.distanceTo(controlsRef.current.target);
          if (Math.abs(actualDist - currentZoomDist.current) > 0.01) {
            currentZoomDist.current = actualDist;
          }
          targetZoom = currentZoomDist.current;

          const verticalOffset = cameraUp.clone().multiplyScalar(-targetZoom * 0.34);
          desiredTarget.copy(planetPos).add(verticalOffset);
          desiredCamPos.copy(planetPos).add(camDir.multiplyScalar(targetZoom)).add(verticalOffset);
        }

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
function Moon({ config, labelsHidden, onSelect, hostPlanet, hostPlanetSize, simTimeRef, simSpeed }) {
  const groupRef = useRef();
  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    const t = simTimeRef ? simTimeRef.current : 0;
    const angle = initialAngle.current + t * config.speed;
    if (groupRef.current) {
      const R_planet = hostPlanetSize || 0.5;
      const scaledDistance = R_planet + (config.distance - R_planet) * 0.6 + 0.15;
      groupRef.current.position.x = Math.cos(angle) * scaledDistance;
      groupRef.current.position.z = Math.sin(angle) * scaledDistance;
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

  const selectHandler = (e) => {
    e.stopPropagation();
    onSelect({
      ...moonData,
      ...config,
      isMoon: true,
      hostPlanet,
      initialAngle: initialAngle.current
    });
  };

  const hitRadius = Math.max(config.size * 1.6, 0.45);

  const texture = useTexture(TEXTURE_PATHS[config.name] || TEXTURE_PATHS.Moon);

  return (
    <group ref={groupRef}>
      {/* Invisible expanded hit sphere for small moons */}
      <mesh
        onClick={selectHandler}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[hitRadius, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh
        onClick={selectHandler}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          color={TEXTURE_PATHS[config.name] ? '#ffffff' : (config.color || '#ffffff')}
          emissive={config.color}
          emissiveIntensity={hovered ? 0.25 : 0}
          roughness={0.8}
        />
      </mesh>
      {config.name && !labelsHidden && (
        <Html position={[0, -(config.size + 0.25), 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }} zIndexRange={[5, 0]}>
          <div
            onClick={selectHandler}
            style={{
              color: hovered ? '#fff' : 'rgba(255,255,255,0.7)',
              fontSize: hovered ? '0.62rem' : '0.55rem',
              fontWeight: 600,
              userSelect: 'none',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
          >
            {config.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Planet component ─── */
const Planet = React.forwardRef(({ data, config, onSelect, labelsHidden, simTimeRef, simSpeed, initialAngle }, ref) => {
  const groupRef = useRef();
  
  React.useImperativeHandle(ref, () => groupRef.current);

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(TEXTURE_PATHS[data.name] || TEXTURE_PATHS.Earth);
  const saturnRingTex = useTexture(TEXTURE_PATHS.SaturnRing);

  useFrame((_, delta) => {
    const t = simTimeRef ? simTimeRef.current : 0;
    const angle = initialAngle + (config.phaseOffset || 0) + t * config.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * config.orbit;
      groupRef.current.position.z = Math.sin(angle) * config.orbit;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = config.tilt || 0;
      meshRef.current.rotation.y += (config.rotationSpeed || 0.008) * simSpeed;
    }

  });

  const isSaturn = data.name === 'Saturn';
  const isUranus = data.name === 'Uranus';
  const hitRadius = Math.max(config.size * 1.5, 0.55);

  return (
    <group ref={groupRef}>
      {/* Invisible expanded hit sphere for small planets */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[hitRadius, 16, 16]} />
        <meshBasicMaterial visible={false} />
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
        <Moon key={i} config={m} labelsHidden={labelsHidden} onSelect={onSelect} hostPlanet={data} hostPlanetSize={config.size} simTimeRef={simTimeRef} simSpeed={simSpeed} />
      ))}

      {/* Uranus thin ring */}
      {isUranus && (
        <mesh rotation={[0.3, 0, Math.PI / 2]}>
          <ringGeometry args={[config.size * 1.3, config.size * 1.5, 64]} />
          <meshStandardMaterial color="#88bbcc" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label */}
      {!labelsHidden && (
        <Html position={[0, -(config.size + 0.4), 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }} zIndexRange={[5, 0]}>
          <div
            onClick={(e) => { e.stopPropagation(); onSelect(data); }}
            style={{
              color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
              fontSize: hovered ? '0.75rem' : '0.65rem',
              fontWeight: 700,
              textShadow: `0 0 8px ${data.color || '#888'}`,
              transition: 'all 0.2s ease',
              userSelect: 'none',
              letterSpacing: '0.5px',
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
});

/* ─── Binary Dwarf Planet System (Pluto + Charon, Orcus + Vanth) ───
   Both bodies orbit the group origin, which IS the barycenter (shared center
   of mass). massRatio = companion mass / primary mass; with Charon at 0.118,
   the barycenter lands outside Pluto's surface, just like the real system. */
const BinarySystem = React.forwardRef(({ data, config, onSelect, labelsHidden, selected, simTimeRef, simSpeed, initialAngle }, ref) => {
  const groupRef = useRef();
  React.useImperativeHandle(ref, () => groupRef.current);

  const primaryRef = useRef();
  const companionRef = useRef();
  const labelRef = useRef();
  const companionLabelRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [companionHovered, setCompanionHovered] = useState(false);
  const texture = useTexture(TEXTURE_PATHS[data.name] || TEXTURE_PATHS.Earth);
  const companionTexture = useTexture(TEXTURE_PATHS[config.binary.companionName] || TEXTURE_PATHS.Moon);

  const R_primary = config.size || 0.5;
  const D = R_primary + (config.binary.distance - R_primary) * 0.6 + 0.15;
  const ratio = config.binary.massRatio;
  const primaryOffset = (D * ratio) / (1 + ratio);
  const companionOffset = D / (1 + ratio);

  useFrame((_, delta) => {
    const t = simTimeRef ? simTimeRef.current : 0;
    // The whole system orbits the Sun on the primary's orbit path
    const angle = initialAngle + (config.phaseOffset || 0) + t * config.speed * 0.15;
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
      primaryRef.current.rotation.y += (config.rotationSpeed || 0.008) * simSpeed;
    }
    if (companionRef.current) {
      companionRef.current.position.x = -Math.cos(bAngle) * companionOffset;
      companionRef.current.position.z = -Math.sin(bAngle) * companionOffset;
      companionRef.current.rotation.y += 0.005 * simSpeed;
    }

    if (labelRef.current && primaryRef.current) {
      labelRef.current.position.copy(primaryRef.current.position);
    }
    if (companionLabelRef.current && companionRef.current) {
      companionLabelRef.current.position.copy(companionRef.current.position);
    }
  });

  const companionData = useMemo(() => {
    const found = moons.find((m) => m.name.toLowerCase() === config.binary.companionName.toLowerCase());
    return found || {
      name: config.binary.companionName,
      planet: data.name,
      diameter: '—',
      orbitalPeriod: '—',
      funFact: `Binary partner orbiting a shared barycenter outside ${data.name}.`
    };
  }, [config.binary.companionName, data.name]);

  const selectCompanionHandler = (e) => {
    e.stopPropagation();
    onSelect({
      ...companionData,
      name: config.binary.companionName,
      size: config.binary.companionSize,
      distance: config.binary.distance,
      speed: config.binary.speed,
      color: config.binary.color,
      isMoon: true,
      hostPlanet: data
    });
  };

  const primaryHitRadius = Math.max(config.size * 1.5, 0.55);
  const companionHitRadius = Math.max(config.binary.companionSize * 1.8, 0.45);

  return (
    <group ref={groupRef}>


      {/* Primary body (Pluto / Orcus) */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[primaryHitRadius, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
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

      {/* Companion body (Charon / Vanth) */}
      <mesh
        onClick={selectCompanionHandler}
        onPointerOver={(e) => { e.stopPropagation(); setCompanionHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setCompanionHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[companionHitRadius, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh
        ref={companionRef}
        onClick={selectCompanionHandler}
        onPointerOver={(e) => { e.stopPropagation(); setCompanionHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setCompanionHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[config.binary.companionSize, 32, 32]} />
        <meshStandardMaterial
          map={companionTexture}
          color={TEXTURE_PATHS[config.binary.companionName] ? '#ffffff' : (config.binary.color || '#ffffff')}
          emissive={config.binary.color}
          emissiveIntensity={companionHovered ? 0.25 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Primary label */}
      <group ref={labelRef}>
        {!labelsHidden && (
          <Html position={[0, -(config.size + 0.4), 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }} zIndexRange={[5, 0]}>
            <div
              onClick={(e) => { e.stopPropagation(); onSelect(data); }}
              style={{
                color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
                fontSize: hovered ? '0.75rem' : '0.65rem',
                fontWeight: 700,
                textShadow: `0 0 8px ${data.color || '#888'}`,
                transition: 'all 0.2s ease',
                userSelect: 'none',
                letterSpacing: '0.5px',
              }}
            >
              {data.name}
            </div>
          </Html>
        )}
      </group>

      {/* Companion label */}
      <group ref={companionLabelRef}>
        {!labelsHidden && (
          <Html position={[0, -(config.binary.companionSize + 0.3), 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }} zIndexRange={[5, 0]}>
            <div
              onClick={selectCompanionHandler}
              style={{
                color: companionHovered ? '#fff' : 'rgba(255,255,255,0.7)',
                fontSize: companionHovered ? '0.62rem' : '0.55rem',
                fontWeight: 600,
                userSelect: 'none',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
              }}
            >
              {config.binary.companionName}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
});

/* ─── Parker Solar Probe Config ─── */
const ORBIT_PHASES = [
  { a: 12.5, e: 0.05 }, // Phase 1: Near Venus, almost circular
  { a: 11.8, e: 0.13 }, // Phase 2: First assist
  { a: 11.0, e: 0.22 }, // Phase 3: Second assist
  { a: 10.2, e: 0.31 }, // Phase 4: Third assist
  { a: 9.5,  e: 0.41 }, // Phase 5: Fourth assist
  { a: 8.8,  e: 0.51 }, // Phase 6: Fifth assist
  { a: 8.4,  e: 0.55 }, // Phase 7: Final science orbit close to Sun
];

const PARKER_CONFIG = {
  speed: 1.8,            // fast orbital period
  size: 0.06,            // tiny — smaller than any moon
};

/* ─── Parker Solar Probe Component ─── */
const ParkerProbe = React.forwardRef(({ onSelect, labelsHidden, simTimeRef, simSpeed, venusInitialAngle }, ref) => {
  const groupRef = useRef();
  React.useImperativeHandle(ref, () => groupRef.current);

  const meshRef = useRef();
  const trailRef = useRef();
  const [hovered, setHovered] = useState(false);
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  // Gravity Assist simulation states
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [assistActive, setAssistActive] = useState(false);
  const assistTimeRef = useRef(0);
  const hasPassedVenus = useRef(false);

  // Store trail positions (last 150 frames)
  const trailPositions = useRef(new Float32Array(150 * 3).fill(0));
  const trailIndex = useRef(0);
  const trailCount = useRef(0);

  // Kepler solver: mean anomaly → eccentric anomaly via Newton's method
  const solveKepler = (M, e, iterations = 8) => {
    let E = M;
    for (let i = 0; i < iterations; i++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }
    return E;
  };

  useFrame(({ clock }) => {
    const t = simTimeRef ? simTimeRef.current : 0;
    const { speed } = PARKER_CONFIG;
    const { a, e } = ORBIT_PHASES[phaseIndex];

    // Mean anomaly progresses with time
    const M = initialAngle.current + t * speed * 0.15;
    const E = solveKepler(M % (Math.PI * 2), e);

    // True anomaly → position on ellipse
    const x = a * (Math.cos(E) - e);
    const z = a * Math.sqrt(1 - e * e) * Math.sin(E);

    if (groupRef.current) {
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
      // Force spacecraft to always point its heat shield (+Z) at the Sun (0, 0, 0)
      groupRef.current.lookAt(0, 0, 0);
    }

    // Dynamic Gravity Assist logic: check distance to Venus in real time
    if (venusInitialAngle !== undefined) {
      const venusR = 13.0; // PLANET_CONFIG.Venus.orbit
      const venusAngle = venusInitialAngle + t * 1.17 * 0.15; // 1.17 matches Venus speed
      const venusX = Math.cos(venusAngle) * venusR;
      const venusZ = Math.sin(venusAngle) * venusR;

      const dx = x - venusX;
      const dz = z - venusZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // If probe enters Venus gravity well, trigger phase shift & alert banner
      if (dist < 1.6 && !hasPassedVenus.current) {
        hasPassedVenus.current = true;
        const nextPhase = (phaseIndex + 1) % 7;
        setPhaseIndex(nextPhase);
        setAssistActive(true);
        assistTimeRef.current = clock.getElapsedTime();
      } else if (dist > 2.5) {
        hasPassedVenus.current = false;
      }
    }

    // Hide gravity assist banner after 3 seconds
    if (assistActive && clock.getElapsedTime() - assistTimeRef.current > 3.0) {
      setAssistActive(false);
    }

    // Update trail ring buffer
    const idx = trailIndex.current % 150;
    trailPositions.current[idx * 3] = x;
    trailPositions.current[idx * 3 + 1] = 0;
    trailPositions.current[idx * 3 + 2] = z;
    trailIndex.current++;
    trailCount.current = Math.min(trailCount.current + 1, 150);

    // Update trail geometry
    if (trailRef.current && trailCount.current > 2) {
      const geo = trailRef.current.geometry;
      const ordered = new Float32Array(trailCount.current * 3);
      const total = trailCount.current;
      const start = trailIndex.current % 150;
      for (let i = 0; i < total; i++) {
        const srcIdx = ((start - total + i + 150) % 150) * 3;
        ordered[i * 3] = trailPositions.current[srcIdx];
        ordered[i * 3 + 1] = trailPositions.current[srcIdx + 1];
        ordered[i * 3 + 2] = trailPositions.current[srcIdx + 2];
      }
      geo.setAttribute('position', new THREE.BufferAttribute(ordered, 3));
      geo.setDrawRange(0, total);
      geo.attributes.position.needsUpdate = true;
    }
  });

  const hitRadius = 0.5; // generous hit area for tiny probe

  return (
    <>
      <group ref={groupRef}>
        {/* Invisible expanded hit sphere */}
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(parkerSolarProbe); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[hitRadius, 8, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Floating Gravity Assist Alert Banner */}
        {assistActive && (
          <Html position={[0, 0.4, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: '#0b0d22',
              border: '1.5px solid #FDB813',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.55rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 0 #07081a',
              fontFamily: 'var(--font-heading, sans-serif)',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Rocket size={11} color="#38bdf8" /> Gravity Assist (Phase {phaseIndex + 1}/7)
            </div>
          </Html>
        )}

        {/* Spacecraft Assembly */}
        <group
          onClick={(e) => { e.stopPropagation(); onSelect(parkerSolarProbe); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          {/* 1. Thermal Protection System (TPS) Heat Shield: Hexagonal shape, white color, situated at the front (+Z) facing the Sun */}
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.012, 6]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* 2. Spacecraft Bus: main body, directly behind the shield along -Z, gold foil color */}
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.07, 6]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
          </mesh>

          {/* 3. Solar Panel Arrays: extend on the sides (+X and -X) behind the shield, blue/dark panels */}
          <mesh position={[0.08, 0, -0.015]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.08, 0.015, 0.003]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} emissive="#111827" />
          </mesh>
          <mesh position={[-0.08, 0, -0.015]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.015, 0.003]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} emissive="#111827" />
          </mesh>

          {/* 4. High-Gain Antenna (HGA): sticking out from the back (-Z) */}
          <mesh position={[0, -0.015, -0.045]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.025, 4]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.015, -0.058]}>
            <cylinderGeometry args={[0.01, 0, 0.004, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
          </mesh>
        </group>

        {/* Label */}
        {!labelsHidden && (
          <Html position={[0, -(PARKER_CONFIG.size + 0.3), 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }} zIndexRange={[5, 0]}>
            <div
              onClick={(e) => { e.stopPropagation(); onSelect(parkerSolarProbe); }}
              style={{
                color: hovered ? '#fff' : 'rgba(255,255,255,0.75)',
                fontSize: hovered ? '0.65rem' : '0.55rem',
                fontWeight: 700,
                userSelect: 'none',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
              }}
            >
              Parker Solar Probe
            </div>
          </Html>
        )}
      </group>

      {/* Orbital trail rendered in absolute world coordinates */}
      <line ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={new Float32Array(150 * 3)} count={0} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </line>
    </>
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
  moon: { icon: Sparkles, title: "Earth's Companion", color: '#dddddd', text: "The Moon's mass is only about 1.2% of Earth's, yet its diameter spans 27% of Earth's \u2014 roughly one-quarter its size \u2014 making it one of the largest moons relative to its parent planet." },
  luna: { icon: Sparkles, title: "Earth's Companion", color: '#dddddd', text: "The Moon's mass is only about 1.2% of Earth's, yet its diameter spans 27% of Earth's \u2014 roughly one-quarter its size \u2014 making it one of the largest moons relative to its parent planet." },
  charon: { icon: Orbit, title: 'Double Dwarf Partner', color: '#888888', text: 'Tidally locked with Pluto so both worlds forever show the exact same face to each other.' },
  vanth: { icon: Orbit, title: 'Barycentric Partner', color: '#78869b', text: 'So large relative to Orcus that both bodies orbit a shared center of mass outside Orcus.' },
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
function InfoPanel({ planet, onSelect, onClose, selected }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(false);
  }, [planet?.name]);

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
  const hostPlanet = planet?.isMoon ? planet.hostPlanet : planet;
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

  if (!planet) return null;

  return (
    <>
      {/* Floating Expand Tab & Close button when Collapsed */}
      {isCollapsed && (
        <div className="solar-infopanel-expand-group">
          <button
            onClick={() => setIsCollapsed(false)}
            className="solar-infopanel-expand-btn"
            title="Expand Info Panel"
          >
            <ChevronUp size={16} /> SHOW INFO
          </button>
          <button
            onClick={onClose}
            className="solar-infopanel-expand-close-btn"
            title="Close Panel and Return to Space View"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Slideable Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: isCollapsed ? 'translate(-50%, 110%)' : 'translate(-50%, 0)',
        maxWidth: 420,
        width: 'calc(100% - 24px)',
        maxHeight: '40vh',
        overflowY: 'auto',
        zIndex: 50,
        pointerEvents: 'auto',
        background: '#0b0d22',
        borderRadius: '20px',
        padding: '18px 20px 16px',
        color: '#fff',
        border: '2px solid #2d3561',
        boxShadow: '0 6px 0 #07081a',
        opacity: isCollapsed ? 0 : 1,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}>
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="solar-infopanel-btn collapse-btn"
            title="Collapse Panel"
          >
            <ChevronDown size={20} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="solar-infopanel-btn close-btn"
            title="Close Panel and Return to Space View"
          >
            <X size={20} />
          </button>

        {/* Top Header: Avatar + Title (has right padding to clear action buttons) */}
        {activeTarget.isMoon ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, paddingRight: 104 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, paddingRight: 104 }}>
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

        {/* Content Card Details (Spacecraft vs Moon vs Planet) */}
        {planet.type === 'Spacecraft' ? (
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
              {[{ label: 'Mass', value: planet.mass || '—' },
                { label: 'Orbital Period', value: planet.yearLength || '—' },
                { label: 'Perihelion', value: planet.distanceFromSun || '—' },
                { label: 'Shield Temp', value: planet.temperature?.split('/')[0]?.trim() || '—' }].map((stat) => (
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
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: planet.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mission Fact</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>{planet.funFacts?.[0] || 'No fact available.'}</p>
            </div>
          </div>
        ) : activeTarget.isMoon ? (
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
              {[planet.id === 'sun' ? { label: 'Planets', value: '8' } : { label: 'Moons', value: planet.moons },
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
    </>
  );
}

/* ─── Simulation Clock Updater ─── */
function TimeUpdater({ simSpeed, simTimeRef }) {
  useFrame((_, delta) => {
    simTimeRef.current += delta * simSpeed;
  });
  return null;
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

/* ─── Main 3D Solar Explorer Page ─── */
export default function SolarSystem3D() {
  const navigate = useNavigate();
  const controlsRef = useRef();
  const planetRefs = useRef({});
  const [selected, setSelected] = useState(null);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [speedPanelOpen, setSpeedPanelOpen] = useState(false);
  const simTimeRef = useRef(0);

  // Pre-calculate starting angles to ensure absolute orbital mirrors (e.g. Pluto vs Orcus)
  const initialAngles = useMemo(() => {
    const angles = {};
    planets.concat(dwarfPlanets).forEach((p) => {
      angles[p.name] = Math.random() * Math.PI * 2;
    });
    if (angles['Pluto'] !== undefined) {
      angles['Orcus'] = angles['Pluto'] + Math.PI;
    }
    return angles;
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#07081a', overflow: 'hidden' }}>
      {/* Loading Overlay */}
      <SolarLoadingOverlay />

      {/* Speed Controller Sidebar Drawer Widget */}
      <div className={`solar-speed-controller ${speedPanelOpen ? 'open' : 'closed'}`}>
        {/* Toggle Tab Button on side */}
        <button
          className="solar-speed-toggle-tab"
          onClick={() => setSpeedPanelOpen(!speedPanelOpen)}
          title={speedPanelOpen ? "Hide Speed Panel" : "Show Speed Panel"}
        >
          <Gauge size={14} />
          {speedPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          <span style={{ fontSize: '0.55rem', fontWeight: 800 }}>
            {simSpeed === 0 ? 'PAUSE' : `${simSpeed.toFixed(1)}x`}
          </span>
        </button>

        <div className="solar-speed-header">
          <Gauge size={12} /> SPEED
        </div>

        <button
          className={`solar-speed-btn freeze-btn ${simSpeed === 0 ? 'active' : ''}`}
          onClick={() => setSimSpeed(simSpeed === 0 ? 1.0 : 0)}
          title="Pause/Freeze simulation movement"
        >
          {simSpeed === 0 ? <Play size={12} /> : <Pause size={12} />}
          {simSpeed === 0 ? 'FROZEN' : 'FREEZE'}
        </button>

        <div className="solar-speed-slider-container">
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={simSpeed}
            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
            className="solar-speed-slider"
            title={`Speed: ${simSpeed.toFixed(2)}x`}
          />
        </div>

        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: simSpeed === 0 ? '#60a5fa' : '#ffd000' }}>
          {simSpeed === 0 ? '0.00x' : `${simSpeed.toFixed(2)}x`}
        </div>

        <div className="solar-speed-preset-group">
          {[0.25, 0.5, 1.0, 2.0].map((preset) => (
            <button
              key={preset}
              className={`solar-speed-btn ${simSpeed === preset ? 'active' : ''}`}
              onClick={() => setSimSpeed(preset)}
            >
              {preset === 2.0 ? <FastForward size={10} /> : null}
              {preset}x
            </button>
          ))}
        </div>
      </div>

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
            background: '#0b0d22',
            border: '1.5px solid #232752', color: '#fff',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 0 #07081a',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 20,
          background: '#0b0d22',
          border: '1.5px solid #232752', color: '#cbd5e1',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          boxShadow: '0 4px 0 #07081a',
        }}>
          <Globe size={14} color="#38bdf8" /> SOLAR EXPLORER
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="solar-canvas-container" style={{ width: '100%', height: '100%' }}>
        <Canvas
          camera={{ position: [20, 45, 75], fov: 45, near: 0.1, far: 2500 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#050614']} />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#b0c4de', '#080810', 0.15]} />
          <pointLight position={[0, 0, 0]} intensity={3.5} distance={500} decay={0.3} color="#fff8e7" />

          {/* Distant tiny background stars */}
          <Stars radius={1800} depth={200} count={16000} factor={2.5} saturation={0} fade speed={0.03} />
          {/* Colorful near/medium star clusters for rich visual variety */}
          <Stars radius={1200} depth={400} count={4000} factor={5.5} saturation={0.7} fade speed={0.08} />
          <OrbitControls
            ref={controlsRef}
            enableZoom
            enablePan
            screenSpacePanning={true}
            minDistance={3}
            maxDistance={1200}
            autoRotate={!selected && simSpeed > 0}
            autoRotateSpeed={0.08}
            maxPolarAngle={Math.PI - 0.05}
            minPolarAngle={0.01}
          />
          <CameraController selected={selected} planetRefs={planetRefs} controlsRef={controlsRef} />
          <TimeUpdater simSpeed={simSpeed} simTimeRef={simTimeRef} />
          <Suspense fallback={null}>
            <Sun ref={(el) => planetRefs.current['Sun'] = el} onSelect={setSelected} labelsHidden={!!selected} simTimeRef={simTimeRef} simSpeed={simSpeed} />
            <AsteroidBelt simTimeRef={simTimeRef} />
            <ParkerProbe 
              ref={(el) => planetRefs.current['Parker Solar Probe'] = el} 
              onSelect={setSelected} 
              labelsHidden={!!selected} 
              simTimeRef={simTimeRef} 
              simSpeed={simSpeed}
              venusInitialAngle={initialAngles['Venus']}
            />
            {(() => {
              const renderedOrbits = new Set();
              return planets.concat(dwarfPlanets).map((p) => {
                const cfg = PLANET_CONFIG[p.name];
                if (!cfg) return null;
                const showRing = !renderedOrbits.has(cfg.orbit);
                if (showRing) renderedOrbits.add(cfg.orbit);
                return (
                  <React.Fragment key={p.id}>
                    {showRing && <OrbitRing radius={cfg.orbit} />}
                    {cfg.binary ? (
                      <BinarySystem 
                        ref={(el) => planetRefs.current[p.name] = el}
                        data={p} 
                        config={cfg} 
                        onSelect={setSelected} 
                        labelsHidden={!!selected}
                        selected={selected}
                        simTimeRef={simTimeRef}
                        simSpeed={simSpeed}
                        initialAngle={initialAngles[p.name]}
                      />
                    ) : (
                      <Planet 
                        ref={(el) => planetRefs.current[p.name] = el}
                        data={p} 
                        config={cfg} 
                        onSelect={setSelected} 
                        labelsHidden={!!selected}
                        simTimeRef={simTimeRef}
                        simSpeed={simSpeed}
                        initialAngle={initialAngles[p.name]}
                      />
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      <InfoPanel planet={selected} onSelect={setSelected} onClose={() => setSelected(null)} selected={selected} />

      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
